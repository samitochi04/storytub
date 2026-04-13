import supabase from "../config/supabase.js";
import redis from "../config/redis.js";

/**
 * GET /health      — liveness probe  (server is running)
 * GET /health/ready — readiness probe (dependencies reachable)
 */
export default async function healthRoutes(app) {
  app.get("/", async () => ({
    status: "ok",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }));

  app.get("/ready", async (request, reply) => {
    const checks = {};

    const withTimeout = (promise, ms = 3000) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), ms),
        ),
      ]);

    // Redis
    try {
      const pong = await withTimeout(redis.ping());
      checks.redis = pong === "PONG" ? "ok" : "degraded";
    } catch {
      checks.redis = "down";
    }

    // Supabase
    try {
      const { error } = await withTimeout(
        supabase.from("subscription_plans").select("id").limit(1),
      );
      checks.supabase = error ? "down" : "ok";
    } catch {
      checks.supabase = "down";
    }

    const allOk = Object.values(checks).every((v) => v === "ok");
    const statusCode = allOk ? 200 : 503;

    return reply.status(statusCode).send({
      status: allOk ? "ready" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    });
  });
}
