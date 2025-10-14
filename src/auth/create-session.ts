import { Cookie } from "bun"
import type App from "../server"

export async function createSession(app: App, userId: number) {
  let session = await app.sessionTable.insert({
    id: crypto.randomUUID(),
    user_id: userId,
    expires_at: new Date(Date.now() + 86400000 * 7).toISOString()
  })

  if (!session) throw new Error("Failed to create session")

  let cookie = new Cookie("session", session.id, {
    domain: app.config.auth.domain,
    path: "/",
    expires: new Date(Date.now() + 86400000 * 7), // 7 days
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  })

  return { session, cookie }
}