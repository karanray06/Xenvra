# Xenvra — Launch Build Prompt (paste into Claude Code, in an empty working folder)

You are a senior full-stack engineer taking over the repo https://github.com/karanray06/Xenvra (Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Supabase auth+DB, deployed on Vercel at xenvra.kareixo.me). Goal: make it launch-ready, then add payments, plan enforcement, real-time sync, a new brand, and a first version of a design mode. Work in the phases below, in order. After each phase: run `npm run lint`, `npx tsc --noEmit`, `npm run build`, commit with a clear message, and report what changed. Do not claim a feature works unless you ran it. If something needs a secret or a dashboard click that you cannot do, stop and list it for me instead of faking it.

IMPORTANT first step: this Next.js version has breaking changes. Read `AGENTS.md` and the relevant docs in `node_modules/next/dist/docs/` before writing code (note: `src/proxy.ts` replaces middleware).

## Phase 0 — Clone, baseline, branch
```bash
git clone https://github.com/karanray06/Xenvra.git && cd Xenvra
git checkout -b launch/v1
npm ci
cp .env.example .env.local   # I will fill in values
npx next typegen
npm run lint && npx tsc --noEmit && npm run build
```
Record baseline results. Add `.nvmrc` (Node 22), `engines` in package.json, and a `CHANGELOG.md`.

## Phase 1 — Launch blockers (from audit; each has acceptance criteria)
1. **Auth redirect safety**: in `src/app/auth/callback/route.ts` accept `next` only if it starts with a single `/` and not `//` or `/\`; otherwise use `/dashboard`. `encodeURIComponent` the `redirect` param in `login/page.tsx`. Test: `next=@evil.com`, `//evil.com`, `https://evil.com` all land on `/dashboard`.
2. **Profile + entitlement trigger**: new migration `002_launch_fixes.sql`:
   - `handle_new_user()` SECURITY DEFINER trigger on `auth.users` AFTER INSERT → insert `profiles` (name/avatar from `raw_user_meta_data`) and a `free` `entitlements` row, `ON CONFLICT DO NOTHING`. Backfill existing users.
   - Drop policy "Service role can insert usage events". Replace `profile_views` open insert with server-route-only inserts.
   - Change `resumes.template_id` default to `'modern-1'`; fix existing `'modern'` rows. Add `version integer not null default 1` to `resumes`, plus a `CHECK (pg_column_size(data) < 500000)`.
   - `alter publication supabase_realtime add table public.resumes, public.entitlements;`
   - RLS: add `WITH CHECK (auth.uid() = user_id)` explicitly to the "FOR ALL" policies.
   - Plan enforcement in DB: a `BEFORE INSERT` trigger on `resumes` that raises if the user's active plan `max_resumes` is reached (use a helper `current_plan(uid)` that treats expired/cancelled/past `current_period_end` as `free`).
3. **Reliable autosave** (`resume-provider.tsx`): serialize saves through a single queue; check `{ error }` from every Supabase call; states `saved | saving | offline | error` shown in toolbar; retry with exponential backoff; prevent duplicate inserts (create the row first, keep a `creating` promise); flush on `visibilitychange`, `pagehide`, and unmount via `navigator.sendBeacon` or a keepalive `fetch` to `/api/resumes/[id]`; optimistic concurrency using `version`. Acceptance: with network throttled to offline, edits show "Offline – will sync", and sync on reconnect; navigating away right after typing never loses text; no duplicate rows created in a 20-keystroke rapid test.
4. **Real PDF export**: replace `handlePrint`. Preferred: `GET /api/resumes/[id]/pdf` using `playwright-core` + `@sparticuz/chromium` (Vercel-compatible) rendering a server route `/print/[id]` with `@page { size: A4; margin: 0 }`, fonts embedded, exact colours. Fallback if serverless limits bite: a same-page `@media print` stylesheet that hides everything except `#resume-preview`. Free plan → diagonal "Made with Xenvra" watermark; paid → none. Escape/sanitize title (current code injects `${title}` into HTML). Acceptance: exported PDF visually matches preview for all templates, 1–2 pages, text selectable.
5. **Template integrity**: implement real `professional-1` (Executive) and `modern-2` (Gradient Edge) templates in the new palette, or remove them from the registry until built. Make `/dashboard/templates` links work (`/dashboard/builder?template=ID` pre-selects for a new resume). Server-side check: using a non-free template requires an active paid plan (enforced in the PDF route and on save).
6. **Account deletion**: `POST /api/account/delete` (verify session, require typed confirmation) → delete storage objects, then `supabase.auth.admin.deleteUser(uid)` using `SUPABASE_SERVICE_ROLE_KEY` (server-only client in `src/lib/supabase/admin.ts` with `import 'server-only'`). Enable the button in Settings. Keeps Privacy Policy truthful.
7. **Honest marketing**: for any feature not shipped by the end of Phase 5, label "Coming soon" on landing/pricing/FAQ. Unify contact email to `xenvra.official@gmail.com` (landing footer, legal pages, README).
8. **Hardening**: security headers in `next.config.ts` (CSP with nonce or strict self + Supabase + Razorpay + Google, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, frame-ancestors none); env validation with Zod in `src/lib/env.ts` (fail fast); rate limiting on all `/api/*` (Upstash Redis or Vercel KV; fallback in-memory for dev); `.maybeSingle()` instead of `.single()` where rows may be missing; server-side Zod validation of resume payloads (reuse `resume.ts`); Sentry (or at minimum `error.tsx`/`global-error.tsx`) + `not-found.tsx`; `robots.ts`, `sitemap.ts`; self-host fonts.

