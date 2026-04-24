import {
  DEFAULT_WEBHOOK_JOB_OPTIONS,
  WEBHOOK_JOB_NAME,
} from "../constants/queue";
import { webhookQueue } from "../queues/webhook.queue";

type WebhookJobPayload = {
  url: string;
  payload: unknown;
  secret: string;
};

export async function enqueueWebhookDispatch(
  payload: WebhookJobPayload,
): Promise<void> {
  await webhookQueue.add(WEBHOOK_JOB_NAME, payload, DEFAULT_WEBHOOK_JOB_OPTIONS);
}
