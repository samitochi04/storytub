# StoryTub - Backend Server

> Fastify API for video generation, Stripe billing, emails, and monitoring.
> Auth, profiles, and user dashboard are handled **directly by the frontend via Supabase client** (BaaS).

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────────────┐  │
│  │  Supabase Client     │      │  Server API Calls            │  │
│  │  (Direct - no backend)│     │  (Needs server-side logic)   │  │
│  │                      │      │                              │  │
│  │  • Auth (signup/login)│     │  • POST /guest/generate      │  │
│  │  • Profile CRUD      │      │  • POST /videos/generate     │  │
│  │  • Videos list/read  │      │  • POST /stripe/checkout     │  │
│  │  • Notifications     │      │  • POST /stripe/webhook      │  │
│  │  • Settings (lang)   │      │  • POST /coupons/redeem      │  │
│  │  • Blog posts read   │      │  • Admin endpoints           │  │
│  └──────────────────────┘      └──────────────────────────────┘  │
│           │                               │                      │
│           ▼                               ▼                      │
│     Supabase (BaaS)              StoryTub Server (this)          │
└──────────────────────────────────────────────────────────────────┘
```

### What the frontend handles directly (Supabase Client)

| Feature | Supabase Feature | Notes |
|---------|-----------------|-------|
| Auth (signup, login, OAuth, reset) | `supabase.auth` | RLS protects all data |
| Profile read/update | `supabase.from('profiles')` | RLS: own row only |
| Videos list & details | `supabase.from('videos')` | RLS: own videos only |
| Notifications | `supabase.from('notifications')` | RLS: own notifications |
| Settings (language, theme) | `supabase.from('profiles').update()` | Stored in profile |
| Cookie consent | `supabase.from('cookie_consents')` | Insert-only |
| Policy acceptance | `supabase.from('policy_acceptances')` | Insert-only |
| Blog posts (public) | `supabase.from('blog_posts')` | RLS: published only |
| Templates list | `supabase.from('templates')` | Public read |
| Credit transactions | `supabase.from('credit_transactions')` | RLS: own only |
| Subscription info | `supabase.from('subscriptions')` | RLS: own only |
| Support tickets | `supabase.from('support_tickets')` | RLS: own only |
| Real-time video status | `supabase.channel().on()` | Realtime subscription |

### What the backend handles (this server)

| Feature | Why Server-Side |
|---------|----------------|
| Guest video generation | IP rate limiting, abuse prevention - can't trust client |
| Video generation pipeline | BullMQ queue → Gemini → Images → TTS → Render (heavy compute) |
| Stripe webhooks | Stripe requires a server endpoint; secrets must stay private |
| Stripe checkout sessions | Creates Stripe sessions with server-side secret key |
| Credit deduction | Atomic DB function called with service_role (bypasses RLS) |
| Coupon redemption | Server-side validation to prevent manipulation |
| Email sending | SMTP credentials must stay private |
| AI script generation | Gemini API key must stay private |
| Admin API | Staff actions use service_role key (full DB access) |
| Analytics aggregation | Cron jobs that compute daily metrics |
| Monitoring | Health checks, error tracking |

---

## Folder Structure

```
server/
├── .env.example                    # All required env vars
├── package.json
├── src/
│   ├── server.js                   # Entry - start Fastify + worker
│   ├── app.js                      # Fastify instance, plugins, routes
│   │
│   ├── config/
│   │   ├── env.js                  # Env validation & export
│   │   ├── supabase.js             # Supabase service_role client
│   │   ├── stripe.js               # Stripe instance
│   │   ├── redis.js                # IORedis connection
│   │   └── gemini.js               # Google Generative AI client
│   │
│   ├── plugins/
│   │   ├── auth.js                 # Fastify decorator: verifyUser (JWT)
│   │   ├── staff.js                # Fastify decorator: requireStaff(role)
│   │   └── ip.js                   # Extract real IP from headers
│   │
│   ├── routes/
│   │   ├── guest.routes.js         # Guest session + anonymous generation
│   │   ├── video.routes.js         # Authenticated video generation
│   │   ├── stripe.routes.js        # Webhooks, checkout, portal
│   │   ├── coupon.routes.js        # Server-side coupon redemption
│   │   ├── email.routes.js         # Admin email/campaign management
│   │   ├── admin.routes.js         # Admin-only CRUD + analytics
│   │   └── health.routes.js        # Healthcheck + readiness
│   │
│   ├── services/
│   │   ├── ai.service.js           # Gemini script generation
│   │   ├── image.service.js        # Pixabay + Unsplash fetch
│   │   ├── tts.service.js          # Kokoro TTS HTTP calls
│   │   ├── whisper.service.js      # faster-whisper HTTP calls
│   │   ├── render.service.js       # Remotion render trigger
│   │   ├── video.service.js        # Orchestrates full pipeline
│   │   ├── stripe.service.js       # Stripe checkout, portal, sub management
│   │   ├── credit.service.js       # Credit deduction / addition (DB RPCs)
│   │   ├── email.service.js        # Nodemailer + template rendering
│   │   ├── guest.service.js        # Guest session + IP rate limit
│   │   └── analytics.service.js    # Daily aggregation queries
│   │
│   ├── jobs/
│   │   ├── queues.js               # BullMQ queue definitions
│   │   ├── worker.js               # BullMQ worker (video pipeline)
│   │   └── cron.js                 # Scheduled: analytics, cleanup, emails
│   │
│   └── lib/
│       ├── logger.js               # Pino logger
│       └── errors.js               # AppError class
```

---

## API Routes

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Healthcheck (server + redis + supabase) |
| `GET` | `/health/ready` | Readiness probe |
| `POST` | `/guest/session` | Create guest session (returns session_token) |
| `POST` | `/guest/generate` | Generate preview video (IP rate limited) |
| `POST` | `/stripe/webhook` | Stripe webhook (raw body, signature verified) |

### Authenticated (Supabase JWT)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/videos/generate` | Start video generation (deducts credits) |
| `POST` | `/videos/:id/retry` | Retry failed video |
| `POST` | `/stripe/checkout` | Create Stripe Checkout session |
| `POST` | `/stripe/portal` | Create Stripe Customer Portal session |
| `POST` | `/coupons/redeem` | Validate + redeem coupon |

