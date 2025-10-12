import LocalConfig from './local-config'
import { Database } from "bun:sqlite"
import index from './index.html'

// const db = new Database(LocalConfig.database.path)

Bun.serve({
  routes: {
    "/": index
  },
  port: 2000
})