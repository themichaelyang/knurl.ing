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

  static async getFeed() {
    const response = await fetch("/api/feed")
    return await response.json() as { feed: { url: string, blurb: string, username: string }[] }
  }
}

export class HypertextAPI {
  static async feed() {
    const result = await API.getFeed()
    console.log(result)
    return render(
      html`<h2>Feed</h2>
      <ul>
        ${result.feed.map(post => html`
          <li>
            ${post.blurb ? html`${post.blurb}` : null} 
            <a href=${post.url}>${post.url}</a> 
           </li>
        `)}
      </ul>
    `)
  }
}