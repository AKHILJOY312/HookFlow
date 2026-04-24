import mongoose from "mongoose";

const schema = new mongoose.Schema({
  url: String,
  event: String,
  secret: String,
});

export const Webhook = mongoose.model("Webhook", schema);
