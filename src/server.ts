import LocalConfig from './local-config'
import { Database } from "bun:sqlite"
import index from './index.html'

// const db = new Database(LocalConfig.database.path)

// Bun seems like it bundles the fonts?
// const STATIC_FILES = [
  // "/static/routed-gothic/RoutedGothicWide.woff",
  // "/static/routed-gothic/RoutedGothicWide.woff2"
// ]

let routes: Record<string, any> = {
  "/": index
}

// STATIC_FILES.map(async (path) => {
//   routes[path] = new Response(await Bun.file(process.cwd() + path).bytes())
// })

Bun.serve({
  routes: routes,
  port: 2000
})

console.log()