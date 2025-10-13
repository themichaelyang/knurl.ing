import { SQL } from "bun"

type Post = {
  id: number
  link_id: number
  created_at: string
}

type MaybePost = Post | null

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
}