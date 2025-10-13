import { type PostWritable, type PostReadable } from "./model/post"
import { type LinkReadable } from "./model/link"

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


// adapted from lodash
function escape(string: string) {
  const reUnescapedHtml = /[&<>"'`]/g,
    reHasUnescapedHtml = RegExp(reUnescapedHtml.source);

  /** Used to map characters to HTML entities. */
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  }

  return (string && reHasUnescapedHtml.test(string))
    ? string.replace(reUnescapedHtml, (k) => htmlEscapes[k as keyof typeof htmlEscapes])
    : string;
}

const symbol: unique symbol = Symbol('TemplateHTML')
class TemplateHTML {
  private [symbol]: boolean = true

  constructor(readonly __html: string) {
    this[symbol] = true
  }

  static isTemplateHTML(v: unknown): v is TemplateHTML {
    return v instanceof TemplateHTML && v[symbol]
  }

  static html(strings: TemplateStringsArray, ...values: any[]): TemplateHTML {
    const out = strings.reduce((acc, str, i) => {
      const v = values[i]
      if (v == null) return acc + str
      if (TemplateHTML.isTemplateHTML(v)) return acc + str + v.__html
      if (Array.isArray(v) && v.every(TemplateHTML.isTemplateHTML)) {
        return acc + str + TemplateHTML.convertTemplateHTMLArray(v)
      }
      return acc + str + escape(v)    // escape everything else
    }, '')
    return new TemplateHTML(out)
  }

  static convertTemplateHTMLArray(v: TemplateHTML[]): string {
    return v.map(x => {
      if (TemplateHTML.isTemplateHTML(x)) return x.__html
      return escape(String(x ?? ''))
    }).join('')
  }
  
  render = () => this.__html

  static render(v: TemplateHTML | TemplateHTML[]): string {
    if (Array.isArray(v) && v.every(TemplateHTML.isTemplateHTML)) {
      return TemplateHTML.convertTemplateHTMLArray(v)
    } else {
      return v.render()
    }
  }
}

export class HypermediaAPI {
  static async all() {
    const result = await API.getAllPosts()
    console.log(result)
    return TemplateHTML.render(result.posts.map(post => TemplateHTML.html`
      <div>
        <h2><a href=${post.url}>${post.url}</a></h2>
        ${post.blurb ? TemplateHTML.html`<p class="blurb">${post.blurb}</p>` : null}
      </div>
    `))
  }
}