import { SQL } from "bun"

type PostWritable = {
  link_id: number
  url: string
  user_id: number
  blurb: string | null
}

export type Post = {
  id: number
  created_at: string
} & PostWritable


export class PostTable {
  constructor(private sql: SQL) {
    this.sql = sql
  }

  async insert(post: PostWritable): Promise<Post> {
    return (await this.sql`
      insert into post (link_id, url, user_id, blurb)
      values (${post.link_id}, ${post.url}, ${post.user_id}, ${post.blurb})
      returning *
    `)[0]!
  }

  async fromLinkId(linkId: number): Promise<Post[] | null> {
    return (await this.sql`
      select * from post where post.link_id = ${linkId}
    `)
  }

  async getAll(): Promise<Post[]> {
    return (await this.sql`
      select * from post
    `)
  }
}