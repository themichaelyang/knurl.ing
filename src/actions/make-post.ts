import type { PostWritable } from "../models/post"
import type App from "../server"
import * as utils from "./utils"

type makePostData = {
  url: URL
} & PostWritable 

export async function getLink(app: App, url: string) {
  const normalized = utils.normalizeURLForLink(url)
  const link = await app.linkTable.fromURL(normalized)
  return link
}

// TODO: move these into the model?
// TODO: maybe normalization happens beforehand? 
// although, abstraction via encapsulation works fine for now (one callsite)
// user input -> normalization+validation -> domain models 
// -> business logic (all the complexity should live ere)
// -> domain output -> user output
export async function getOrCreateLink(app: App, url: string) {
  const normalized = utils.normalizeURLForLink(url)
  const link = await app.linkTable.getOrInsertFromURL(normalized)
  return link
}

export async function makePost(app: App, data: makePostData) {
  const link = await getOrCreateLink(app, data.url.href)
  const post = await app.postTable.insert({
    link_id: link.id, 
    url: data.url.href, 
    user_id: data.user_id, 
    blurb: data.blurb ?? null
  })
  return { post, link }
}