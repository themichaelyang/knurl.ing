/// <reference lib="dom" />

import { HypertextAPI } from "./api-client"

window.addEventListener("load", async () => {
  document.getElementById("feed")!.innerHTML = await HypertextAPI.feed()
})