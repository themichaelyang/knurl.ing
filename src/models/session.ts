import { SQL } from "bun"

export type SessionWritable = {
  id: string
  user_id: number
  expires_at: string
}

export type SessionReadable = {
  created_at: string
  updated_at: string
  expires_at: string
} & SessionWritable

export class SessionTable {
  constructor(private sql: SQL) {
    this.sql = sql
  }

  async delete(id: string): Promise<SessionReadable | null> {
    return (await this.sql`
      delete from session where session.id = ${id}
      returning *
    `)[0]
  }

  async insert(session: SessionWritable): Promise<SessionReadable | null> {
    return (await this.sql`
      insert into session (id, user_id, expires_at)
      values (${session.id}, ${session.user_id}, ${session.expires_at})
      returning *
    `)[0]
  }

  async fromId(id: string): Promise<SessionReadable | null> {
    return (await this.sql`
      select * from session where session.id = ${id}
    `)[0] ?? null
  }
}