# StoryTub - Frontend Client

> React SPA for AI-powered viral video generation. Bilingual (FR / EN).
> Connects to Supabase (Auth, DB, Storage, Realtime) and the StoryTub Fastify backend.

---

## Tech Stack

| Tool | Role |
|------|------|
| **React 19** (Vite) | SPA framework (JavaScript, no TypeScript) |
| **Tailwind CSS** | Utility-first styling, implements the StoryTub Design System |
| **React Router** | Client-side routing with public/private route guards |
| **Zustand** | Lightweight state management (auth, theme, credits, notifications) |
| **react-i18next** | Bilingual UI (FR / EN), stored in `/locales/` |
| **@supabase/supabase-js** | Auth, DB queries (RLS-protected), Realtime subscriptions, Storage |
| **Remotion Player** | In-browser video preview before server-side render |
| **react-helmet-async** | Per-page `<head>` management for SEO meta tags |
| **Lucide React** | Icon library (outline style, 1.5px stroke, round caps) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          FRONTEND                                │
│                                                                  │
│  ┌──────────────────────┐      ┌──────────────────────────────┐  │
│  │  Supabase Client     │      │  Backend API (Fastify)       │  │
│  │  (Direct, no proxy)  │      │  (via fetch / axios)         │  │
│  │                      │      │                              │  │
│  │  Auth (signup/login) │      │  POST /guest/generate        │  │
│  │  Profile CRUD        │      │  POST /videos/generate       │  │
│  │  Videos list/read    │      │  POST /stripe/checkout       │  │
│  │  Notifications       │      │  POST /stripe/portal         │  │
│  │  Blog posts (public) │      │  POST /coupons/redeem        │  │
│  │  Templates list      │      │  Admin endpoints             │  │
│  │  Credit transactions │      │                              │  │
│  │  Support tickets     │      │                              │  │
│  │  Realtime (video     │      │                              │  │
│  │    status updates)   │      │                              │  │
│  └──────────────────────┘      └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

### What the frontend calls directly via Supabase

| Feature | Method | Notes |
|---------|--------|-------|
| Signup, Login, OAuth, Password reset | `supabase.auth.*` | RLS protects all data |
| Read / update own profile | `supabase.from('profiles')` | RLS: own row only |
| List / read own videos | `supabase.from('videos')` | RLS: own videos only |
| Read notifications, mark as read | `supabase.from('notifications')` | RLS: own only |
| Update language / settings | `supabase.from('profiles').update()` | Stored in profile |
| Cookie consent (GDPR) | `supabase.from('cookie_consents')` | Insert-only |
| Policy acceptance | `supabase.from('policy_acceptances')` | Insert-only |
| Blog posts (public) | `supabase.from('blog_posts')` | RLS: published only |
| Templates list | `supabase.from('templates')` | Public read |
| Credit transaction history | `supabase.from('credit_transactions')` | RLS: own only |
| Subscription info | `supabase.from('subscriptions')` | RLS: own only |
| Support tickets + messages | `supabase.from('support_tickets')` | RLS: own only |
| Realtime video status | `supabase.channel().on()` | Instant status updates |

