export type Config = {
  database: {
    path: string
  },
  auth: {
    secret: string
  },
  server: {
    port: number | undefined
  }
}