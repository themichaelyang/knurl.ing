import { type Config } from "./src/config"

let DevConfig: Config = {
  database: { 
    path: 'sqlite://dev.sqlite'
  },
  auth: {
    secret: 'your-secret-key-change-in-production',
    domain: 'localhost'
  },
  server: {
    port: 2000
  }
}

export default DevConfig