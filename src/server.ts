import { SQL, type BunRequest } from "bun"
import { LinkTable, type LinkReadable } from './models/link.ts'
import { PostTable, type PostReadable } from './models/post.ts'
import index from './client/pages/index.html'
import * as zod from 'zod'
import type { Config } from './config'
import { SubmitPostRoute }from './actions/submit-post.ts'
import { validateSchema } from './handlers/validate.ts'
import { getOrCreateLink, getLinkForURL } from './actions/make-post.ts'
import { IndexRouteHandler } from "./handlers/index-route-handler"
import { PostRouteHandler } from "./handlers/post-route-handler"
import { SignUpRouteHandler } from "./handlers/sign-up-route-handler"
import { LinkRouteHandler } from "./handlers/link-route-handler"
import { UserTable } from "./models/user.ts"
import { SessionTable } from "./models/session.ts"
import { LoginRouteHandler } from "./handlers/login-route-handler.ts"
import { redirectIfLoggedIn } from "./auth/redirect-if-logged-in.ts"
// const sql = new SQL(LocalConfig.database.path)

// Initialize database schema
// await sql.file('./src/migrations/schema.sql')

// const linkTable = new LinkTable(sql)
// const postTable = new PostTable(sql)

// Protects against forgotten awaits
function success(json: { [key: string]: PostReadable[] | PostReadable | LinkReadable | null }) {
  return Response.json(json)
}

// TODOs:
// 3. Add sign up + authentication
// 4. Add viewing users posts
// 5. Add sessions

class CreatePostHandlerAPI {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  // TODO: validate user id matches logged in user
  async validate(req: BunRequest) {
    const data = await validateSchema(zod.object({
      url: zod.url(), 
      user_id: zod.coerce.number(), 
      blurb: zod.string().optional()
    }), req)

    if (data instanceof Response) return data

    // In theory, Zod should filter these, but maybe in the future we relax Zod to allow better errors.
    const url = URL.parse(data.url)
    if (!url) return Response.json({ message: 'Invalid URL in API body' }, { status: 400 })

    return { url, user_id: data.user_id, blurb: data.blurb }
  }

  async handle(req: BunRequest) {
    let data = await this.validate(req)
    if (data instanceof Response) return data 

    const link = await getOrCreateLink(this.app, data.url.href)
    const post = await this.app.postTable.insert({
      link_id: link.id, 
      url: data.url.href, 
      user_id: data.user_id, 
      blurb: data.blurb ?? null
    })

    return success({ post: post })
  }
}

async function handleGetPost(app: App, postId: string, req: BunRequest) {
  const post = (await app.sql`select * from post where id = ${postId}`)[0]
  return success({ post: post })
}

// TODO: wrap handlers so they can return well typed responses
async function handleFindPosts(app: App, req: BunRequest) {
  let data = await validateSchema(zod.object({ url: zod.string() }), req)
  if (data.url === '*') {
    return getAllPosts(app)
  }
  else {
    data = await validateSchema(zod.object({ url: zod.url() }), req)
    if (data instanceof Response) return data
    return getPostsWithURL(app, data.url)
  }
}

// TODO: add pagination
async function getAllPosts(app: App) {
  const posts = await app.postTable.getAll()
  return success({ posts: posts })
}

async function getPostsWithURL(app: App, url: string) {
  const link = await getLinkForURL(app, url)
  if (!link) return success({ posts: [] })

  const posts = await app.postTable.fromLinkId(link.id)
  return success({ posts: posts, link: link })
}

async function handleGetLinkFromURL(app: App, req: BunRequest) {
  const data = await validateSchema(zod.object({url: zod.url()}), req)
  if (data instanceof Response) return data

  // URL.parse also does some normalization, so we must always parse it...
  const link = await getLinkForURL(app, data.url)
  console.log(link)
  return success({ link: link })
}

async function getFeed(app: App) {
  const feed = await app.sql`
    select p.url, p.blurb, u.username 
    from post p
    full outer join user u on p.user_id = u.id
    order by p.created_at desc
  `
  return Response.json({ feed: feed })
}

const staticRoutes = [
  "/static/routed-gothic/stylesheet.css",
  "/static/routed-gothic/RoutedGothicWide.woff",
  "/static/routed-gothic/RoutedGothicWide.woff2",
].reduce((acc, path) => {
  acc[path] = new Response(Bun.file('./src/client' +path))
  return acc
}, {} as Record<string, Response>)

class App {
  sql: SQL
  linkTable: LinkTable
  postTable: PostTable
  userTable: UserTable
  sessionTable: SessionTable

  constructor(public config: Config) {
    this.sql = new SQL(this.config.database.path)
    this.linkTable = new LinkTable(this.sql)
    this.postTable = new PostTable(this.sql)
    this.userTable = new UserTable(this.sql)
    this.sessionTable = new SessionTable(this.sql)
  }
  static new = (config: Config) => new App(config)

  async start() {
    // Set up schema
    await this.sql.file('./src/migrations/schema.sql')

    let port = this.config.server.port || 2000
    this.serve(port)
    console.log(`Serving: http://localhost:${port}`)
  }

  serve(port: number) {
    Bun.serve({
      routes: {
        "/": {
          GET: (req) => IndexRouteHandler.new(this).handleGet(req)
        },
        "/login": {
          GET: (req) => redirectIfLoggedIn(this, req, "/", LoginRouteHandler.new(this).handleGet),
          POST: (req) => redirectIfLoggedIn(this, req, "/", LoginRouteHandler.new(this).handlePost)
        },
        "/sign-up": {
          GET: (req) => redirectIfLoggedIn(this, req, "/", SignUpRouteHandler.new(this).handleGet),
          POST: (req) => redirectIfLoggedIn(this, req, "/", SignUpRouteHandler.new(this).handlePost)
        },
        "/post": (req) => PostRouteHandler.new(this).handle(req),
        // Don't forget to update LinkRouteHandler.route if you change this
        "/link/:id": (req) => LinkRouteHandler.new(this).handle(req, req.params.id),
        ...staticRoutes
      },
      error(err) {
        console.error("Server error:", err)
        return new Response("Something went wrong!", { status: 500 })
      },
      port: port
    })
  }
}

export default App