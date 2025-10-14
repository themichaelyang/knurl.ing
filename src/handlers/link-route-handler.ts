import type { BunRequest } from "bun"
import type App from "../server"
import { htmlResponse } from "./html-response"
import { html } from "../template"
import base from "../client/partials/base"
import { getLinkPosts } from "../actions/get-link-posts"
import { displayPostMetadata } from "./index-route-handler"

export class LinkRouteHandler {
  constructor(public app: App) {}
  name = "LinkRouteHandler"

  static new = (app: App) => new this(app)
  // TODO: think of a better way to do this...
  static route = (id: string) => `/link/${id}`

  async handle(req: BunRequest, linkIdStr: string) {
    const linkId = parseInt(linkIdStr)

    if (!Number.isInteger(linkId)) {
      return Response.json({ error: "Invalid link id" }, { status: 400 })
    }

    const { link, posts } = await getLinkPosts(this.app, linkId)
    if (!link || !posts) {
      return Response.json({ error: "Link or posts not found" }, { status: 404 })
    }

    // TODO: when more activity types are added we can split out the display functions
    return htmlResponse(
      base(
        html`
          <h1>Link</h1>
          <p><a href="${link.normalized_url}">${link.normalized_url}</a></p>
          <p>Posted ${posts.length} times</p>
          <ul class="activities">
            ${posts.map((post) => html`<li class="activity">${displayPostMetadata(post)}</li>`)}
          </ul>
        `
      ).render()
    )
  }
}