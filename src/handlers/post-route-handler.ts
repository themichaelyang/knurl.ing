import type { BunRequest } from "bun"
import App from "../server"

export class PostRouteHandler {
  constructor(public app: App) {}

  static new = (app: App) => new this(app)

  handle(req: BunRequest) {
    if (req.method == 'POST') {
      this.handlePost(req)
    } else if (req.method === 'GET') {
      this.handleGet(req)
    }

    return Response.json({ message: 'Not implemented' }, { status: 400 })
  }

  handlePost(req: BunRequest) {
    return Response.json({ message: 'Not implemented' }, { status: 400 })
  }

  handleGet(req: BunRequest) {
    return Response.json({ message: 'Not implemented' }, { status: 400 })
  }
}