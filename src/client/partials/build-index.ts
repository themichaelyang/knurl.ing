import base from "./base"
import { html, render, raw } from "../../template"

import { watch } from "fs"

watch("src/client/partials/index-body.html", async () => {
  console.log("index-body.html changed, updating index.html")
  Bun.write(Bun.file("src/client/pages/index.html"), render(base(
    html`${raw(await Bun.file("src/client/partials/index-body.html").text())}`
  )))
})