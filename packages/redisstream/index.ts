import { createClient } from "redis";

const STREAM_NAME = 'betteruptime:website';
const READ_COUNT = 5;

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

type WebsiteEvent = { url: string, id: string }
type MessageType = {
  id: string;
  message: {
    url: string;
    id: string;
  }
}

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


export async function xReadGroup(consumerGroup: string, workerId: string): Promise<MessageType[] | undefined> {
  const res = await client.xReadGroup(
    consumerGroup, workerId, {
      key: STREAM_NAME,
      id: ">"
    }, {
      "COUNT": READ_COUNT
    }
  )

  const messages: MessageType[] | undefined = res[0]?.messages;

  return messages
}

export async function xAck(consumerGroup: string, eventId: string) {
  const res = await client.xAck(STREAM_NAME, consumerGroup, eventId)
}

export async function xAckBulk(consumerGroup: string, eventIds: string[]) {
  eventIds.map((eventId) => {
    return xAck(consumerGroup, eventId)
  })
}
