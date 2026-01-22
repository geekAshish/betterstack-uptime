import express from 'express'
import { prismaclient } from 'store/client';

const app = express();

app.use(express.json());


app.get("/website", async (req, res) => {
  const website = await prismaclient.website.create({
    data: {
      url: req.body.url,
      timeAdded: new Date()
    }
  })

  res.json({
    id: website.id
  })
})

app.post("/status/:websiteId", (req, res) => {
  console.log('something');
})

app.listen("3001", (err) => {
  console.log(`sever starting at port: 3000`);
  console.error(`something went wrong while starting server: ${err}`);
})