### Staff - Agent (agent + manager + admin)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/admin/tickets` | List support tickets |
| `PATCH` | `/admin/tickets/:id` | Update ticket status/assignment |
| `GET` | `/admin/users` | Search/list users |
| `PATCH` | `/admin/users/:id` | Update user profile |

### Staff - Manager (manager + admin)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/coupons` | Create coupon |
| `PATCH` | `/admin/coupons/:id` | Update coupon |
| `DELETE` | `/admin/coupons/:id` | Delete coupon |
| `POST` | `/admin/staff` | Create agent account |
| `GET` | `/admin/blogs` | List all blog posts |
| `POST` | `/admin/blogs` | Create blog post |
| `PATCH` | `/admin/blogs/:id` | Update blog post |
| `DELETE` | `/admin/blogs/:id` | Delete blog post |
| `POST` | `/admin/emails/campaigns` | Create email campaign |
| `POST` | `/admin/emails/campaigns/:id/send` | Send campaign |

### Staff - Admin only

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/staff` | Create manager or agent |
| `PATCH` | `/admin/staff/:id` | Update staff role/permissions |
| `DELETE` | `/admin/staff/:id` | Deactivate staff |
| `GET` | `/admin/analytics` | Dashboard analytics |
| `GET` | `/admin/analytics/revenue` | Revenue breakdown |
| `GET` | `/admin/audit-logs` | Audit log viewer |
| `GET` | `/admin/billing` | Billing overview |
| `GET` | `/admin/monitoring` | System metrics |

---

## 5-Step Implementation Plan

### Step 1 - Foundation & Configuration
> Core project setup. After this step the server starts and responds to healthchecks.

- `src/config/env.js` - validate all env vars, fail fast on missing
- `src/config/supabase.js` - Supabase `service_role` admin client
- `src/config/stripe.js` - Stripe instance
- `src/config/redis.js` - IORedis connection with reconnect
- `src/config/gemini.js` - Google Generative AI client
- `src/lib/logger.js` - Pino structured logger
- `src/lib/errors.js` - `AppError` class for consistent error responses
- `src/plugins/auth.js` - Fastify plugin: `verifyUser` (decodes Supabase JWT → `request.user`)
- `src/plugins/staff.js` - Fastify plugin: `requireStaff('admin'|'manager'|'agent')`
- `src/plugins/ip.js` - Extract real client IP from `x-forwarded-for` / `cf-connecting-ip`
- `src/app.js` - Fastify app: CORS, helmet, rate-limit, error handler, plugin registration
- `src/server.js` - Start server
- `src/routes/health.routes.js` - `GET /health` + `GET /health/ready`

### Step 2 - Guest Flow & Video Generation Pipeline
> The core product: anonymous preview + authenticated generation via BullMQ.

- `src/services/guest.service.js` - IP rate limiting, session CRUD, video linking
- `src/services/ai.service.js` - Gemini prompt → structured script JSON
- `src/services/image.service.js` - Pixabay fetch with Unsplash fallback
- `src/services/tts.service.js` - HTTP call to self-hosted Kokoro TTS
- `src/services/whisper.service.js` - HTTP call to self-hosted faster-whisper
- `src/services/render.service.js` - Remotion render trigger + upload to Supabase
- `src/services/video.service.js` - Orchestrator: script → images → TTS → timestamps → render
- `src/services/credit.service.js` - `deduct_video_credits` / `add_credits` RPC wrappers
- `src/jobs/queues.js` - BullMQ `videoQueue` + `emailQueue` definitions
- `src/jobs/worker.js` - Video worker: picks job, runs pipeline, updates status
- `src/routes/guest.routes.js` - `POST /guest/session` + `POST /guest/generate`
- `src/routes/video.routes.js` - `POST /videos/generate` + `POST /videos/:id/retry`

### Step 3 - Stripe & Billing
> Payments, subscriptions, credit bundles, coupon redemption.

- `src/services/stripe.service.js` - checkout session, portal, subscription CRUD
- `src/routes/stripe.routes.js` - webhook handler + checkout + portal endpoints
- `src/routes/coupon.routes.js` - `POST /coupons/redeem`
- Webhook events handled:
  - `checkout.session.completed` → allocate credits/activate sub
  - `invoice.payment_succeeded` → renew credits
  - `invoice.payment_failed` → mark past_due
  - `customer.subscription.updated` → upgrade/downgrade
  - `customer.subscription.deleted` → cancel

### Step 4 - Email System
> Transactional emails, marketing campaigns, template rendering.

- `src/services/email.service.js` - Nodemailer transport, template rendering, send
- `src/jobs/worker.js` (extend) - Email worker processes `emailQueue` jobs
- `src/routes/email.routes.js` - Admin campaign CRUD + send
- Automated emails triggered by events:
  - Signup → welcome email (to user) + new user notification (to admin)
  - Video ready → notification email
  - Subscription created/canceled/renewed → billing emails
  - Credits low → warning email
  - Payment receipt → PDF link

### Step 5 - Admin API & Monitoring
> Staff dashboard endpoints, analytics cron, audit logging, system health.

- `src/services/analytics.service.js` - Daily aggregation queries, dashboard data
- `src/jobs/cron.js` - Scheduled tasks: analytics rollup, expired video cleanup, guest session cleanup
- `src/routes/admin.routes.js` - Full admin API (users, videos, blogs, coupons, staff, analytics, billing, audit logs, monitoring)
- `src/routes/email.routes.js` (extend) - Campaign management endpoints
- Audit logging middleware (records staff actions in `audit_logs`)

---

## Running

```bash
# Install dependencies
npm install

# Copy env
cp .env.example .env
# Fill in real values

# Development (auto-restart on changes)
npm run dev

# Production
npm start

# Run BullMQ worker (separate process)
npm run worker

# Run cron jobs (separate process)
npm run cron
```

---

## Key Design Decisions

| Decision | Reasoning |
|----------|-----------|
| **Fastify** over Express | 2-3x faster, built-in schema validation, better hooks system, structured logging via Pino |
| **ESM** (`"type": "module"`) | Modern JS, native `import/export`, better tree-shaking |
| **service_role key** on server only | Bypasses RLS for admin actions, credit deduction, guest flow. Never exposed to frontend |
| **BullMQ** separate worker process | Video rendering is CPU-heavy. Isolating the worker prevents blocking the API |
| **Pino** logger | Structured JSON logs, lightweight, Fastify's default logger |
| **No TypeScript** | Per project requirement. JS with ESM keeps things simple |
