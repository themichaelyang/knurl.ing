import base from "./base"
import { html, render, raw } from "../../template"

import { watch } from "fs"

// TODO: Replace with eta or other templating engines?
const files = {
  "index-body.html": "index.html",
}

// Would prefer to add this as a HTML loader plugin, but Bun 
// build plugins don't support html loaders for some reason: 
// https://github.com/oven-sh/bun/issues/17655
Object.entries(files).forEach(async ([key, value]) => {
  let build = async (force: boolean = false) => {
    console.log(`${force ? "U" : `${key} changed, u`}pdating ${value}`)
    Bun.write(Bun.file(`src/client/pages/${value}`), render(base(
      html`${raw(await Bun.file(`src/client/partials/${key}`).text())}`
    )))
  }

  build(true)
  watch(`src/client/partials/${key}`, () => build(false))
})