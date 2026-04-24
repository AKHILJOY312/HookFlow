import { Worker, Job } from "bullmq";
import axios from "axios";
import crypto from "crypto";
import { redisConfig } from "./config/redis";
import { FailedWebhook } from "./models/failedWebhook.model";
import { connectMongo } from "./config/mongo";
import { WEBHOOK_QUEUE_NAME } from "./constants/queue";

void connectMongo("Worker").catch((error) => {
  console.error("Worker MongoDB connection error:", error);
  process.exit(1);
});

const worker = new Worker(
  WEBHOOK_QUEUE_NAME,
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
