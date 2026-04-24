// failedWebhook.model.ts
import mongoose from "mongoose";

const failedWebhookSchema = new mongoose.Schema({
  url: String,
  payload: Object,
  secret: String,
  attempts: Number,
  error: String,
  failedAt: {
    type: Date,
    default: Date.now,
  },
});

export const FailedWebhook = mongoose.model(
  "FailedWebhook",
  failedWebhookSchema,
);
