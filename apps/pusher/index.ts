import {prismaclient} from "store/client";
import { xAddBulk } from "redisstream/client";

const INTERVAL_TIME = 3 * 60 * 1000;
async function main() {
  let websites  = await prismaclient.website.findMany({
    select: {
      url: true,
      id: true
    }
  })

  await xAddBulk(
    websites.map((w: {url: string, id: string}) => {
      return {
        url: w.url,
        id: w.id,
      }
    })
  )
}


setInterval(() => {
  main()
}, INTERVAL_TIME);

