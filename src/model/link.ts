import { SQL } from "bun"

type LinkWritable = {
  normalized_url: string
  // host: string
  // tld: string
} 

export type Link = {
  id: number,
  created_at: string
} & LinkWritable

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

  async fromURL(parsed: URL): Promise<MaybeLink> {
    return (await this.sql`
      select * from link where normalized_url = ${parsed.href}
    `)[0]
  }

  async insertFromURL(parsed: URL): Promise<Link> {
    return await this.insert({
      normalized_url: parsed.href,
      // host: parsed.host,
      // tld: parsed.hostname.split('.').pop()!
    })
  }

  async insert(link: LinkWritable): Promise<Link> {
    return (await this.sql`
      insert into link (normalized_url) 
      values (${link.normalized_url})
      returning *
    `)[0]!
      // -- insert into link (url, normalized_url, host, tld) 
      // -- values (${link.url}, ${link.normalized_url}, ${link.host}, ${link.tld})
  }

  async getOrInsertFromURL(parsed: URL): Promise<Link> {
    let link = await this.fromURL(parsed)
    // link ??= await this.insertFromURL(parsed, normalized_url)
    link ??= await this.insertFromURL(parsed)
    return link
  }
}