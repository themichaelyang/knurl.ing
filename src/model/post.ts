import { SQL } from "bun"

type PostWritable = {
  link_id: number
  url: string 
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
      insert into post (link_id, url)
      values (${post.link_id}, ${post.url})
      returning *
    `)[0]!
  }

  async fromLinkId(linkId: number): Promise<Post[] | null> {
    return (await this.sql`
      select * from post where post.link_id = ${linkId}
    `)
  }
}