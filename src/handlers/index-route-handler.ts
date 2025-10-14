import type { BunRequest } from "bun"
import App from "../server"
import { PostRouteHandler } from "./post-route-handler"
import index from "../client/pages/index.html"
import base from "../client/partials/base.ts"
import { html } from "../template.ts"
import { htmlResponse } from "./html-response.ts"
import * as actions from "../actions/all.ts"
import { LinkRouteHandler } from "./link-route-handler"

// TODO link to user page
// Need to wrap the links in divs to prevent them taking up entire width of grid
function renderFeedItem(feedItem: actions.DisplayPost) {
  return html`
    <li> 
      <div class="display-post">
        <div><a class="display-post-url" href="${feedItem.url}">${feedItem.url}</a></div>
        <div class="display-post-metadata">
          <div><a class="display-post-activity-href" href="${LinkRouteHandler.route(feedItem.link_id.toString())}">(see activity)</a></div>
          <span class="display-post-byline">
            ${feedItem.blurb ? "“" + feedItem.blurb + "” — " : ""}
            <a class="display-post-username-link" href="TODO: Link to user page">${feedItem.username}</a>
          </span>
        </div>
      </div>
    </li>
  `
  // `  <!-- <li> 
  //     <div class="display-post">
  //     <span>${feedItem.username}: ${feedItem.blurb ? "“" + feedItem.blurb + "” " : ""}</span>
  //     <a href="${LinkRouteHandler.route(feedItem.link_id.toString())}">(activity)</a><br>
  //     <a href="${feedItem.url}">${feedItem.url}</a>
  //     </div>
  //   </li> -->
  // `
}

export class IndexRouteHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  async handleGet(req: BunRequest) {
    const feed = await actions.getFeed(this.app)

    return htmlResponse(
      base(
        html`
          <h1>Feed</h1>
          <ul class="feed">
            ${feed.map((post) => renderFeedItem(post))}
          </ul>
          `
      ).render()
    )
  }
}