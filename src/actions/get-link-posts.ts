import type App from "../server"

export async function getLinkPosts(app: App, linkId: number) {
  const link = await app.linkTable.fromId(linkId)
  if (!link) { return { link: null, posts: null } }
  const posts = await app.postTable.fromLinkId(linkId)
  return { link, posts }
}