import { Queue } from "bullmq";
import redis, { isRedisReady } from "../config/redis.js";
import logger from "../lib/logger.js";

/**
 * BullMQ queues — lazily initialized on first use.
 * Queue operations (add) should be guarded by isRedisReady() checks.
 */
let videoQueue;
let emailQueue;
let initialized = false;

function ensureQueues() {
  if (initialized || !redis || !isRedisReady()) return;
  initialized = true;
  try {
    videoQueue = new Queue("video-generation", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 10_000 },
        removeOnComplete: { age: 7 * 24 * 3600 },
        removeOnFail: { age: 30 * 24 * 3600 },
      },
    });

    emailQueue = new Queue("email-sending", {
      connection: redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5_000 },
        removeOnComplete: { age: 3 * 24 * 3600 },
        removeOnFail: { age: 14 * 24 * 3600 },
      },
    });
    logger.info("BullMQ queues initialized");
  } catch (err) {
    logger.warn("BullMQ queues not initialized — Redis unavailable");
  }
}

export function getVideoQueue() {
  ensureQueues();
  return videoQueue;
}

export function getEmailQueue() {
  ensureQueues();
  return emailQueue;
}
