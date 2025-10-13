import LocalConfig from './config.dev'
import { SQL, type BunRequest } from "bun"
import { LinkTable, type Link } from './model/link'
import { PostTable, type Post } from './model/post'
import normalizeUrl from 'normalize-url'
import index from './index.html'
import * as zod from 'zod'

const sql = new SQL(LocalConfig.database.path)

// Initialize database schema
await sql.file('./src/migrations/schema.sql')

const linkTable = new LinkTable(sql)
const postTable = new PostTable(sql)

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
  static async validate(req: BunRequest) {
    const data = await validateSchema(zod.object({url: zod.url()}), req)
    if (data instanceof Response) return data

    // In theory, Zod should filter these, but maybe in the future we relax Zod to allow better errors.
    const parsed = URL.parse(data.url)
    if (!parsed) return Response.json({ message: 'Invalid URL in API body' }, { status: 400 })

    return parsed
  }

  static async handle(req: BunRequest) {
    let parsed = await this.validate(req)
    if (parsed instanceof Response) return parsed
  
    const link = await getOrCreateLink(parsed.href)
    const post = await postTable.insert({ link_id: link.id, url: parsed.href })

    return success({ post: post })
  }
}

async function handleGetPost(postId: string, req: BunRequest) {
  const post = (await sql`select * from post where id = ${postId}`)[0]
  return success({ post: post })
}

async function handlegetOrCreateLink(linkId: string, req: BunRequest) {
  const link = await linkTable.fromId(parseInt(linkId))

  return success({ link: link })
}

async function handleFindPosts(req: BunRequest) {
  const data = await validateSchema(zod.object({link_id: zod.number()}), req)
  if (data instanceof Response) return data

  const posts = await postTable.fromLinkId(data.link_id)
  return success({ posts: posts })
}

async function handleGetLinkFromURL(req: BunRequest) {
  const data = await validateSchema(zod.object({url: zod.url()}), req)
  if (data instanceof Response) return data

  // URL.parse also does some normalization, so we must always parse it...
  const link = await getLink(data.url)
  console.log(link)
  return success({ link: link })
}

// TODO: move these into the model?
async function getOrCreateLink(url: string) {
  const normalized = normalizeURLForLink(url)
  const link = await linkTable.getOrInsertFromURL(normalized)
  return link
}

async function getLink(url: string) {
  const normalized = normalizeURLForLink(url)
  const link = await linkTable.fromURL(normalized)
  return link
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
    // "/api/link/:link_id": {
      // GET: (req) => handlegetOrCreateLink(req.params.link_id, req)
    // }
  },
  error(err) {
    console.error("Server error:", err);
    return new Response("Something went wrong!", { status: 500 });
  },
  port: 2000
})
