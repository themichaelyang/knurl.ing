import type App from "../server"
import type { BunRequest } from "bun"

export async function isLoggedIn(app: App, req: BunRequest) {
  let sessionCookie = req.cookies.get("session")
  if (sessionCookie === null) return false

  let session = await app.sessionTable.fromId(sessionCookie)  
  if (session === null) return false

  // it's a string (if we used Bun with MySQL it would convert to a date)
  // console.log(session.expires_at)
  // console.log(typeof session.expires_at)

  return Date.parse(session.expires_at) > Date.now()
}