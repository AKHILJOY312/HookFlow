import { Worker, Job } from "bullmq";
import axios from "axios";
import crypto from "crypto";
import { redisConfig } from "./config/redis";
import { FailedWebhook } from "./models/failedWebhook.model";
import mongoose from "mongoose";
import * as dotenv from "dotenv"; // 1. Use * as dotenv
import path from "path";

// 2. Point it explicitly to your .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 3. Debug check
console.log("Worker URI Check:", process.env.MONGO_URI ? "Found" : "NOT FOUND");
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("Worker connected to MongoDB 🚀"))
  .catch((err) => console.error("Worker MongoDB connection error:", err));

const worker = new Worker(
  "webhook",
  async (job: Job) => {
    const { url, payload, secret } = job.data;

    const signature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");

    try {
      await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-signature": signature,
        },
        timeout: 5000,
      });

      console.log(`Job ${job.id} sent successfully ✅`);
    } catch (err: any) {
      console.error(`Attempt ${job.attemptsMade + 1} failed for job ${job.id}`);

      throw err;
    }
  },
  {
    connection: redisConfig,
    concurrency: 5,

    settings: {},
  },
);

worker.on("failed", async (job, err) => {
  if (!job) {
    console.error(
      "Worker failed to process a job, but job object is undefined:",
      err.message,
    );
    return;
  }

  if (job.attemptsMade === job.opts.attempts) {
    console.error("💀 Permanently failed:", job.data);
    const errorCode = (err as any).code || "UNKNOWN_ERROR";
    try {
      await FailedWebhook.create({
        url: job.data.url,
        payload: job.data.payload,
        secret: job.data.secret,
        attempts: job.attemptsMade,
        error: errorCode,
      });
    } catch (dbErr) {
      console.error("Failed to save to DB:", dbErr);
    }
  }
});

worker.on("error", (err) => {
  console.error("Worker Error:", err);
});
