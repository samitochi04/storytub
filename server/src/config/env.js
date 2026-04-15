import "dotenv/config";

// ── Required env vars (server won't start without these) ────────
const REQUIRED = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "OPENAI_API_KEY",
];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars:\n  ${missing.join("\n  ")}`);
  process.exit(1);
}

// ── Export validated config ─────────────────────────────────────
const env = Object.freeze({
  // Server
  nodeEnv: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT, 10) || 3001,
  host: process.env.HOST || "0.0.0.0",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim()),

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  supabaseJwtSecret: process.env.SUPABASE_JWT_SECRET,

  // Redis
  redisUrl: process.env.REDIS_URL,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePrices: {
    starterMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
    starterYearly: process.env.STRIPE_PRICE_STARTER_YEARLY || "",
    premiumMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
    premiumYearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || "",
    bundleStarter: process.env.STRIPE_PRICE_BUNDLE_STARTER || "",
    bundleCreator: process.env.STRIPE_PRICE_BUNDLE_CREATOR || "",
    bundlePro: process.env.STRIPE_PRICE_BUNDLE_PRO || "",
    bundleStudio: process.env.STRIPE_PRICE_BUNDLE_STUDIO || "",
  },

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",

  // Image APIs
  pixabayApiKey: process.env.PIXABAY_API_KEY || "",
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || "",

  // Self-hosted AI
  kokoroTtsUrl: process.env.KOKORO_TTS_URL || "http://127.0.0.1:8880",
  openvoiceUrl: process.env.OPENVOICE_URL || "http://127.0.0.1:8101",
  whisperUrl: process.env.WHISPER_URL || "http://127.0.0.1:8102",

  // Email / SMTP
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: process.env.SMTP_SECURE !== "false",
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
  emailFromName: process.env.EMAIL_FROM_NAME || "StoryTub",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "noreply@storytub.com",
  adminEmail: process.env.ADMIN_EMAIL || "",

  // Cloudflare
  cdnBaseUrl: process.env.CDN_BASE_URL || "",

  // Rate limiting
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 60,
  guestMaxVideos: parseInt(process.env.GUEST_MAX_VIDEOS, 10) || 1,

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Helpers
  get isProd() {
    return this.nodeEnv === "production";
  },
  get isDev() {
    return this.nodeEnv === "development";
  },
});

export default env;
