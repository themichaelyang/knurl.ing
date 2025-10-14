import { isLoggedIn } from "./is-logged-in"
import type { BunRequest } from "bun"
import type App from "../server"

export async function redirectIfLoggedIn(app: App, req: BunRequest, route: string, handler: (req: BunRequest) => Promise<Response>) {
  let loggedIn = await isLoggedIn(app, req)
  if (loggedIn) {
    return Response.redirect(route)
  } else {
    return handler(req)
  }
}