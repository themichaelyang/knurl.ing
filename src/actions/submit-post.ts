export class SubmitPostRoute {
  constructor(public app: App) {}

  static new(app: App) {
    return new SubmitPostRoute(app)
  }

  async handle(req: BunRequest) {
    return new Response(JSON.stringify({ message: "Hello, world!" }))
  }
}