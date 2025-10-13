import { type PostWritable, type PostReadable } from "./model/post"
import { type LinkReadable } from "./model/link"
import { html, render } from "./template"

// TODO: convert to awesome HATEOS API...
export class API {
  static async createPost(post: PostWritable) {
    const response = await fetch("/api/post", {
      method: "POST",
      body: JSON.stringify(post)
    })
    return await response.json() as PostReadable
  }

  static async getPost(postId: number) {
    const response = await fetch(`/api/post/${postId}`)
    return await response.json() as PostReadable
  }

  // TODO: could we share the Zod schema in a cool way?
  static async getPostsByURL(url: string) {
    const response = await fetch(`/api/post?${new URLSearchParams({ url })}`)
    return await response.json() as { posts: PostReadable[], link: LinkReadable }
  }

  static async getAllPosts() {
    return await this.getPostsByURL("*")
  }
}

export class HypermediaAPI {
  static async all() {
    const result = await API.getAllPosts()
    console.log(result)
    return render(result.posts.map(post => html`
      <div>
        <h2><a href=${post.url}>${post.url}</a></h2>
        ${post.blurb ? html`<p class="blurb">${post.blurb}</p>` : null}
      </div>
    `))
  }
}