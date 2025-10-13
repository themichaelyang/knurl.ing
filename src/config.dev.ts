import { type Config } from "./config"

let LocalConfig: Config = {
  database: { 
    path: 'sqlite://database.sqlite'
  },
  auth: {
    secret: 'your-secret-key-change-in-production'
  },
  server: {
    port: 2000
  }
}

export default LocalConfig