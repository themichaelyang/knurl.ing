import type { BunRequest } from "bun"
import App from "../server"

export class LogoutHandler {
  constructor(public app: App) {}

  static new(app: App) {
    return new this(app)
  }

  static route = "/logout"

  handle = async (req: BunRequest) => {
    let session = req.cookies.get("session")!
    if (!session) {
      return Response.redirect("/")
    }

    await this.app.sessionTable.delete(session)
    req.cookies.delete("session")

    return Response.redirect("/")
  }
}