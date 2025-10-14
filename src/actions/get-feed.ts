import type App from "../server";

export type DisplayPost = { url: string, blurb: string, link_id: number, username: string }

export async function getFeed(app: App) {
  const feed = await app.sql`
    select p.url, p.blurb, p.link_id, u.username
    from post p
    full outer join user u on p.user_id = u.id
    order by p.created_at desc
  `
  return feed as DisplayPost[]
}