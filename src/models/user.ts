import { SQL } from "bun"

export type UserWritable = {
  username: string
} & UserUpdatable

export type UserUpdatable = {
  password_hash: string
  email: string | null
  url: string | null
}

export type UserReadable = {
  id: number
  created_at: string
  updated_at: string
} & UserWritable


export class UserTable {
  constructor(private sql: SQL) {
    this.sql = sql
  }

  async fromUsername(username: string): Promise<UserReadable | null> {
    return (await this.sql`
      select * from user where user.username = ${username}
    `)[0]
  }

  async fromId(id: number): Promise<UserReadable | null> {
    return (await this.sql`
      select * from user where user.id = ${id}
    `)[0]
  }

  async insert(user: UserWritable): Promise<UserReadable> {
    return (await this.sql`
      insert into user (username, password_hash, email, url)
      values (${user.username}, ${user.password_hash}, ${user.email}, ${user.url})
      returning *
    `)[0]!
  }

  async update(user: { id: number } & UserUpdatable): Promise<UserReadable> {
    return (await this.sql`
      update user set password_hash = ${user.password_hash}, email = ${user.email}, url = ${user.url}
      where id = ${user.id}
      returning *
    `)[0]!
  }
}