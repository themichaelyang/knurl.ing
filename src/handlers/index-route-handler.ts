import type { BunRequest } from "bun"
import App from "../server"
import { PostRouteHandler } from "./post-route-handler"
import index from "../client/pages/index.html"
import base from "../client/partials/base.ts"
import { html } from "../template.ts"

export class IndexRouteHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  handleGet(req: BunRequest) {
    return new Response(
      base(html`<div>Hello, world!</div>`).render(),
      { headers: { "Content-Type": "text/html" } }
    )
    // return new Response(Bun.file(index.index), { headers: { "Content-Type": "text/html" } })
  }
}