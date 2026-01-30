import axios from "axios";
import { xAck, xAckBulk, xReadGroup } from "redisstream/client";
import {prismaclient} from 'store/client'

const REGION_ID = process.env.REGION_ID;
const WORKER_ID = process.env.WORKER_ID;

if (!REGION_ID || REGION_ID === undefined) {
  throw new Error("Region not provided");
}
if (!WORKER_ID || WORKER_ID === undefined) {
  throw new Error("worker not provided");
}


async function main() {
  while(1) {
    // read from stream 
    const response = await xReadGroup(REGION_ID!, WORKER_ID!)

    if (!response) {
      continue;
    }

    const promises = response?.map(({redisId, message}) => {
      return new Promise<void>((resolve, reject) => {
        const url = message.url;
        const websiteId = message.id;
        const startTime = Date.now();

        axios
          .get(url)
          .then(async () => {
            const endTime = Date.now()
            await prismaclient.website_tick.create({
              data: {
                response_time_ms: endTime - startTime,
                status: 'Up',
                region_id: REGION_ID,
                website_id: websiteId
              }
            })

            resolve();
          })
          .catch(async () => {
            const endTime = Date.now()
            await prismaclient.website_tick.create({
              data: {
                response_time_ms: endTime - startTime,
                status: 'Down',
                region_id: REGION_ID,
                website_id: websiteId
              }
            })

            resolve();
          })
      })
    })

    // process the website and store the result in the DB. TODO: It should probably
    // be routed through a queue in a bulk DB request.

    await Promise.all(promises);

    // ack back to the queue that this event has been processed
    const ids = response.map(({id}) => id)
    xAckBulk(REGION_ID!, ids)
  }
}

main()
