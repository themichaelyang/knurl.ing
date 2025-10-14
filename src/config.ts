export type Config = {
  database: {
    path: string
  },
  auth: {
    secret: string,
    domain: string // for cookies
  },
  server: {
    port: number | undefined
  }
}