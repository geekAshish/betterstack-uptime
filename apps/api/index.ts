import express from 'express'
import { prismaclient } from 'store/client';
import { AuthInput } from './types';
import { password } from 'bun';

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
})

app.post("/user/signin", (req, res) => {
  const data = AuthInput.safeParse(req.body.data);
  if (!data.success) {
    res.status(403).send("")
  }
})

app.post("/user/signup", async (req, res) => {
  const data = AuthInput.safeParse(req.body.data);
  if (!data.success) {
    res.status(403).send("")
  }

  try {
    await prismaclient.user.create({
    data: {
      username: data.data?.username,
      password: data.data?.password,
    }
  })
  } catch (error) {
    res.status(403).send(""); // 31:50
  }
})

app.listen("3001", (err) => {
  console.log(`sever starting at port: 3000`);
  console.error(`something went wrong while starting server: ${err}`);
})
