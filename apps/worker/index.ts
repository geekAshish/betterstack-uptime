import { xAck, xReadGroup } from "redisstream/client";

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
    xReadGroup(REGION_ID, '') // 27:55


    // process the website and store the result in the DB. TODO: It should probably
    // be routed through a queue in a bulk DB request.

    // ack back to the queue that this event has been processed
    xAck(REGION_ID!, "")
  }
}

main()
