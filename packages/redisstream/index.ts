import { createClient } from "redis";

const STREAM_NAME = 'betteruptime:website';
const READ_COUNT = 5;

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

type WebsiteEvent = { url: string, id: string }

async function xAdd({url, id}: WebsiteEvent) {
  await client.xAdd(
    STREAM_NAME,
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


export async function xReadGroup(consumerGroup: string, workerId: string): Promise<any> {
  const res = await client.xReadGroup(
    consumerGroup, workerId, {
      key: STREAM_NAME,
      id: ">"
    }, {
      "COUNT": READ_COUNT
    }
  )

  return res
}

export async function xAck(consumerGroup: string, eventId: string) {
  const res = await client.xAck(STREAM_NAME, consumerGroup, eventId)
}


