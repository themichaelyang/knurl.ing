import LocalConfig from './config.dev'
import { SQL, type BunRequest } from "bun"
import index from './index.html'
import * as zod from 'zod'

const sql = new SQL(LocalConfig.database.path)

// Initialize database schema
await sql.file('./src/migrations/schema.sql')

// TODOs:
// 1. Add posting links
// 2. Add viewing links and everyone who posted it
// 3. Add sign up + authentication
// 4. Add viewing users posts
// 5. Add sessions

async function handleCreatePost(req: BunRequest) {
  const body = await req.json()
  const result = zod.object({url: zod.url()}).safeParse(body)

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Invalid API body' }), { status: 400 })
  }

  const data = result.data
  const parsed = URL.parse(data.url)

  // In theory, Zod should filter these, but maybe in the future we relax Zod to allow better errors.
  if (!parsed) {
    return new Response(JSON.stringify({ error: 'Invalid URL in API body' }), { status: 400 })
  }

  let link = (await sql`
    select id from link where url = ${parsed.href}
  `)[0]

  if (!link) {
    link = (await sql`
      insert into link (url, host, tld) 
      values (${parsed.href}, ${parsed.host}, ${parsed.hostname.split('.').pop()})
      returning id
    `)[0]
  }
  console.log(link.id)

  // TODO: We should also handle: https://publicsuffix.org/list/public_suffix_list.dat
  const post_id = await sql`
    insert into post (link_id)
    values (${link.id})
    returning id
  `

  console.log(post_id)

  return new Response(JSON.stringify({ post_id: post_id }))
}

async function handleGetAllPosts(req: BunRequest) {
  const posts = await sql`
    select * from post
  `

  return new Response(JSON.stringify({ posts: posts }))
}

async function handleGetPost(postId: string, req: BunRequest) {
  const post = (await sql`
    select * from post where id = ${postId}
  `)[0]

  return new Response(JSON.stringify({ post: post }))
}

async function handleGetLink(linkId: string, req: BunRequest) {
  const link = (await sql`
    select * from link where link.id = ${linkId}
  `)[0]

  return new Response(JSON.stringify({ link: link }))
}

async function handleGetLinkByURL(req: BunRequest) {
  const body = await req.json()
  const result = zod.object({url: zod.url()}).safeParse(body)

  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Invalid API body' }), { status: 400 })
  }

  const link = (await sql`
    select * from link where link.url = ${result.data.url}
  `)[0]

  return new Response(JSON.stringify({ link: link }))
}

Bun.serve({
  routes: {
    "/": index,
    "/api/post": {
      POST: (req) => handleCreatePost(req),
      GET: (req) => handleGetAllPosts(req)
    },
    "/api/post/:post_id": {
      GET: (req) => handleGetPost(req.params.post_id, req)
    },
    "/api/link": {
      GET: (req) => handleGetLinkByURL(req)
    },
    "/api/link/:link_id": {
      GET: (req) => handleGetLink(req.params.link_id, req)
    }
  },
  port: 2000
})
