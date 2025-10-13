import { type Config } from "./src/config"

let LocalConfig: Config = {
  database: { 
    path: 'sqlite://dev.sqlite'
  },
  auth: {
    secret: 'your-secret-key-change-in-production'
  },
  server: {
    port: 2000
  }
}

export default LocalConfig