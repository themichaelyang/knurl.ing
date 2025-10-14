import type { BunRequest } from "bun"
import App from "../server"
import base from "../views/templates/base"
import { html } from "../views/template"
import { htmlResponse } from "./html-response"
import * as actions from "../actions/all"
import { LinkHandler } from "./link-handler"
import { getLoggedInUser } from "../auth/get-logged-in-user"

let submitPostForm = (user_id: number) => html`
  <form action="/post" method="POST">
    <label>URL <input type="url" name="url" required /></label>
    <label>Blurb <input type="text" name="blurb" /></label>
    <input type="hidden" name="user_id" value="${user_id}" />
    <input type="hidden" name="idempotency_key" value="${crypto.randomUUID()}" />
    <button type="submit">Post</button>
  </form>
`

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
        <div><a class="activity-href" href="${LinkHandler.route(post.link_id.toString())}">(see activity)</a></div>
          ${displayPostMetadata(post)}
        </div>
      </div>
    </li>
  `
}

export class IndexHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  handleGet = async (req: BunRequest) => {
    // TODO: automatically populate useful things in the template data?
    let loggedInUser = await getLoggedInUser(this.app, req)
    const feed = await actions.getFeed(this.app)

    // TODO: Could implement this as left floating inline boxes
    // so the links flow like text?
    // And each link could have a color based on a hash of the url?
    return htmlResponse(
      base(
        html`
          ${loggedInUser ? html`<h1>Post a link</h1>${submitPostForm(loggedInUser.id)}` : ''}
          <h1>Feed</h1>
          <ul class="feed">
            ${feed.length > 0 ? feed.map((post) => displayPost(post)) : html`<p>No posts found.</p>`}
          </ul>
          `,
          loggedInUser ? loggedInUser.username : null
      ).render()
    )
  }
}
