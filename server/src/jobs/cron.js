import cron from "node-cron";
import logger from "../lib/logger.js";
import {
  cleanupExpiredVideos,
  cleanupGuestSessions,
  rollupAnalytics,
  runScheduledCampaigns,
} from "../services/analytics.service.js";

async function runJob(label, fn) {
  try {
    const result = await fn();
    logger.info({ result }, `Cron: ${label} completed`);
  } catch (error) {
    logger.error({ error }, `Cron: ${label} failed`);
  }
}

export async function startCron() {
  logger.info("Cron scheduler started");

  cron.schedule("5 0 * * *", () => {
    runJob("daily analytics rollup", () => rollupAnalytics());
  });

  cron.schedule("0 * * * *", () => {
    runJob("expired video cleanup", () => cleanupExpiredVideos());
  });

  cron.schedule("15 2 * * *", () => {
    runJob("guest session cleanup", () => cleanupGuestSessions());
  });

  cron.schedule("*/10 * * * *", () => {
    runJob("scheduled campaign dispatch", () => runScheduledCampaigns());
  });

  await runJob("startup scheduled campaign dispatch", () =>
    runScheduledCampaigns(),
  );
}

startCron().catch((error) => {
  logger.fatal({ error }, "Failed to start cron scheduler");
  process.exit(1);
});
