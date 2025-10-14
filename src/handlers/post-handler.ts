import type { BunRequest } from "bun"
import App from "../server"
import { makePost } from "../actions/make-post"
import { validateSchema } from "./validate"
import zod from "zod"
import { htmlResponse } from "./html-response"
import { html } from "../template"
import base from "../client/partials/base"

export class PostHandler {
  constructor(public app: App) {}

  static new = (app: App) => new this(app)

  handle = (req: BunRequest) => {
    if (req.method == 'POST') {
      this.handlePost(req)
    } else if (req.method === 'GET') {
      this.handleGet(req)
    }

    return Response.json({ message: 'Not found' }, { status: 400 })
  }

  handlePost = async (req: BunRequest) => {
    const data = await validateSchema(zod.object({
      url: zod.url(),
      blurb: zod.string().optional(),
      user_id: zod.number()
    }), req)

    if (data instanceof Response) return data

    let url = URL.parse(data.url)
    if (!url) return Response.json({ message: 'Invalid URL' }, { status: 400 })

    const post = await makePost(this.app, { ...data, url: url })
    return Response.json(post)
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