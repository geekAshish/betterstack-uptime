import express from 'express'
import { prismaclient } from 'store/client';
import { AuthInput } from './types';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middleware';

const app = express();

app.use(express.json());


app.get("/website", authMiddleware, async (req, res) => {
  const website = await prismaclient.website.create({
    data: {
      url: req.body.url,
      timeAdded: new Date(),
      user_id: req.userId
    }
  })

  res.json({
    id: website.id
  })
})

app.get("/status/:websiteId", authMiddleware, async (req, res) => {
    const website = await prismaclient.website.findFirst({
        where: {
            user_id: req.userId!,
            id: req.params.websiteId,
        },
        include: {
            ticks: {
                orderBy: [{
                    createdAt: 'desc',
                }],
                take: 10 // last 30 min website data , 3min interval * 10
            }
        }
    })

    if (!website) {
        res.status(409).json({
            message: "Not found"
        })
        return;
    }

    res.json({
        url: website.url,
        id: website.id,
        user_id: website.user_id
    })

})

app.post("/user/signup", async (req, res) => {
  const data = AuthInput.safeParse(req.body);
  if (!data.success) {
    res.status(403).send("")
  }

  try {
    const user = await prismaclient.user.create({
    data: {
      username: data.data?.username,
      password: data.data?.password,
    }
  })
  res.json({
    id: user.id
  })
  } catch (error) {
    res.status(403).send("");
  }
})

app.post("/user/signin", async (req, res) => {
  const data = AuthInput.safeParse(req.body);
  if (!data.success) {
    res.status(403).send("")
  }

  let user = await prismaclient.user.findFirst({
    where: {
      username: data.data?.username
    }
  })

  if (user?.password !== data.data?.password) {
    res.status(403).send("")
  }

  const token = jwt.sign({
    sub: user.id
  }, process.env.JWT_SECRET!)

  res.json({
    jwt: token
  })
})


app.get("/websites", authMiddleware, async (req, res) => {
  const websites = await prismaclient.website.findMany({
    where: {
      user_id: req.userId
    }
  })

  res.json({
    websites
  })
})

app.listen("3001", (err) => {
  console.log(`sever starting at port: 3000`);
  console.error(`something went wrong while starting server: ${err}`);
})
