import { expect, test } from "bun:test"
import serve from "../server"

test("serve", async() => {
  serve(2000)
})
