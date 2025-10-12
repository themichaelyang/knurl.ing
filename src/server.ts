import LocalConfig from './local-config'
import { Database } from "bun:sqlite"
import index from './index.html'

// const db = new Database(LocalConfig.database.path)

Bun.serve({
  routes: {
    "/": index,
    "/static/fonts/iAWriterDuoS-Regular.woff2": new Response(Bun.file("./static/fonts/iAWriterDuoS-Regular.woff2")),
    "/static/fonts/iAWriterDuoS-Bold.woff2": new Response(Bun.file("./static/fonts/iAWriterDuoS-Bold.woff2"))
  },
  port: 2000
})