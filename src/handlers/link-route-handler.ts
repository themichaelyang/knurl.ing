import type { BunRequest } from "bun"
import type App from "../server"
import { htmlResponse } from "./html-response"
import { html } from "../template"
import base from "../client/partials/base"
import { getLinkPosts } from "../actions/get-link-posts"

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

    return htmlResponse(
      base(
        html`
          <h1>Link</h1>
          <p>${link.normalized_url}</p>
          <p>Posted ${posts.length} times</p>
        `
      ).render()
    )
  }
}