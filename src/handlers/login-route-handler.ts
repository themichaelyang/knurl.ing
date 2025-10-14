import type { BunRequest } from "bun"
import App from "../server"
import { htmlResponse } from "./html-response"
import { html } from "../template"
import * as zod from 'zod'
import base from "../client/partials/base"
import { createSession } from "../auth/create-session"

export class LoginRouteHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  static route = "/login"

  // Render login form
  handleGet = async (req: BunRequest) => {
    return htmlResponse(
      base(html`
        <h1>Login</h1>
        <form action="/login" method="POST" class="form">
          <label>Username <input name="username" required /></label>
          <label>Password <input type="password" name="password" required /></label>
          <button type="submit">Login</button>
        </form>
      `).render()
    )
  }

  // Unfortunately, we need to use arrow functions to preserve "this"
  // when method is passed through the login redirect as a function
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

    console.log(this)
    let existingUser = await this.app.userTable.getByUsername(username)

    // TODO: update page instead of responding with HTML
    if (!existingUser) {
      return htmlResponse(html`<p>User does not exist</p>`.render())
    }

    const matches = await Bun.password.verify(password, existingUser.password_hash)

    // TODO: update page instead of responding with HTML
    if (!matches) {
      return htmlResponse(html`<p>Invalid password</p>`.render())
    }

    const { cookie } = await createSession(this.app, existingUser.id)
    req.cookies.set(cookie)

    return Response.redirect("/")
  }
}