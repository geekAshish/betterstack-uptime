import { createClient } from "redis";

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

type WebsiteEvent = { url: string, id: string }

async function xAdd({url, id}: WebsiteEvent) {
  await client.xAdd(
    'betteruptime:website',
    "*", {
      url,
      id
    }
  )
}

export async function xAddBulk(website: WebsiteEvent[]) {
  for (let i = 0; i < website.length; i++) {
    await xAdd({
      url: website[i]!.url,
      id: website[i]!.id
    }) 
  }
}
