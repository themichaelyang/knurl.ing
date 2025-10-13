import { SQL } from "bun"

type Link = {
  id: number
  url: string
  host: string
  tld: string
}

type MaybeLink = Link | null

export class LinkTable {
  constructor(private sql: SQL) {
    this.sql = sql
  }

  async fromId(id: number): Promise<MaybeLink> {
    return (await this.sql`
      select * from link where id = ${id}
    `)[0]
  }

  async fromURL(url: string): Promise<MaybeLink> {
    return (await this.sql`
      select * from link where url = ${url}
    `)[0]
  }

  async createFromURL(parsed: URL): Promise<Link> {
    return (await this.sql`
      insert into link (url, host, tld) 
      values (${parsed.href}, ${parsed.host}, ${parsed.hostname.split('.').pop()})
      returning *
    `)[0]!
  }

  async getOrCreateFromURL(parsed: URL): Promise<Link> {
    let link = await this.fromURL(parsed.href)
    link ??= await this.createFromURL(parsed)
    return link
  }
}