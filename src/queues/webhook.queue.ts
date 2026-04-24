import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";
import { WEBHOOK_QUEUE_NAME } from "../constants/queue";

export const webhookQueue = new Queue(WEBHOOK_QUEUE_NAME, {
  connection: redisConfig,
});
