import Redis from "ioredis";
import env from "./env.js";
import logger from "../lib/logger.js";

let redis = null;
let redisReady = false;

if (env.redisUrl) {
  try {
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: null, // required by BullMQ
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn(
            "Redis unavailable after 3 attempts — running without queue",
          );
          return null; // stop retrying
        }
        return Math.min(times * 500, 2000);
      },
    });

    redis.on("connect", () => {
      redisReady = true;
      logger.info("Redis connected");
    });
    redis.on("close", () => {
      redisReady = false;
    });
    redis.on("error", () => {
      redisReady = false;
    });

    // Non-blocking connect attempt
    redis.connect().catch(() => {
      logger.warn("Redis not available — job queues disabled");
    });
  } catch {
    redis = null;
    logger.warn("Redis not available — job queues disabled");
  }
} else {
  logger.info("REDIS_URL not set — job queues disabled");
}

export function isRedisReady() {
  return redisReady;
}

export default redis;
