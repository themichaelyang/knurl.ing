import type { BunRequest } from "bun"
import App from "../server"
import { htmlResponse } from "./html-response"
import { html } from "../template"
import * as zod from 'zod'
import base from "../client/partials/base"
import { createSession } from "../auth/create-session"

export class SignUpRouteHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  static route = "/sign-up"

  // Render signup form
  handleGet = async (req: BunRequest) => {
    return htmlResponse(
      base(html`
        <h1>Sign up</h1>
        <form action="/sign-up" method="POST" class="form">
          <label>Username <input name="username" required /></label>
          <label>Password <input type="password" name="password" required /></label>
          <button type="submit">Create account</button>
        </form>
      `).render()
    )
  }

  // Handle signup POST
  handlePost = async (req: BunRequest) => {
    const form = await req.formData()
    const body = Object.fromEntries(form.entries())

    const schema = zod.object({
      username: zod.string().min(3).max(50),
      password: zod.string().min(6).max(255)
    })

    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return htmlResponse(html`<p>Invalid input</p>`.render())
    }

    const { username, password } = parsed.data

    let existingUser = await this.app.userTable.getByUsername(username)

    if (existingUser) {
      // TODO: update page instead of responding with HTML
      return htmlResponse(html`<p>Username already exists</p>`.render())
    }

    // Hash password (Bun.password automatically salts)
    const hash = await Bun.password.hash(password)

    // Insert user; table: user(username, password_hash)
    const newUser = (await this.app.sql`
      insert into user (username, password_hash)
      values (${username}, ${hash})
      returning *
    `)[0]

    const { cookie } = await createSession(this.app, newUser.id)
    req.cookies.set(cookie)

    return Response.redirect("/")
  }
}