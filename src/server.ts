import { createApp } from "./app";
import { env } from "./config/env";
import { connectMongo } from "./config/mongo";

async function start() {
  try {
    await connectMongo("Server");
    const app = createApp();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

void start();
