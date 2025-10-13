/// <reference lib="dom" />

import { HypermediaAPI } from "../api"

window.addEventListener("load", async () => {
  const posts = await HypermediaAPI.all()
  document.getElementById("posts")!.innerHTML = posts
})