import LocalConfig from './config.dev'
import { SQL, type BunRequest } from "bun"
import { LinkTable, type Link } from './model/link'
import { PostTable, type Post } from './model/post'
import normalizeUrl from 'normalize-url'
import index from './client/index.html'
import * as zod from 'zod'
import type { Config } from './config'

// const sql = new SQL(LocalConfig.database.path)

// Initialize database schema
// await sql.file('./src/migrations/schema.sql')

// const linkTable = new LinkTable(sql)
// const postTable = new PostTable(sql)

// Protects against forgotten awaits
function success(json: { [key: string]: Post[] | Post | Link | null }) {
  return Response.json(json)
}

// https://developers.cloudflare.com/rules/normalization/how-it-works/
// Need to normalize things like trailing slashes at root level (sometimes relevant when non root)
// Sort query strings, etc...
// TODO: We should also handle: https://publicsuffix.org/list/public_suffix_list.dat
// Try to normalize as little as possible!
function normalizeURLForLink(url: string) {
  return URL.parse(normalizeUrl(url, {
    removeTrailingSlash: false, // don't strip trailing slashes unless root level
    stripWWW: false,
    stripTextFragment: true
  }))!
} 

// TODOs:
// 1. Add posting links
// 2. Add viewing links and everyone who posted it
// 3. Add sign up + authentication
// 4. Add viewing users posts
// 5. Add sessions

async function validateSchema<T>(zodSchema: zod.ZodSchema<T>, req: BunRequest): Promise<T | Response> {
  // Untyped, but returns an Object: https://developer.mozilla.org/en-US/docs/Web/API/Request/json#return_value
  let text = await req.text()
  let searchParams = URL.parse(req.url)?.searchParams
  let body = {}

  if (text != '') {
    body = JSON.parse(text)
  }
  else if (searchParams) {
    let searchParamsBody = Object.fromEntries(searchParams.entries())
    if (Object.keys(searchParamsBody).length > 0) {
      body = searchParamsBody
    }
  }
  // Allow both search params in URL and JSON body
  // `fetch()` in browser forbids data in body on GET requests
  console.log(searchParams)
  console.log(body)

  // This is form data in body:
  // if (req.headers.get('content-type') === 'application/x-www-form-urlencoded') {
    // formData() is not deprecated: https://github.com/oven-sh/bun/issues/18701#issuecomment-2981184947
    // let formData = await req.formData()
    // body = Object.fromEntries(formData.entries())
  // }

  const result = zodSchema.safeParse(body)
  if (!result.success) return Response.json({ message: 'Invalid API body' }, { status: 400 })

  return result.data
}

class CreatePostHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new CreatePostHandler(app)
  }

  // TODO: validate user id matches logged in user
  async validate(req: BunRequest) {
    const data = await validateSchema(zod.object({
      url: zod.url(), 
      user_id: zod.number(), 
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
  const link = await getLink(app, url)
  if (!link) return success({ posts: [] })

  const posts = await app.postTable.fromLinkId(link.id)
  return success({ posts: posts })
}

async function handleGetLinkFromURL(app: App, req: BunRequest) {
  const data = await validateSchema(zod.object({url: zod.url()}), req)
  if (data instanceof Response) return data

  // URL.parse also does some normalization, so we must always parse it...
  const link = await getLink(app, data.url)
  console.log(link)
  return success({ link: link })
}

// TODO: move these into the model?
async function getOrCreateLink(app: App, url: string) {
  const normalized = normalizeURLForLink(url)
  const link = await app.linkTable.getOrInsertFromURL(normalized)
  return link
}

async function getLink(app: App, url: string) {
  const normalized = normalizeURLForLink(url)
  const link = await app.linkTable.fromURL(normalized)
  return link
}

class App {
  sql: SQL
  linkTable: LinkTable
  postTable: PostTable

  constructor(public config: Config) {
    this.sql = new SQL(this.config.database.path)
    this.linkTable = new LinkTable(this.sql)
    this.postTable = new PostTable(this.sql)
  }

  static new(config: Config) {
    return new App(config)
  }

  async start() {
    // Set up schema
    await this.sql.file('./src/migrations/schema.sql')
    this.serve(this.config.server.port || 2000)
  }

  serve(port: number) {
    Bun.serve({
      routes: {
        "/": index,
        "/api/post": {
          POST: (req) => CreatePostHandler.new(this).handle(req),
          GET: (req) => handleFindPosts(this, req)
        },
        "/api/post/:post_id": {
          GET: (req) => handleGetPost(this, req.params.post_id, req)
        },
        "/api/link": {
          GET: (req) => handleGetLinkFromURL(this, req)
        },
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