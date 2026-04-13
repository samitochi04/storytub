import { Queue } from "bullmq";
import redis from "../config/redis.js";

const defaultOpts = { connection: redis };

/**
 * Video generation queue.
 * Jobs contain { videoId } — the worker fetches full data from DB.
 */
export const videoQueue = new Queue("video-generation", {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 10_000 },
    removeOnComplete: { age: 7 * 24 * 3600 }, // keep 7 days
    removeOnFail: { age: 30 * 24 * 3600 }, // keep 30 days
  },
});

/**
 * Email sending queue (used in Step 4).
 */
export const emailQueue = new Queue("email-sending", {
  ...defaultOpts,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5_000 },
    removeOnComplete: { age: 3 * 24 * 3600 },
    removeOnFail: { age: 14 * 24 * 3600 },
  },
});
