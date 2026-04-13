import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import env from "./config/env.js";
import logger from "./lib/logger.js";
import { AppError } from "./lib/errors.js";

// Plugins
import authPlugin from "./plugins/auth.js";
import staffPlugin from "./plugins/staff.js";
import ipPlugin from "./plugins/ip.js";

// Routes
import healthRoutes from "./routes/health.routes.js";
import guestRoutes from "./routes/guest.routes.js";
import videoRoutes from "./routes/video.routes.js";
import stripeRoutes from "./routes/stripe.routes.js";
import couponRoutes from "./routes/coupon.routes.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.logLevel,
      ...(env.isDev && {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss" },
        },
      }),
    },
    // Keep raw body for Stripe webhook signature verification
    rawBody: true,
  });

  // ── Security ──────────────────────────────────────────────────
  await app.register(helmet, {
    contentSecurityPolicy: false, // API server — not serving HTML
  });

  // ── CORS ──────────────────────────────────────────────────────
  await app.register(cors, {
    origin: env.corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // ── Rate limiting ─────────────────────────────────────────────
  await app.register(rateLimit, {
    max: env.rateLimitMax,
    timeWindow: "1 minute",
    keyGenerator: (request) =>
      request.headers["cf-connecting-ip"] ||
      request.headers["x-real-ip"] ||
      request.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      request.ip,
  });

  // ── Plugins ───────────────────────────────────────────────────
  await app.register(ipPlugin);
  await app.register(authPlugin);
  await app.register(staffPlugin);

  // ── Stripe raw body hook ──────────────────────────────────────
  // Fastify v5+ supports rawBody natively via { rawBody: true } option.
  // For webhook, access request.rawBody in the route handler.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (req, body, done) => {
      try {
        // Store raw buffer for Stripe webhook verification
        req.rawBody = body;
        const json = JSON.parse(body.toString());
        done(null, json);
      } catch (err) {
        done(err);
      }
    },
  );

  // ── Routes ────────────────────────────────────────────────────
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(guestRoutes, { prefix: "/guest" });
  await app.register(videoRoutes, { prefix: "/videos" });
  await app.register(stripeRoutes, { prefix: "/stripe" });
  await app.register(couponRoutes, { prefix: "/coupons" });

  // Step 4+: more routes will be registered here
  // await app.register(adminRoutes,  { prefix: '/admin' });
  // await app.register(emailRoutes,  { prefix: '/admin/emails' });

  // ── Global error handler ──────────────────────────────────────
  app.setErrorHandler((error, request, reply) => {
    // AppError — trusted, send as-is
    if (error instanceof AppError) {
      request.log.warn({ err: error, code: error.code }, error.message);
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }

    // Fastify validation error
    if (error.validation) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: error.message,
      });
    }

    // Rate limit
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      });
    }

    // Unexpected — log full error, send generic message
    request.log.error({ err: error }, "Unhandled error");
    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: env.isProd ? "Something went wrong" : error.message,
    });
  });

  // ── 404 handler ───────────────────────────────────────────────
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: "NOT_FOUND",
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  return app;
}
