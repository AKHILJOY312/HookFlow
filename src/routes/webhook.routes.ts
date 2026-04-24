import { Router } from "express";
import crypto from "crypto";
import { Webhook } from "../models/webhook.model";
import { FailedWebhook } from "../models/failedWebhook.model";
import { enqueueWebhookDispatch } from "../services/webhookDispatch.service";

export const webhookRouter = Router();

webhookRouter.post("/webhook", async (req, res) => {
  const { url, event } = req.body as { url?: string; event?: string };

  if (!url || !event) {
    return res.status(400).json({ error: "`url` and `event` are required" });
  }

  const webhook = await Webhook.create({
    url,
    event,
    secret: crypto.randomBytes(20).toString("hex"),
  });

  return res.json(webhook);
});

webhookRouter.post("/trigger", async (req, res) => {
  const { event, data } = req.body as { event?: string; data?: unknown };

  if (!event) {
    return res.status(400).json({ error: "`event` is required" });
  }

  const webhooks = await Webhook.find({ event });

  for (const webhook of webhooks) {
    if (!webhook.url || !webhook.secret) {
      continue;
    }

    await enqueueWebhookDispatch({
      url: webhook.url,
      payload: data,
      secret: webhook.secret,
    });
  }

  return res.send("Event triggered");
});

webhookRouter.get("/failed-webhooks", async (_req, res) => {
  const failed = await FailedWebhook.find().sort({ failedAt: -1 });
  return res.json(failed);
});

webhookRouter.post("/retry-failed/:id", async (req, res) => {
  const job = await FailedWebhook.findById(req.params.id);

  if (!job) {
    return res.status(404).send("Not found");
  }

  if (!job.url || !job.secret) {
    return res.status(500).send("Invalid stored webhook payload");
  }

  await enqueueWebhookDispatch({
    url: job.url,
    payload: job.payload,
    secret: job.secret,
  });

  return res.send("Retry queued");
});
