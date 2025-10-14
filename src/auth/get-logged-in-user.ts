import type App from "../server"
import type { BunRequest } from "bun"
import type { UserReadable } from "../models/user"

// TODO: add better way of handling logged in or out at route handler level
export async function getLoggedInUser(app: App, req: BunRequest): Promise<false | UserReadable> {
  let sessionCookie = req.cookies.get("session")
  if (sessionCookie === null) return false

  let session = await app.sessionTable.fromId(sessionCookie)  
  if (session === null) return false

  let user = await app.userTable.fromId(session.user_id)
  if (user === null) return false

  // it's a string (if we used Bun with MySQL it would convert to a date)
  // console.log(session.expires_at)
  // console.log(typeof session.expires_at)

  return Date.parse(session.expires_at) > Date.now() && user
}