import LocalConfig from './config.dev'
import { SQL, type BunRequest } from "bun"
import { LinkTable } from './model/link'
import { PostTable } from './model/post'
import index from './index.html'
import * as zod from 'zod'

const sql = new SQL(LocalConfig.database.path)

// Initialize database schema
await sql.file('./src/migrations/schema.sql')

const linkTable = new LinkTable(sql)
const postTable = new PostTable(sql)

// TODOs:
// 1. Add posting links
// 2. Add viewing links and everyone who posted it
// 3. Add sign up + authentication
// 4. Add viewing users posts
// 5. Add sessions

async function validateSchema<T>(zodSchema: zod.ZodSchema<T>, req: BunRequest): Promise<T | Response> {
  const body = await req.json()
  const result = zodSchema.safeParse(body)

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Invalid API body' }), { status: 400 })
  }

  return result.data
}

class CreatePostHandler {
  static async validate(req: BunRequest) {
    const data = await validateSchema(zod.object({url: zod.url()}), req)
    if (data instanceof Response) return data

    // In theory, Zod should filter these, but maybe in the future we relax Zod to allow better errors.
    const parsed = URL.parse(data.url)
    if (!parsed) return new Response(JSON.stringify({ error: 'Invalid URL in API body' }), { status: 400 })

    return parsed
  }

  static async handle(req: BunRequest) {
    const parsed = await this.validate(req)
    if (parsed instanceof Response) return parsed

    // TODO: We should also handle: https://publicsuffix.org/list/public_suffix_list.dat
    const link = await linkTable.getOrCreateFromURL(parsed)
    const post = await postTable.create(link.id)

    return new Response(JSON.stringify({ post: post }))
  }
}

async function handleGetPost(postId: string, req: BunRequest) {
  const post = (await sql`select * from post where id = ${postId}`)[0]

  return new Response(JSON.stringify({ post: post }))
}

async function handleGetLink(linkId: string, req: BunRequest) {
  const link = linkTable.fromId(parseInt(linkId))

  return new Response(JSON.stringify({ link: link }))
}

async function handleGetLinkByURL(req: BunRequest) {
  const data = await validateSchema(zod.object({url: zod.url()}), req)
  if (data instanceof Response) {
    return data
  }

  const link = linkTable.fromURL(data.url)
  return new Response(JSON.stringify({ link: link }))
}

async function handleFindPosts(req: BunRequest) {
  const data = await validateSchema(zod.object({link_id: zod.number()}), req)
  if (data instanceof Response) {
    return data
  }

  const posts = await sql`
    select * from post where post.link_id = ${data.link_id}
  `

  return new Response(JSON.stringify({ posts: posts }))
}

async function handleGetLinkFromURL(req: BunRequest) {
  const data = await validateSchema(zod.object({url: zod.url()}), req)
  if (data instanceof Response) {
    return data
  }

  const link = (await sql`
    select * from link where link.url = ${data.url}
  `)[0]

  return new Response(JSON.stringify({ link: link }))
}

Bun.serve({
  routes: {
    "/": index,
    "/api/post": {
      POST: (req) => CreatePostHandler.handle(req),
      GET: (req) => handleFindPosts(req)
    },
    "/api/post/:post_id": {
      GET: (req) => handleGetPost(req.params.post_id, req)
    },
    "/api/link": {
      GET: (req) => handleGetLinkFromURL(req)
    },
    "/api/link/:link_id": {
      GET: (req) => handleGetLink(req.params.link_id, req)
    }
  },
  port: 2000
})