## Phase 2 — Brand identity (assets are provided in `xenvra-brand/`)
Palette (only these four are brand colours): Ice Silver `#E6EEF4`, Mocha Brown `#5A4032`, Platinum Silver `#C9CCD1`, Pale Lavender `#DCD3F2`.
1. Replace the orange `@theme` block in `src/app/globals.css` with `xenvra-brand/brand-tokens.css` (keeps existing class names working: `bg-accent`, `brand-*`, `surface-*`, `text-*`).
2. Copy `logo/*.svg` and PNGs to `public/logos/` (replace old PNGs); `src/app/icon.svg` ← `xenvra-icon.svg`; `apple-icon.png` ← `icon-180.png`; `public/icon-192.png`, `icon-512.png`; add `manifest.ts`. Swap `<Image>` usages in landing, login, dashboard shell to the new SVGs.
3. Font: Plus Jakarta Sans via `next/font` (variable `--font-jakarta`).
4. Restyle landing, login, dashboard, builder toolbar, template cards to the guide in `BRAND_GUIDE.md` (mocha primary buttons, ice surfaces, platinum borders, lavender badges/selected states). Replace the three template accents with palette-derived accents. Fix all text contrast to WCAG AA (check with axe).
5. Generate an OG image with `next/og` (1200×630) and set `metadata.metadataBase`, `openGraph`, `twitter`.
6. Add a `/brand` page (unlinked from nav, `noindex`) showing logo, palette, type — handy for press/Razorpay review.

## Phase 3 — Real-time
1. Builder subscribes to `postgres_changes` on `resumes` filtered by `id=eq.<id>`; apply remote updates when `version` > local and the tab is not mid-edit; if both changed, show a non-blocking "Updated in another tab — Reload / Keep mine" bar.
2. Shell subscribes to `entitlements` for the user: when the payment webhook activates a plan, UI unlocks templates/exports instantly with a toast.
3. Presence channel `resume:<id>` showing "Also open in another device" (lavender chip).
4. Clean up channels on unmount; handle token refresh (`supabase.realtime.setAuth`). Acceptance: two browser windows on the same resume stay in sync within ~1 s; paying in test mode unlocks Pro without a manual refresh.

## Phase 4 — Payments (Razorpay first, Hyperswitch-ready)
Decision: ship with **Razorpay directly**. Hyperswitch is a self-hosted Rust payments orchestrator and I have not verified a Razorpay/UPI connector in its docs, so do NOT deploy it for tomorrow's launch. Instead define `src/lib/payments/provider.ts`:
```ts
export interface PaymentProvider {
  createOrder(input:{userId:string; plan:'beginner'|'pro'; amountInr:number}): Promise<{orderId:string; clientConfig:unknown}>;
  verifyAndFulfil(payload: unknown, signature: string): Promise<{userId:string; plan:string; paymentId:string}>;
  refund(paymentId:string): Promise<void>;
}
```
Implement `RazorpayProvider` now; leave `HyperswitchProvider` as a documented stub (README section "Switching to Hyperswitch": self-host via its docker setup, use `hyperswitch-web` React SDK for checkout, map its payment webhooks to `verifyAndFulfil`).
Steps:
1. `npm i razorpay`. Env: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
2. `POST /api/billing/checkout` (auth required): price comes from the `plans` table server-side — never from the client. Create Razorpay order, insert `payments` row `pending` (unique `razorpay_order_id`).
3. Checkout UI: Razorpay Checkout.js on `/dashboard/billing` (new page; add "billing" to nav) with plan cards, current plan, expiry, payment history.
4. `POST /api/billing/webhook`: verify `X-Razorpay-Signature` on the **raw body** (HMAC-SHA256) with timing-safe compare; handle `payment.captured`/`order.paid` idempotently (check payment id already `completed`); in one transaction mark payment completed and upsert `entitlements` (plan, status active, `current_period_end = now + plan.duration_days`; extend if already active). Also handle `payment.failed` and `refund.processed` (status refunded → downgrade to free). The client-side success handler only calls `/api/billing/verify` for instant UX; the webhook is the source of truth.
5. Expiry: a daily Vercel Cron `/api/cron/expire` (protected by `CRON_SECRET`) sets expired entitlements; `current_plan()` already ignores past-due periods.
6. Enforce: AI limits via `usage_events` counted per day/month by plan; pro-only exports (DOCX), no-watermark PDF, template access, resume count — all server-side.
7. Update Refund/Terms pages to match real behaviour (48-hour policy, GST/invoice note). Send receipt email.
Test mode only until I confirm Razorpay account activation. Acceptance: with test keys + `ngrok`/Vercel preview webhook URL, a test payment flips the plan, unlocks UI in real time, and replaying the webhook does not double-extend.

