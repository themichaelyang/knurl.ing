import { SQL } from "bun"

type Post = {
  id: number
  link_id: number
  created_at: string
}

export class PostTable {
  constructor(private sql: SQL) {
    this.sql = sql
  }

  async create(linkId: number): Promise<Post> {
    return (await this.sql`
      insert into post (link_id)
      values (${linkId})
      returning *
    `)[0]!
  }

  async fromLinkId(linkId: number): Promise<Post[] | null> {
    return (await this.sql`
      select * from post where post.link_id = ${linkId}
    `)
  }
}