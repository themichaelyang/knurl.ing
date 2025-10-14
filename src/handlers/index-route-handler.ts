import type { BunRequest } from "bun"
import App from "../server"
import { PostRouteHandler } from "./post-route-handler"
import index from "../client/pages/index.html"
import base from "../client/partials/base.ts"
import { html } from "../template.ts"
import { htmlResponse } from "./html-response.ts"
import * as actions from "../actions/all.ts"
import { LinkRouteHandler } from "./link-route-handler"

export function displayPostMetadata(post: actions.DisplayPost) {
  return html`
    <span class="activity-byline">
      ${post.blurb ? "“" + post.blurb + "” — " : "posted by "}
      <a class="activity-username" href="TODO: Link to user page">${post.username}</a>
    </span>
  `
}
// TODO link to user page
// Need to wrap the links in divs to prevent them taking up entire width of grid
export function displayPost(post: actions.DisplayPost) {
  return html`
    <li> 
      <div class="display-post">
        <div><a class="display-post-url" href="${post.url}">${post.url}</a></div>
        <div class="display-post-metadata">
        <div><a class="activity-href" href="${LinkRouteHandler.route(post.link_id.toString())}">(see activity)</a></div>
          ${displayPostMetadata(post)}
        </div>
      </div>
    </li>
  `
}

export class IndexRouteHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  async handleGet(req: BunRequest) {
    const feed = await actions.getFeed(this.app)

    // TODO: Could implement this as left floating inline boxes
    // so the links flow like text?
    // And each link could have a color based on a hash of the url?
    return htmlResponse(
      base(
        html`
          <h1>Feed</h1>
          <ul class="feed">
            ${feed.map((post) => displayPost(post))}
          </ul>
          `
      ).render()
    )
  }
}