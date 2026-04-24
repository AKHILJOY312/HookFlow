import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";
import { Webhook } from "./models/model";
import { webhookQueue } from "./queue";
import { FailedWebhook } from "./models/failedWebhook.model";

dotenv.config();
console.log("PORT RAW:", process.env.REDIS_PORT);
console.log("PORT NUMBER:", Number(process.env.REDIS_PORT));
const app = express();
app.use(express.json());

// 👉 Register webhook
app.post("/webhook", async (req, res) => {
  const { url, event } = req.body;
  if (!url && !event) {
    res.status(404).json("please give the body");
  }
  const webhook = await Webhook.create({
    url,
    event,
    secret: crypto.randomBytes(20).toString("hex"),
  });

  res.json(webhook);
});

// 👉 Trigger event
app.post("/trigger", async (req, res) => {
  const { event, data } = req.body;

  const webhooks = await Webhook.find({ event });
  console.log("Adding job to queue...");
  for (const w of webhooks) {
    await webhookQueue.add(
      "send",
      {
        url: w.url,
        payload: data,
        secret: w.secret,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    );
  }

  res.send("Event triggered");
});

app.get("/failed-webhooks", async (req, res) => {
  const failed = await FailedWebhook.find().sort({ failedAt: -1 });
  res.json(failed);
});

app.post("/retry-failed/:id", async (req, res) => {
  const job = await FailedWebhook.findById(req.params.id);

  if (!job) return res.status(404).send("Not found");

  await webhookQueue.add(
    "send",
    {
      url: job.url,
      payload: job.payload,
      secret: job.secret,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    },
  );

  res.send("Retry queued");
});

async function start() {
  await mongoose
    .connect(process.env.MONGO_URI as string)
    .then(() => console.log("Connected to MongoDB 🚀"))
    .catch((err) => console.error("MongoDB connection error:", err));

  app.listen(process.env.PORT, () => {
    console.log("Server running");
  });
}

start();
