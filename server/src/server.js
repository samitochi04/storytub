import { buildApp } from "./app.js";
import env from "./config/env.js";
import redis from "./config/redis.js";

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: env.port, host: env.host });
    app.log.info(
      `StoryTub server running at http://${env.host}:${env.port} [${env.nodeEnv}]`,
    );
  } catch (err) {
    app.log.fatal({ err }, "Failed to start server");
    process.exit(1);
  }

  // Start BullMQ workers when a Redis instance exists (it handles reconnection internally)
  if (redis) {
    await import("./jobs/worker.js");
    app.log.info("BullMQ workers started");
  } else {
    app.log.info("REDIS_URL not configured — BullMQ workers skipped");
  }

  // Graceful shutdown
  const shutdown = async (signal) => {
    app.log.info(`${signal} received — shutting down…`);
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
