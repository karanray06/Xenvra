# Xenvra Launch Checklist & Runbook

Welcome to the production launch documentation for **Xenvra** (Next.js 16 App Router, React 19, Supabase, Tailwind CSS, Razorpay).

---

## 1. Environment Variables (.env.production / Vercel Project Settings)

Ensure the following environment variables are set in your Vercel deployment:

| Variable | Description | Sensitivity |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL (`https://<project-ref>.supabase.co`) | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin / Service Role Key (used for account deletion, webhooks, crons) | **Secret (Server Only)** |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_test_...` or `rzp_live_...`) | Public |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key for HMAC signature verification | **Secret (Server Only)** |
| `RAZORPAY_WEBHOOK_SECRET` | Secret configured in Razorpay Webhooks dashboard | **Secret (Server Only)** |
| `CRON_SECRET` | Bearer token securing `/api/cron/expire` | **Secret (Server Only)** |
| `NEXT_PUBLIC_APP_URL` | Public application URL (default: dynamic `getAppBaseUrl()` fallback) | Public |
| `OPENAI_API_KEY` | Optional: OpenAI API Key for enhanced AI rewriting (heuristic fallback active) | **Secret (Server Only)** |

---

## 2. Supabase SQL Migrations (Execute in order)

In your Supabase project dashboard -> **SQL Editor**, execute the migration scripts in numerical sequence:

1. `supabase/migrations/001_initial_schema.sql`
   - Sets up initial tables (`profiles`, `resumes`, `resume_versions`, `plans`, `entitlements`, `payments`, `usage_events`, `job_applications`, `public_profiles`, `profile_views`).
   - Enables RLS on all tables.
2. `supabase/migrations/002_launch_fixes.sql`
   - Hardens `auth.users` trigger (`handle_new_user`) for automatic profile & entitlement provisioning.
   - Adds `WITH CHECK (auth.uid() = user_id)` to RLS policies.
   - Enforces plan limits via `check_resume_limit()` BEFORE INSERT trigger.
   - Adds `version` (optimistic locking) and `design_json` (Penpot vector state) columns.
   - Adds `resumes` and `entitlements` to `supabase_realtime` publication.
3. `supabase/migrations/003_complete_features.sql`
   - Creates `cover_letters` table with user RLS.
   - Adds anonymous insert policy for `profile_views`.
   - Adds real-time publication for `job_applications` and `cover_letters`.

---

## 3. Razorpay Dashboard Setup

1. **API Keys**:
   - Go to **Razorpay Dashboard** -> **Settings** -> **API Keys**.
   - Generate Test Keys for initial staging verification, then Live Keys for production.
2. **Webhooks Setup**:
   - Go to **Settings** -> **Webhooks** -> **Add New Webhook**.
   - URL: `https://<your-domain>/api/billing/webhook`
   - Secret: Set a secure secret and copy it into `RAZORPAY_WEBHOOK_SECRET`.
   - Active Events:
     - `payment.captured`
     - `order.paid`
     - `refund.processed`

---

## 4. Google OAuth Setup (Supabase Auth)

1. In **Google Cloud Console**, create an OAuth 2.0 Client ID.
2. Set Authorized Redirect URI: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`.
3. In **Supabase Dashboard** -> **Authentication** -> **Providers** -> **Google**:
   - Enable Google provider.
   - Enter Client ID and Client Secret.

---

## 5. Vercel Deployment & Cron Jobs

1. Connect the GitHub repository `https://github.com/karanray06/Xenvra`.
2. Deploy branch `launch/v1` or merge into `main`.
3. Vercel automatically reads `vercel.json` and schedules:
   - `GET /api/cron/expire` once daily at `00:00 UTC` with `CRON_SECRET` authorization.

---

## 6. Feature Verification Smoke Test Matrix

| Feature | Route / Endpoint | Verification Method |
| :--- | :--- | :--- |
| **Auth & Redirects** | `/login`, `/auth/callback` | Log in via Google or email; verify redirect is safe |
| **Resume Builder** | `/dashboard/builder` | Edit fields, verify autosave badge, retry on offline |
| **Penpot Vector Studio** | `/dashboard/builder` -> *Vector Studio* | Drag shapes, add text, reorder layers, export SVG/PNG |
| **ATS Scoring** | `/dashboard/builder` -> *ATS Score* | Real-time score calculation, keyword match against JD |
| **AI Writing Assist** | `/dashboard/builder` -> *AI Assist* | Strengthen bullets, conciseness, grammar polish |
| **Pro DOCX Export** | `/api/resumes/[id]/docx` | Download formatted Word `.docx` document |
| **PDF Print & Watermark** | `/print/[id]` | Free tier has diagonal watermark; paid tiers watermark-free |
| **Job Tailoring** | `/dashboard/tailor` | Paste JD, view ATS boost, save as new tailored resume |
| **Cover Letter Generator**| `/dashboard/cover-letters` | Generate customized cover letter, print / copy |
| **Version History** | `/dashboard/builder` -> *History* | Snapshot timeline, 1-click historical restore |
| **Job Application Tracker**| `/dashboard/applications` | Kanban board across 5 stages, status advance |
| **Public Portfolio** | `/p/[slug]`, `/dashboard/settings` | Public link sharing with view counter analytics |
| **Billing & Payments** | `/dashboard/billing` | Razorpay Checkout modal, dynamic plan upgrade, receipts |

---

## 7. Rollback Plan

If an urgent production issue occurs:
1. **Instant Rollback**: In Vercel Deployment Dashboard, select the previous stable deployment and click **Promote to Production** (takes < 10 seconds).
2. **Database Rollback**:
   - Supabase maintains automated daily point-in-time recovery (PITR).
   - All migrations are backwards-compatible (additive columns with safe defaults).
