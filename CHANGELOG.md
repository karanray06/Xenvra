# Changelog

All notable changes to the Xenvra project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Auth redirect safety**: `src/lib/auth-redirect.ts` with strict single-slash path validation; URI encoding on login redirect params.
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
