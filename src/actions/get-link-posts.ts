import type App from "../server"
import type { DisplayPost } from "./get-feed"

export async function getLinkPosts(app: App, linkId: number) {
  const link = await app.linkTable.fromId(linkId)
  if (!link) { return { link: null, posts: null } }
  // const posts = await app.postTable.fromLinkId(linkId)
  const posts = await app.sql`
    select *, user.username from post 
    join user on post.user_id = user.id
    where post.link_id = ${linkId}
  ` as DisplayPost[]
  return { link, posts }
}