# Changelog

All notable changes to the Xenvra project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **ATS Scoring & Job Keyword Scanner (`/api/ats`)**:
  - Implemented deterministic, explainable ATS parser evaluation algorithm (`src/lib/ats.ts`) evaluating contact completeness, section structure, impact quantification, action verbs, and skills.
  - Added Job Description comparison engine analyzing keyword frequency and identifying missing high-relevance qualifications.
  - Built interactive ATS drawer (`src/components/builder/ats-drawer.tsx`) with circular gauge, category progress bars, and actionable tips.
- **AI Resume Writing Assistant (`/api/ai/improve`)**:
  - Built server route with plan quota validation (`checkAndRecordAiUsage`) and anti-hallucination prompts.
  - Implemented 4 enhancement modes: `strengthen` (action verbs + metric prompts), `shorten` (conciseness), `fix_grammar`, and `generate_summary`.
  - Built `AiAssistModal` component in builder with real-time preview and one-click insertion.
- **Pro DOCX Export (`/api/resumes/[id]/docx`)**:
  - Integrated `docx` npm library to generate clean, professionally formatted Microsoft Word resumes.
  - Built server-side entitlement check restricting DOCX export to paid subscribers.
  - Added "Export DOCX" action button in `BuilderToolbar`.
- **Payments & Billing System (Razorpay)**:
  - Installed `razorpay` SDK with typed client integration (`src/lib/payments/razorpay.ts`).
  - Implemented provider-agnostic interface (`src/lib/payments/provider.ts`) with a forward-compatible Hyperswitch stub (`src/lib/payments/hyperswitch.ts`).
  - Created checkout endpoint (`POST /api/billing/checkout`) reading plan configurations dynamically from database with server-side pricing.
  - Implemented payment verification endpoint (`POST /api/billing/verify`) validating cryptographic signatures before upgrading entitlements.
  - Built idempotent webhook handler (`POST /api/billing/webhook`) verifying HMAC signatures, recording events, handling payment captures and refunds, and extending subscription end dates.
  - Built automated daily subscription expiry cron endpoint (`GET /api/cron/expire`) with Bearer token authentication and `vercel.json` schedule.
  - Created `/dashboard/billing` page and interactive `BillingClient` with Razorpay Checkout modal, dynamic pricing cards, and transaction history.
  - Added server-side plan limit enforcement and AI usage quotas (`src/lib/plan-limits.ts`).
  - Updated refund policy with GST and tax-inclusive breakdown notes.
- **Real-Time Multi-Device Sync**: Subscribed builder to `postgres_changes` on `resumes` for instant live updates across tabs and devices.
- **Conflict Resolution**: Added non-blocking conflict bar allowing users to either reload remote updates or force keep local edits.
- **Presence Tracking**: Live Supabase presence channel (`resume:<id>`) showing a Pale Lavender indicator chip when open on another device.
- **Instant Plan Unlocking**: Shell real-time subscription on `entitlements` displaying a toast and unlocking paid templates/exports immediately upon payment webhook reception.
- **Brand Identity & Tokens**: Replaced orange theme with metallic palette in `globals.css` (Ice Silver `#E6EEF4`, Mocha Brown `#5A4032`, Platinum Silver `#C9CCD1`, Pale Lavender `#DCD3F2`).
- **Typography**: Integrated `Plus_Jakarta_Sans` via `next/font/google` (`--font-jakarta`).
- **Brand Assets & SVGs**: Updated high-res vector logos (`/logos/xenvra-icon.svg`, `/logos/xenvra-wordmark.svg`, `/logos/xenvra-full.svg`), added `src/app/icon.svg`, `src/app/apple-icon.png`, `public/icon-192.png`, `public/icon-512.png`, and `src/app/manifest.ts`.
- **Dynamic OG Image**: Built `/api/og` route producing 1200x630 social preview images with `next/og`.
- **Brand Showcase**: Added `/brand` page with downloadable assets, color tokens, and typography guidelines.
- **Database hardening migration (002)**: `supabase/migrations/002_launch_fixes.sql` with user creation trigger (`handle_new_user`), backfill, RLS `WITH CHECK (auth.uid() = user_id)`, resume plan limits trigger (`check_resume_limit`), versioning, and payload size checks.
- **Reliable autosave engine**: `src/components/builder/resume-provider.tsx` with serialized write queue, `saved | saving | offline | error` states, exponential retry backoff, keepalive beacon/fetch flush on navigation, and insertion promise locks.
- **Real PDF export**: A4 print media styling, server-side `/print/[id]` route, diagonal watermark on free tier with automatic paid tier suppression.
- **Templates**: Real implementations for `professional-1` (Executive) and `modern-2` (Gradient Edge) templates with server-side plan entitlement gating.
- **Account deletion**: `POST /api/account/delete` with typed `"DELETE"` confirmation, storage cleanup, and service-role deletion via `src/lib/supabase/admin.ts`; modal in `/dashboard/settings`.
- **Hardening & Security**: CSP and strict security headers in `next.config.ts`, Zod env validation in `src/lib/env.ts`, API sliding-window rate limiting in `src/lib/rate-limit.ts` and `src/proxy.ts`, `.maybeSingle()` query safety, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `robots.ts`, and `sitemap.ts`.
- **Honest Marketing & Contact**: Unified contact email to `xenvra.official@gmail.com`; labeled unreleased features as "Coming Soon".

### Changed
- Vercel-ready hosting setup with dynamic `getAppBaseUrl()` fallback.

## [0.1.0] - 2026-10-23
### Baseline
- Initial import of Xenvra Next.js 16 App Router codebase
- Supabase authentication & database setup
- Resume builder with template previews and client-side print
