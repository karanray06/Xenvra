# Xenvra Studio v2 — Production Launch Runbook

Production repository: `karanray06/Xenvra` · Production Domain: `https://xenvraresume.vercel.app`
Tech Stack: Next.js 16.4.3 (Turbopack, App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (RLS), Vercel.

---

## 1. Environment Variables Configuration

Set the following variables in **Vercel Dashboard → Settings → Environment Variables**:

| Variable | Description | Target | Sensitivity |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://<ref>.supabase.co`) | Production, Preview | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Production, Preview | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin Key for atomic RPCs, webhooks, crons | Production only | **Critical Secret** |
| `PAYMENT_PROVIDER` | Selected provider (`razorpay` primary, `youpi` experimental) | Production, Preview | Config |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_live_...` or `rzp_test_...`) | Production, Preview | Public |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key for HMAC signature verification | Production only | **Critical Secret** |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook secret configured in Razorpay dashboard | Production only | **Critical Secret** |
| `CRON_SECRET` | Bearer token securing `/api/cron/expire` | Production only | **Critical Secret** |
| `NEXT_PUBLIC_APP_URL` | Public application URL (`https://xenvraresume.vercel.app`) | Production, Preview | Public |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL for distributed rate limiting | Production only | **Secret** |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token | Production only | **Secret** |
| `OPENAI_API_KEY` | Optional: LLM provider key for AI writing features | Production only | **Secret** |

---

## 2. Supabase SQL Migrations (Sequential Order)

Execute the migrations in numerical order in **Supabase Dashboard → SQL Editor**:

1. `supabase/migrations/001_initial_schema.sql`
   - Base tables (`profiles`, `resumes`, `plans`, `entitlements`, `payments`, `job_applications`).
2. `supabase/migrations/002_launch_fixes.sql`
   - User provisioning trigger, `WITH CHECK (auth.uid() = user_id)`, optimistic concurrency.
3. `supabase/migrations/003_complete_features.sql`
   - `cover_letters` table, real-time publications.
4. `supabase/migrations/004_payments_hardening.sql`
   - **Crucial Security Phase A**: Single `fulfil_payment` SECURITY DEFINER RPC with row locking (`FOR UPDATE`).
   - Replaces client-triggered fulfilment with server-verified webhook only.
   - Idempotency constraints on `(provider, provider_order_id)` and `(provider, provider_payment_id)`.
   - Atomic `consume_ai_credit` function.
5. `supabase/migrations/005_studio.sql`
   - Flagship Studio engine tables: `designs` table with `< 2MB` document size constraint and realtime replication.
   - `assets` table with private storage bucket RLS quotas (Free 50MB, Pro 2GB).

---

## 3. Payment Gateway Configuration

### Primary Gateway: Razorpay
1. **API Keys**: In **Razorpay Dashboard → Settings → API Keys**, generate Live Keys upon KYC approval.
2. **Webhooks Setup**:
   - URL: `https://xenvraresume.vercel.app/api/billing/webhook/razorpay`
   - Secret: Set secure random string matching `RAZORPAY_WEBHOOK_SECRET`.
   - Subscribed Events:
     - `payment.captured`
     - `order.paid`
     - `payment.failed`
     - `refund.processed`
3. **Receipts**: Automatic printable receipts generated client-side from verified order records.

### Experimental Gateway: YouPI-PG (Off by Default)
- Enable only if `PAYMENT_PROVIDER=youpi` is explicitly set.
- Requires dedicated business VPA with unique timestamped amounts (e.g. ₹49.07).
- Replay protection enforces strict 5-minute clock skew limits and timing-safe HMAC checks.
- Any mismatched amount triggers `needs_review` status without granting automatic entitlement.

---

## 4. Feature Verification Smoke Test Matrix

| Feature | Surface / Route | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **Health Check** | `GET /api/health` | Returns 200 `{ status: "ok" }` with zero leaked secrets | Verified |
| **Studio Engine** | `/studio`, `/dashboard/studio` | Pan/zoom, 36+ templates, drag photo frames, recolour | Verified |
| **Live ATS Drawer** | `/studio` (Top Bar) | Real-time score meter, section detection, vector text check | Verified |
| **Bulk Certificates** | `/studio` (Top Bar) | CSV upload, multi-recipient generation into downloadable ZIP | Verified |
| **Career Kit Sync** | `/studio` (Top Bar) | 1-click data-binding sync from profile into canvas text | Verified |
| **Exporters** | `/studio` (Top Bar) | Vector ATS PDF, editable PPTX, SVG, and high-res PNG | Verified |
| **Present Mode** | `/studio` (Top Bar) | Full-screen keyboard slide presentation | Verified |
| **Public Gallery** | `/templates`, `/templates/[kind]` | Server-rendered SSG catalog with JSON-LD & filter pills | Verified |
| **Blog Guides** | `/blog`, `/blog/[slug]` | 5 launch articles, table of contents, reading time | Verified |
| **Jobs Search & Kanban** | `/dashboard/jobs` | Deterministic match scores, `@dnd-kit` drag, safe `/go/` apply | Verified |
| **Billing Live Tracking**| `/dashboard/settings#billing` | 4-state real-time subscription, 15:00 countdown, status sync | Verified |

---

## 5. Rollback Procedures

If an unexpected critical issue occurs in production:
1. **Instant Vercel Rollback**:
   - Navigate to **Vercel Dashboard → Deployments**.
   - Locate the previous stable deployment (pinned) and click **Promote to Production**.
   - DNS and edge routing immediately point to the previous bundle in < 10 seconds.
2. **Database Rollback**:
   - Migrations 004 & 005 are purely additive (new tables `designs`, `assets`, and renamed payment columns). Previous tables remain backward-compatible.
