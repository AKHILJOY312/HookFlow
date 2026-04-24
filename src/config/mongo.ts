import mongoose from "mongoose";
import { env } from "./env";

export async function connectMongo(logPrefix: string): Promise<void> {
  await mongoose.connect(env.mongoUri);
  console.log(`${logPrefix} connected to MongoDB`);
}