## Phase 5 — Minimum honest feature set promised on the landing page
Ship in this order; stop and mark remaining items "Coming soon":
1. **ATS score** (`/api/ats`): deterministic checks (sections present, keyword coverage vs pasted JD, length, bullet quality heuristics) — no LLM needed; returns score + actionable list. Free = basic, paid = full.
2. **AI writing assist** (`/api/ai/improve`): provider-agnostic wrapper (`LLM_PROVIDER`, `LLM_MODEL_FREE/PAID`), server-side only, streaming, input/output length caps, prompt that forbids inventing metrics (asks the user for real numbers), quota check + `usage_events` insert via service role, 429 on exceed.
3. **DOCX export** (Pro) with `docx` package.
4. Defer: JD tailoring, cover letters, job tracker, public profile pages, version history UI (tables exist already).

## Phase 6 — Design mode MVP (the "Penpot-style" goal, realistically scoped)
Do not copy Penpot code (MPL-2.0 file-level copyleft; it is a huge Clojure/ClojureScript product). Build a lightweight canvas editor with **Konva (MIT)** in `src/components/design/`:
- A4 artboard, drag/resize/rotate, snapping + guides, text boxes with font/size/weight/colour, rectangles/lines/circles, image upload (Supabase Storage, size/type limited), layers panel (reorder/lock/hide), undo/redo, zoom/pan, palette swatches from the brand colours.
- "Convert template → editable design" (map resume data into positioned text nodes), "Reset to template".
- Export SVG + PDF (reuse the Playwright PDF path or Konva `toDataURL` → PDF for MVP).
- Persist as `resumes.design_json` (new column) with the same autosave/realtime queue.
- Stretch (post-launch): Penpot SVG import, plugin API, shared components.
Feature-flag it (`NEXT_PUBLIC_FEATURE_DESIGN_MODE`), off in production until QA passes.

## Phase 7 — Launch checklist (produce `LAUNCH.md` with each item checked or listed as blocked)
- [ ] Supabase: run migrations 001+002; Auth → URL config (Site URL `https://xenvra.kareixo.me`, redirects for localhost + Vercel previews); custom SMTP (Resend/Brevo, sender on your domain, reply-to `xenvra.official@gmail.com`); email templates rebranded; enable Realtime for `resumes`, `entitlements`; backups on.
- [ ] Google Cloud: OAuth consent screen → In production, support email `xenvra.official@gmail.com`, authorized domain, privacy/terms URLs; redirect URI `https://<project>.supabase.co/auth/v1/callback`.
- [ ] Vercel: all env vars (Production + Preview), domain `xenvra.kareixo.me`, cron configured, analytics on.
- [ ] Razorpay: test-mode E2E pass; webhook URL + secret set; live activation status noted (may take days — launch can go out with payments labelled "Pro coming soon" if not active).
- [ ] Legal pages match behaviour; contact email unified.
- [ ] Playwright smoke suite green: sign-up → create resume → type → reload (persisted) → switch template → export PDF → upgrade (test) → plan unlocked live → delete account.
- [ ] Lighthouse ≥ 90 perf/SEO/a11y on landing; axe has no serious issues; OG preview checked.
- [ ] Rollback plan: previous Vercel deployment pinned; DB migration reversible notes.

## Rules for you
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or Razorpay secret to the client (`server-only`).
- Prices, plan limits, and entitlements are decided server-side only.
- Small, reviewable commits; no unrelated refactors; no new dependencies without saying why.
- When unsure about Next 16 behaviour, read the bundled docs instead of guessing.
- End each phase with: what changed, what you ran, what is still open.
