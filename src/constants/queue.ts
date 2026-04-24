import type { JobsOptions } from "bullmq";

export const WEBHOOK_QUEUE_NAME = "webhook";
export const WEBHOOK_JOB_NAME = "send";

export const DEFAULT_WEBHOOK_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: "exponential",
    delay: 2000,
  },
};