### What the frontend calls via the backend API

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/guest/session` | POST | None | Create anonymous session |
| `/guest/generate` | POST | None | Generate preview video (IP rate limited) |
| `/videos/generate` | POST | JWT | Start video generation pipeline |
| `/videos/:id/retry` | POST | JWT | Retry failed video |
| `/stripe/checkout` | POST | JWT | Create Stripe Checkout session |
| `/stripe/portal` | POST | JWT | Open Stripe Customer Portal |
| `/coupons/redeem` | POST | JWT | Validate and redeem coupon |
| `/admin/*` | Various | JWT + Staff | Admin dashboard endpoints |

---

## Design System (from StoryTub_Design_System.md)

All CSS custom properties are defined in `src/styles/design-tokens.css` and mapped to Tailwind in `tailwind.config.js`.

### Color Tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-brand-blue` | `#2B35FF` | `#2B35FF` | Primary CTA, active states, focus borders |
| `--color-brand-blue-mid` | `#3D47FF` | `#3D47FF` | Hover on brand elements |
| `--color-brand-blue-dark` | `#1E27CC` | `#1E27CC` | Pressed/active CTA |
| `--color-bg-page` | `#f4f4f4` | `#000000` | Page background |
| `--color-bg-card` | `#FFFFFF` | `#0D0D0D` | Card/surface background |
| `--color-text-primary` | `#0A0A0A` | `#FFFFFF` | Body, headings |
| `--color-text-secondary` | `#888888` | `#888888` | Subtitles, muted labels |
| `--color-text-tertiary` | `#AAAAAA` | `#AAAAAA` | Counters, helper text |
| `--color-border-default` | `#E8E8E8` | `rgba(255,255,255,0.1)` | Card/input borders |

### Typography

- **Font:** `Inter, -apple-system, BlinkMacSystemFont, sans-serif`
- **Weights:** 400 (regular) and 700 (bold) only. Never 500 or 600.
- **Heading H1:** 24px / 700. Brand blue only on greeting name + tagline.
- **Body:** 12px / 400 / secondary color
- **Input placeholder:** 13px / 400 / tertiary

### Spacing Scale

`4px` / `8px` / `12px` / `16px` / `24px` / `32px` / `48px` / `64px`

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Small badges |
| `sm` | 6px | Small buttons, scope badges |
| `md` | 8px | Send button, nav icons |
| `lg` | 10-12px | Cards, input field |
| `xl` | 16-20px | Outer container |
| `full` | 50% | Avatar |

### Interaction States

| State | Behavior |
|-------|----------|
| Default | White bg, 0.5px border `#E8E8E8`, no shadow |
| Hover (cards) | Background to `#F5F5F5`, 150ms ease |
| Active/pressed | `scale(0.98)`, CTA darkens to `#1E27CC` |
| Focus (inputs) | Border to `1px solid #2B35FF`, no glow |
| Disabled | Opacity 0.4, no pointer events |

### Shadows

All cards, buttons, and elevated surfaces must have box-shadow in both light and dark mode.

### Icons

Lucide React icons. 18-20px rendered size. 1.5px stroke. Round line caps. Outline only, never filled.

---

## Folder Structure

```
client/
├── index.html                          # Entry HTML with meta tags, structured data
├── package.json
├── vite.config.js                      # Vite + React + pre-render config
├── tailwind.config.js                  # Design system tokens mapped to Tailwind
├── postcss.config.js
│
├── public/
│   ├── robots.txt                      # Crawl rules (block /dashboard, /admin, /api)
│   ├── sitemap.xml                     # Public page URLs for Google
│   ├── favicon.ico                     # Browser tab icon
│   ├── og-image.png                    # Default Open Graph preview (1200x630)
│   └── locales/
│       ├── en.json                     # English translations
│       └── fr.json                     # French translations
│
└── src/
    ├── main.jsx                        # App entry, providers (Router, i18n, Helmet)
    ├── App.jsx                         # Route definitions, layout wrapper
    │
    ├── config/
    │   ├── supabase.js                 # Supabase client init (anon key only)
    │   ├── api.js                      # Backend API client (base URL, auth headers)
    │   └── constants.js                # Credit formula, plan limits, feature flags
    │
    ├── stores/
    │   ├── authStore.js                # Zustand: user session, profile, loading
    │   ├── themeStore.js               # Zustand: dark/light mode, persisted
    │   ├── creditStore.js              # Zustand: balance, transactions
    │   └── notificationStore.js        # Zustand: unread count, list
    │
    ├── hooks/
    │   ├── useAuth.js                  # Auth state + actions (login, signup, logout)
    │   ├── useProfile.js               # Profile CRUD via Supabase
    │   ├── useVideos.js                # Video list, status, realtime subscription
    │   ├── useCredits.js               # Balance, transaction history
    │   ├── useNotifications.js         # Read, mark read, realtime
    │   ├── useTheme.js                 # Toggle dark/light, persist preference
    │   ├── useI18n.js                  # Language switch, persist in profile
    │   └── useSupabase.js              # Shared Supabase query helpers
    │
    ├── services/
    │   ├── auth.service.js             # Supabase auth wrappers
    │   ├── video.service.js            # Backend API: generate, retry
    │   ├── guest.service.js            # Backend API: guest session, preview
    │   ├── stripe.service.js           # Backend API: checkout, portal
    │   ├── coupon.service.js           # Backend API: redeem coupon
    │   ├── blog.service.js             # Supabase: blog post queries
    │   ├── support.service.js          # Supabase: tickets + messages
    │   └── admin.service.js            # Backend API: admin endpoints
    │
    ├── styles/
    │   ├── design-tokens.css           # CSS custom properties (all design system tokens)
    │   ├── globals.css                 # Tailwind directives + base resets
    │   └── fonts.css                   # Inter font-face declarations
    │
    ├── components/
    │   ├── ui/                         # Reusable design system components
    │   │   ├── Button.jsx              # Primary, secondary, ghost, icon variants
    │   │   ├── Card.jsx                # Surface with border, shadow, radius
    │   │   ├── Input.jsx               # Text input with focus ring
    │   │   ├── Textarea.jsx            # Multi-line input (prompt field)
    │   │   ├── Badge.jsx               # Pill labels (plan, status)
    │   │   ├── Avatar.jsx              # Circle avatar with fallback
    │   │   ├── Modal.jsx               # Dialog overlay
    │   │   ├── Toast.jsx               # Notification toasts
    │   │   ├── Spinner.jsx             # Loading indicator
    │   │   ├── Skeleton.jsx            # Content placeholder shimmer
    │   │   ├── ProgressBar.jsx         # Credit usage, video progress
    │   │   └── Select.jsx              # Dropdown (language, template, voice)
    │   │
    │   ├── layout/
    │   │   ├── AppShell.jsx            # Sidebar + main content wrapper
    │   │   ├── Sidebar.jsx             # 48px icon-only nav (Lucide icons)
    │   │   ├── PublicLayout.jsx        # Layout for marketing pages (header + footer)
    │   │   ├── Header.jsx              # Public pages navbar
    │   │   ├── Footer.jsx              # Links, legal, language switcher
    │   │   └── SEOHead.jsx             # Helmet wrapper for per-page meta
    │   │
    │   ├── auth/
    │   │   ├── LoginForm.jsx
    │   │   ├── SignupForm.jsx
    │   │   ├── ForgotPasswordForm.jsx
    │   │   ├── ResetPasswordForm.jsx
    │   │   ├── OAuthButtons.jsx        # Google / GitHub OAuth
    │   │   ├── ProtectedRoute.jsx      # Redirect to login if unauthenticated
    │   │   └── StaffRoute.jsx          # Redirect if not staff role
    │   │
    │   ├── video/
    │   │   ├── VideoGenerator.jsx      # Main generation form (topic, template, voice, duration)
    │   │   ├── VideoCard.jsx           # Video thumbnail + status + actions
    │   │   ├── VideoList.jsx           # Grid of user's videos
    │   │   ├── VideoPlayer.jsx         # Remotion Player for preview
    │   │   ├── VideoStatus.jsx         # Realtime progress indicator
    │   │   └── TemplateSelector.jsx    # Template picker with thumbnails
    │   │
    │   ├── billing/
    │   │   ├── PlanCard.jsx            # Subscription plan display
    │   │   ├── BundleCard.jsx          # Credit bundle purchase card
    │   │   ├── CreditDisplay.jsx       # Balance bar in sidebar/header
    │   │   ├── CouponInput.jsx         # Coupon redemption form
    │   │   └── TransactionHistory.jsx  # Credit ledger table
    │   │
    │   ├── blog/
    │   │   ├── BlogCard.jsx            # Post preview card
    │   │   ├── BlogList.jsx            # Post grid with pagination
    │   │   ├── BlogPost.jsx            # Full post with structured data
    │   │   └── BlogSidebar.jsx         # Categories, tags, series nav
    │   │
    │   ├── support/
    │   │   ├── TicketForm.jsx          # New ticket creation
    │   │   ├── TicketList.jsx          # User's tickets
    │   │   └── TicketThread.jsx        # Messages within a ticket
    │   │
    │   ├── admin/
    │   │   ├── AdminSidebar.jsx        # Admin navigation
    │   │   ├── UserManager.jsx         # User list + search + actions
    │   │   ├── VideoManager.jsx        # All videos overview
    │   │   ├── BlogEditor.jsx          # Blog post create/edit (bilingual)
    │   │   ├── CouponManager.jsx       # Coupon CRUD
    │   │   ├── StaffManager.jsx        # Staff accounts
    │   │   ├── AnalyticsDashboard.jsx  # Charts + KPIs
    │   │   ├── BillingOverview.jsx     # Revenue, payments
    │   │   ├── EmailCampaigns.jsx      # Campaign management
    │   │   └── AuditLog.jsx            # Action log viewer
    │   │
    │   └── shared/
    │       ├── CookieBanner.jsx        # GDPR consent banner
    │       ├── PolicyModal.jsx         # Terms / Privacy acceptance
    │       ├── LanguageSwitcher.jsx    # FR / EN toggle
    │       ├── ThemeToggle.jsx         # Dark / Light mode
    │       ├── Logo.jsx               # SVG logo mark + wordmark
    │       ├── GreetingBlock.jsx       # "Hi there, [Name]" with brand colors
    │       ├── PromptCards.jsx         # Suggestion cards grid (4 columns)
    │       ├── PromptInput.jsx         # Main input field with actions
    │       └── NotificationBell.jsx    # Unread count badge
    │
    └── pages/
        ├── public/
        │   ├── HomePage.jsx            # Hero, features, guest CTA, social proof
        │   ├── FeaturesPage.jsx        # Feature breakdown by plan
        │   ├── PricingPage.jsx         # Plans + bundles + FAQ structured data
        │   ├── AboutPage.jsx           # Team, mission, E-E-A-T signals
        │   ├── BlogIndexPage.jsx       # Blog listing with categories
        │   ├── BlogPostPage.jsx        # Individual blog post
        │   ├── ContactPage.jsx         # Support / contact form
        │   ├── LoginPage.jsx           # Login form
        │   ├── SignupPage.jsx          # Signup form
        │   ├── ForgotPasswordPage.jsx
        │   ├── ResetPasswordPage.jsx
        │   ├── TermsPage.jsx           # Terms of Service
        │   ├── PrivacyPage.jsx         # Privacy Policy
        │   └── NotFoundPage.jsx        # 404 page
        │
        ├── app/
        │   ├── DashboardPage.jsx       # Greeting, prompt cards, input, video list
        │   ├── GeneratePage.jsx        # Full video generation form
        │   ├── VideosPage.jsx          # All user videos
        │   ├── VideoDetailPage.jsx     # Single video: player, download, share
        │   ├── ProfilePage.jsx         # Edit profile, avatar, language
        │   ├── SettingsPage.jsx        # Account settings, delete account
        │   ├── BillingPage.jsx         # Current plan, upgrade, bundles, history
        │   ├── VoicesPage.jsx          # Voice library, clone upload (Premium)
        │   ├── NotificationsPage.jsx   # All notifications
        │   └── SupportPage.jsx         # Tickets list + create
        │
        └── admin/
            ├── AdminDashboardPage.jsx  # KPIs, charts, recent activity
            ├── AdminUsersPage.jsx      # User management
            ├── AdminVideosPage.jsx     # Video oversight
            ├── AdminBlogPage.jsx       # Blog post management
            ├── AdminCouponsPage.jsx    # Coupon CRUD
            ├── AdminStaffPage.jsx      # Staff account management
            ├── AdminBillingPage.jsx    # Revenue, payments
            ├── AdminEmailPage.jsx      # Email templates + campaigns
            ├── AdminAnalyticsPage.jsx  # Full analytics
            └── AdminMonitoringPage.jsx # System health, audit logs
```

---

## Route Map

### Public Routes (SEO indexed, pre-rendered)

| Path | Page | Title Pattern |
|------|------|---------------|
| `/` | HomePage | StoryTub - AI Video Generator |
| `/features` | FeaturesPage | Features - StoryTub |
| `/pricing` | PricingPage | Pricing - StoryTub |
| `/about` | AboutPage | About - StoryTub |
| `/blog` | BlogIndexPage | Blog - StoryTub |
| `/blog/:slug` | BlogPostPage | {Post Title} - StoryTub Blog |
| `/contact` | ContactPage | Contact - StoryTub |
| `/login` | LoginPage | Login - StoryTub |
| `/signup` | SignupPage | Sign Up - StoryTub |
| `/forgot-password` | ForgotPasswordPage | Reset Password - StoryTub |
| `/reset-password` | ResetPasswordPage | New Password - StoryTub |
| `/terms` | TermsPage | Terms of Service - StoryTub |
| `/privacy` | PrivacyPage | Privacy Policy - StoryTub |

### App Routes (authenticated, noindex)

| Path | Page | Guard |
|------|------|-------|
| `/dashboard` | DashboardPage | ProtectedRoute |
| `/generate` | GeneratePage | ProtectedRoute |
| `/videos` | VideosPage | ProtectedRoute |
| `/videos/:id` | VideoDetailPage | ProtectedRoute |
| `/profile` | ProfilePage | ProtectedRoute |
| `/settings` | SettingsPage | ProtectedRoute |
| `/billing` | BillingPage | ProtectedRoute |
| `/voices` | VoicesPage | ProtectedRoute |
| `/notifications` | NotificationsPage | ProtectedRoute |
| `/support` | SupportPage | ProtectedRoute |

### Admin Routes (staff only, noindex)

| Path | Page | Guard |
|------|------|-------|
| `/admin` | AdminDashboardPage | StaffRoute |
| `/admin/users` | AdminUsersPage | StaffRoute |
| `/admin/videos` | AdminVideosPage | StaffRoute |
| `/admin/blog` | AdminBlogPage | StaffRoute(manager) |
| `/admin/coupons` | AdminCouponsPage | StaffRoute(manager) |
| `/admin/staff` | AdminStaffPage | StaffRoute(admin) |
| `/admin/billing` | AdminBillingPage | StaffRoute(admin) |
| `/admin/emails` | AdminEmailPage | StaffRoute(manager) |
| `/admin/analytics` | AdminAnalyticsPage | StaffRoute |
| `/admin/monitoring` | AdminMonitoringPage | StaffRoute(admin) |

---

## SEO Strategy

### Pre-rendering

Public pages are pre-rendered at build time using `vite-plugin-prerender` to generate static HTML. Google sees fully rendered content immediately without waiting for JavaScript.

### Per-page Meta Tags (via react-helmet-async)

Every public page sets: `<title>`, `<meta name="description">`, `<meta name="robots">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), Twitter Card tags, and `<link rel="canonical">`.

### Structured Data (JSON-LD)

| Page | Schema Type |
|------|-------------|
| All pages | `Organization` |
| Home | `WebApplication` |
| Pricing | `FAQPage` |
| Blog post | `Article` + `BreadcrumbList` |
| Blog index | `CollectionPage` |

### robots.txt

```
User-agent: *
Disallow: /dashboard/
Disallow: /generate/
Disallow: /videos/
Disallow: /profile/
Disallow: /settings/
Disallow: /billing/
Disallow: /voices/
Disallow: /notifications/
Disallow: /support/
Disallow: /admin/
Disallow: /api/
Allow: /
Sitemap: https://storytub.com/sitemap.xml
```

### Authenticated Pages

All app and admin pages include `<meta name="robots" content="noindex, nofollow" />` via their layout wrapper. This saves crawl budget and prevents indexing of private content.

---

## Responsive Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

**Key responsive behaviors:**
- Sidebar collapses to bottom tab bar on mobile (`< md`)
- Prompt suggestion cards: 4 columns on desktop, 2 on tablet, 1 on mobile
- Blog grid: 3 columns on desktop, 2 on tablet, 1 on mobile
- Pricing cards stack vertically on mobile
- Video grid: 3 columns on desktop, 2 on tablet, 1 on mobile

---

## Security

| Concern | Implementation |
|---------|---------------|
| XSS | React auto-escapes JSX. Never use `dangerouslySetInnerHTML` except for sanitized blog content (via DOMPurify) |
| Auth tokens | Supabase stores JWT in `localStorage` (managed by `@supabase/supabase-js`). Never log or expose tokens |
| API calls | Backend requests include `Authorization: Bearer <jwt>` header. Supabase anon key is public (safe by design, RLS enforces access) |
| CSRF | Not applicable for JWT-based API. Stripe webhooks are signature-verified server-side |
| Input validation | Client-side validation for UX. Server always re-validates (never trust client) |
| Content Security Policy | Set via `<meta>` tag in `index.html` |
| HTTPS only | Enforced by Cloudflare |
| Sensitive data | No API keys, service_role keys, or secrets in frontend code. Only `SUPABASE_URL` and `SUPABASE_ANON_KEY` in env |

---

## Environment Variables

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=https://api.storytub.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_APP_URL=https://storytub.com
```

Only `VITE_` prefixed variables are exposed to the browser (Vite convention).

---

## Database Tables Used by Frontend

### Direct Supabase Queries (RLS-protected)

| Table | Operations | RLS Rule |
|-------|-----------|----------|
| `profiles` | SELECT, UPDATE | Own row only |
| `videos` | SELECT | Own videos only |
| `notifications` | SELECT, UPDATE | Own only |
| `templates` | SELECT | Public read |
| `credit_transactions` | SELECT | Own only |
| `subscriptions` | SELECT | Own only |
| `blog_posts` | SELECT | Published only |
| `blog_categories` | SELECT | Active only |
| `blog_tags` | SELECT | All |
| `blog_authors` | SELECT | Active only |
| `blog_series` | SELECT | Active only |
| `cookie_consents` | INSERT | Insert-only |
| `policy_acceptances` | INSERT | Insert-only |
| `support_tickets` | SELECT, INSERT | Own only |
| `support_messages` | SELECT, INSERT | Own ticket only |
| `subscription_plans` | SELECT | Public read |
| `credit_bundles` | SELECT | Public read |
| `user_voices` | SELECT | Own only |

### Realtime Subscriptions

| Channel | Table | Filter | Purpose |
|---------|-------|--------|---------|
| `video-status` | `videos` | `user_id=eq.{userId}` | Live progress: pending > generating > rendering > completed |
| `notifications` | `notifications` | `user_id=eq.{userId}` | Instant notification delivery |

---

## Key UI Patterns

### Logo Mark (SVG)

Three stacked rounded shapes in brand blue (`#1b17ff`), centered vertically:
1. **Top:** Circle, ~24px diameter
2. **Middle:** Pill/stadium, ~64px wide x 20px tall
3. **Bottom:** Pill/stadium, ~88px wide x 20px tall

Gap between shapes: 6px. Gap between mark and wordmark: 20-24px.

### Greeting Block (Dashboard)

```
[Hi there,] [John]          ← 24px/700, name in #2B35FF
[What would you like to create?]  ← 24px/700, full brand blue
[subtitle text]             ← 12px/400, #888888
```

Bottom margin before prompt cards: 64px.

### Prompt Suggestion Cards

4-column grid, 12px gap. White background, 0.5px border `#E8E8E8`, 10px radius, 12px padding. Hover: background `#F5F5F5`. Title: 12px/400. Category icon: 18px, `#AAAAAA`.

### Main Input Field

White background, 0.5px border, 10px radius, ~80px min-height. Focus: 1px solid `#2B35FF`. Send button: 30x30px, `#2B35FF` background, white arrow, 8px radius. Hover: `#3D47FF`. Active: `#1E27CC` + `scale(0.98)`.

### Sidebar Navigation

48px fixed width. Icon-only (no labels). Icons: 18px, 1.5px stroke, `#AAAAAA`. Active: slot background `#0A0A0A`, icon white. 16px gap. Settings + avatar pinned to bottom.

---

## Text Rules

- Never use em dashes (the long dash). Use short sentences or commas instead.
- Product name is always "StoryTub" (mixed case, never all-caps).
- Wordmark: rounded sans-serif, weight 300-400.

---

## 10-Step Implementation Plan

### Step 1: Project Foundation and Design System

Install dependencies (Tailwind CSS, React Router, Zustand, react-i18next, @supabase/supabase-js, react-helmet-async, lucide-react). Configure Tailwind with all design system tokens (colors, spacing, radius, typography). Create `design-tokens.css` with CSS custom properties. Set up Inter font. Create `globals.css` with Tailwind directives and base resets. Configure Vite aliases. Set up ESLint rules. Create the `.env` file with Supabase and API environment variables. Build all base UI components (`Button`, `Card`, `Input`, `Textarea`, `Badge`, `Avatar`, `Modal`, `Toast`, `Spinner`, `Skeleton`, `ProgressBar`, `Select`) following the design system specs exactly. Build the `Logo` SVG component.

### Step 2: Routing, Layouts, and SEO Infrastructure

Set up React Router with all routes (public, app, admin). Create `PublicLayout` (Header, Footer), `AppShell` (Sidebar + content), and Admin layout. Build `ProtectedRoute` and `StaffRoute` guards. Create the `SEOHead` component (react-helmet-async) with defaults. Add `robots.txt` and `sitemap.xml` to `public/`. Add structured data (Organization JSON-LD) to `index.html`. Configure `vite-plugin-prerender` for public routes. Add `<noscript>` fallback. Set up `<meta name="robots" content="noindex, nofollow">` on all authenticated layouts.

### Step 3: Auth System and Supabase Config

Initialize Supabase client (`config/supabase.js`). Create the `authStore` (Zustand) for session state. Build `useAuth` hook (login, signup, logout, OAuth, password reset, session listener). Build `LoginForm`, `SignupForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `OAuthButtons`. Create `LoginPage`, `SignupPage`, `ForgotPasswordPage`, `ResetPasswordPage`. Wire up `ProtectedRoute` to redirect unauthenticated users. Handle auth callback URL for OAuth and email confirmation.

### Step 4: Internationalization and Theme System

Set up react-i18next with `en.json` and `fr.json` locale files in `public/locales/`. Translate all static UI strings. Create `useI18n` hook to toggle language and persist in profile. Build `LanguageSwitcher` component. Create `themeStore` (Zustand) persisted in `localStorage`. Build `useTheme` hook and `ThemeToggle` component. Apply dark mode classes via `document.documentElement` class toggle. Ensure all components respect both light and dark mode tokens.

### Step 5: Dashboard, Prompt System, and Guest Flow

Build the `DashboardPage` with `GreetingBlock`, `PromptCards` (4-column grid), and `PromptInput` (main input field with all action buttons). Create `config/api.js` (backend API client with auth header injection). Build `guest.service.js` for anonymous session creation and preview generation. Build the guest video preview flow (landing page CTA triggers `/guest/session` then `/guest/generate`). Wire up real-time video status via Supabase Realtime channel. Build `VideoStatus` component with progress states.

### Step 6: Video Generation and Library

Build `GeneratePage` with the full form: topic input, template selector, voice picker, language, duration slider, credit cost preview. Build `TemplateSelector` with thumbnail grid (fetched from Supabase `templates` table). Build `video.service.js` (calls `POST /videos/generate`). Build `VideosPage` with `VideoList` (grid of `VideoCard` components). Build `VideoDetailPage` with `VideoPlayer` (Remotion Player embed), download button, share link, metadata display. Implement realtime status updates on video cards. Build `VoicesPage` for voice library browsing and clone upload (Premium only).

### Step 7: Billing, Credits, and Stripe Integration

Build `creditStore` (Zustand) and `useCredits` hook. Build `CreditDisplay` component for sidebar. Build `PricingPage` with `PlanCard` components, bundle cards, FAQ section with `FAQPage` structured data. Build `BillingPage` with current plan info, upgrade/downgrade buttons, `TransactionHistory`, and `CouponInput`. Create `stripe.service.js` (calls `/stripe/checkout` and `/stripe/portal`). Create `coupon.service.js` (calls `/coupons/redeem`). Handle Stripe redirect callbacks (success/cancel URLs).

### Step 8: Blog, Support, and Public Pages

Build `HomePage` (hero section, feature highlights, social proof, guest CTA, testimonial placeholders). Build `FeaturesPage`, `AboutPage`, `ContactPage`, `TermsPage`, `PrivacyPage`. Build blog components: `BlogIndexPage` (grid + sidebar with categories/tags), `BlogPostPage` (full content + Article structured data + related posts). Build `blog.service.js` (Supabase queries for published posts). Build `SupportPage` with `TicketForm`, `TicketList`, `TicketThread`. Build `CookieBanner` (GDPR) and `PolicyModal` (terms acceptance on signup). Add `NotificationBell` and `NotificationsPage`.

### Step 9: Admin Dashboard

Build admin layout with `AdminSidebar` navigation. Build `AdminDashboardPage` (KPI cards, recent activity, quick stats). Build `UserManager` (search, filter, ban, credit adjustments). Build `VideoManager` (all videos, status filter, retry failed). Build `BlogEditor` (create/edit with bilingual fields, category/tag assignment, SEO fields, preview). Build `CouponManager` (CRUD with validation rules). Build `StaffManager` (create agent/manager, permissions). Build `AnalyticsDashboard`, `BillingOverview`, `EmailCampaigns`, `AuditLog`. Wire all admin pages to backend API via `admin.service.js`.

### Step 10: Polish, Testing, and Performance

Audit all pages for responsive layout at every breakpoint (mobile, tablet, desktop). Verify all hover/focus/active/disabled states match the design system. Verify dark mode on every page. Run Lighthouse audit: target 90+ on Performance, Accessibility, SEO, Best Practices. Validate structured data with Google Rich Results Test. Verify `robots.txt` and `sitemap.xml` are correct. Test all auth flows (signup, login, OAuth, password reset, session expiry). Test Stripe checkout and portal flows end-to-end. Test guest flow rate limiting. Test realtime video status updates. Add error boundaries and fallback UI for failed API calls. Optimize bundle size (lazy load admin and billing pages). Add loading skeletons to all data-fetching pages.

---

## Running

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```
