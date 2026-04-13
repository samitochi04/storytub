import Redis from "ioredis";
import env from "./env.js";
import logger from "../lib/logger.js";

const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null, // required by BullMQ
  enableReadyCheck: true,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 5000);
    logger.warn({ attempt: times, delay }, "Redis reconnecting…");
    return delay;
  },
});

redis.on("connect", () => logger.info("Redis connected"));
redis.on("error", (err) => logger.error({ err }, "Redis error"));

export default redis;
