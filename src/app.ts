import express from "express";
import { webhookRouter } from "./routes/webhook.routes";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(webhookRouter);
  return app;
}
