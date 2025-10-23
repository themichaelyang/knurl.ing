import type { BunRequest } from "bun"
import App from "../server"
import { makePost } from "../actions/make-post"
import { validateSchema } from "./validate"
import zod from "zod"
import { htmlResponse } from "./html-response"
import { html } from "../views/template"
import base from "../views/templates/base"
import { IndexView } from "./index-handler"

export class PostHandler {
  constructor(public app: App) {}

  static new = (app: App) => new this(app)

  handle = (req: BunRequest) => {
    if (req.method == 'POST') {
      return this.handlePost(req)
    } else if (req.method === 'GET') {
      return this.handleGet(req)
    }

    return Response.json({ message: 'Not found' }, { status: 400 })
  }

  handlePost = async (req: BunRequest) => {
    const data = await validateSchema(zod.object({
      url: zod.url(),
      blurb: zod.string().optional(),
      user_id: zod.coerce.number(),
      idempotency_key: zod.string()
    }), req)

    // TODO: also remember to handle these
    if (data instanceof Response) return data

    // TODO: clean up the response JSONs, we need to return HTML. 
    // One idea is to rerender the form page populated with the error.
    // Here's a shot at that, but we probably need to have smarter form redirects, maybe with htmx?
    let url = URL.parse(data.url)
    // if (!url) return Response.json({ message: 'Invalid URL' }, { status: 400 })
    if (!url) return htmlResponse(IndexView(false, [], 'Invalid URL').render())

    const post = await makePost(this.app, { ...data, url: url })
    // return Response.json(post)
    return Response.redirect("/")
  }

  handleGet(req: BunRequest) {
    return htmlResponse(base(html`
    <form action="/post" method="POST">
      <label>URL <input type="url" name="url" required /></label>
      <label>Blurb <input type="text" name="blurb" /></label>
      <button type="submit">Post</button>
    </form>
    `).render())
  }
}