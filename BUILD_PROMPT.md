<USER_REQUEST>
# Xenvra v2 — Studio Pivot Build Prompt (paste into Claude Code)

You are a senior full-stack engineer working in https://github.com/karanray06/Xenvra (Next.js 16 App Router, React 19, TypeScript, Tailwind v4, Supabase, Vercel). Read `AUDIT_V2.md` first: it lists confirmed vulnerabilities and bugs, with file paths. Work phase by phase, **in order**. After each phase: `npm run lint`, `npx tsc --noEmit`, `npm run build`, run the tests you added, commit (small commits), and report: what changed, what you ran, what is still open. Never claim something works unless you ran it. If something needs a secret, dashboard click, account activation, or a decision that is mine, stop and list it instead of faking it.

Before coding: read `AGENTS.md` and the relevant docs in `node_modules/next/dist/docs/` (this Next version differs from your training data; `src/proxy.ts` replaces middleware). Check which branch is deployed to https://xenvraresume.vercel.app. The live site has a Vector Studio nav item and a blue Modern template that `main` does not, so find and merge the deployed branch before changing anything.

## Product direction (changes the whole app)
Xenvra stops being "just a resume builder". It becomes **a design studio for career and campus work: resumes, presentations (pitch decks, project/viva decks), cover letters, LinkedIn banners, posters, certificates, business cards, and more**, with ready-made templates where people add their own photos and text. Tagline candidates: "Design resumes, decks & more — in minutes." / "Your career, beautifully designed." Update every piece of copy, metadata, FAQ, pricing and the landing page to this positioning. Resume-specific superpowers (ATS score, JD tailor, AI writing, job tracker) remain as differentiators inside the studio, not as the product's whole identity.

Navigation (top bar) becomes: **Home · Studio · Templates · Jobs (tracker + search) · Cover Letters · JD Tailor · Settings**. The standalone **Builder is removed** and `/dashboard/builder` 301-redirects to `/dashboard/studio`. **Billing leaves the navbar** and lives only in **Settings → Plan & Billing** (`/dashboard/settings#billing`; `/dashboard/billing` 301-redirects there). Keep the user menu with an "Upgrade" shortcut that deep-links to the settings billing tab.

## Brand rules (non-negotiable)
Use only the brand palette across the whole app, all templates, loaders, charts, empty states and emails:
- Ice Silver `#E6EEF4`, Mocha Brown `#5A4032`, Platinum Silver `#C9CCD1`, Pale Lavender `#DCD3F2`, plus derived tints/shades and the existing ink/white neutrals in `brand-tokens.css`.
- You told me "5 colours" but listed four. **Ask me for the fifth** before Phase C ends; until then use the four plus derived neutrals. Do not invent a fifth.
- Remove every off-brand colour: blue Modern template default, `#F97316`, `#6366F1`, and blue/amber/emerald/green utility colours in `billing-client`, `builder-toolbar`, `design-*`, `application-tracker-client`, `ats-drawer`, `p/[slug]`. Run `grep -rnE "#[0-9a-fA-F]{6}|(blue|indigo|emerald|amber|green|red|orange)-[0-9]{2,3}" src` and justify any remaining hit (semantic success/danger tokens are allowed, defined in tokens only).
- Studio default swatches = brand palette first; users may pick custom colours but the "Brand kit" panel always shows the palette and a one-click "Recolour to brand" action.

---
## Phase A — Stop the bleeding (security) — DO THIS FIRST, ship it alone
Acceptance for the whole phase: the exploit scripts you write (and commit under `tests/security/`) all fail against the new code.
1. **Disable client-triggered fulfilment.** Remove `auto_confirm`, user-typed UTR unlock, the fake FamPay/Card tab (it collects card number/CVV and charges nothing — delete it entirely), and the "I Have Paid — Unlock Pro Immediately" button. `POST /api/billing/verify` is deleted. Replace with `GET /api/billing/status?order_id=` that requires auth and returns status only for the caller's own order (select via user-scoped client; RLS allows own rows).
2. **One fulfilment path.** New migration `004_payments_hardening.sql`:
   - Rename `razorpay_order_id/payment_id/signature` → `provider_order_id/provider_payment_id/provider_signature`; add `provider text not null`, `amount_paise integer`, `currency text default 'INR'`, `expires_at timestamptz`, `paid_at`, `raw_event jsonb`; statuses `created | awaiting_payment | processing | paid | failed | expired | refunded | needs_review`.
   - `unique (provider, provider_order_id)` and `unique (provider, provider_payment_id) where provider_payment_id is not null` (idempotency).
   - `create function fulfil_payment(p_provider text, p_order_id text, p_payment_id text, p_amount_paise int, p_raw jsonb)` — SECURITY DEFINER, `revoke all … from public, anon, authenticated; grant execute … to service_role`. In one transaction: lock the payment row `for update`; reject if missing, expired, already paid with a different payment id, or **amount/currency ≠ the order's**; mark paid; extend `entitlements` (from `max(now, current_period_end)`); never accept plan/user from the caller.
   - Keep `payments` insert/update **service-role only**; the checkout route uses the admin client and treats insert failure as a 500.
   - Drop `profile_views` "Anyone can insert" (re-created by 003) and stop inserting views from page render; record views through a rate-limited server route that dedupes per (profile, hashed ip+ua, day).
3. **Webhook (`/api/billing/webhook/[provider]`)**: read raw body; **require** signature header and timestamp (reject if missing, stale > 5 min, or length mismatch before `timingSafeEqual`); secret has **no default** — app fails to boot in production if missing; look up the order server-side, ignore any plan/user in the payload; call `fulfil_payment`; return 200 only after commit; log event ids, not payloads; unknown events → 200 no-op.
4. **Env** (`src/lib/env.ts`): in production throw on missing required vars (Supabase, service role, payment secrets, CRON_SECRET); `updateSession` must not silently skip auth when env is missing in production.
5. **Upgrade Next** to the patched release (`npm audit` said 16.4.3), `npm audit fix` for `source-map-js`, re-run `npm audit` (target: 0 critical/high), re-test build. Remove the ESLint `any` error.
6. **Rate limiting**: replace the in-memory limiter with Upstash Redis (or Vercel KV) — sliding window keyed by `user_id` (fallback ip). Budgets: auth 10/min, billing 10/min, AI 20/min, upload 20/min, general 120/min. Return 429 with `Retry-After`. Don't trust a client-controlled `x-forwarded-for` beyond Vercel's value.
7. **AI metering for every LLM route** (`improve`, `cover-letter`, `tailor`, future deck-gen): one `consume_ai_credit(user, kind)` SQL function (atomic check+insert, plan-aware), refund the credit if the provider call fails, no silent fall-back to canned text presented as AI. Plan gate `tailor` and `cover-letter` as advertised.
8. **Server-only writes**: stop writing `resumes` / designs from the browser client. All mutations go through route handlers/server actions that Zod-validate, enforce plan rules (premium templates, resume/design count, size caps), and use optimistic concurrency with an atomic `update … where version = :v returning version`. Add DB `check (pg_column_size(doc) < 2000000)` on design docs. Make `/print` and exports enforce template/plan rules too.
9. **Version history**: snapshot at most once per N minutes or on explicit "Save version", keep last 30 per document, validate `POST /versions`, verify ownership of `resume_id`.
10. **Public portfolio**: add SECURITY DEFINER RPC `get_public_profile(slug)` returning only the published document's fields; email/phone only if the owner ticked "show contact"; no anonymous SELECT on `resumes`. Reserve slugs (`admin, api, login, dashboard, p, print, …`). Public PDF via a signed, short-lived URL.
11. **CSP**: nonce-based (`script-src 'self' 'nonce-…' 'strict-dynamic'`), remove `unsafe-eval`, drop Razorpay domains unless used, restrict `img-src` to self, Supabase storage, Google avatars, data/blob. Generate QR codes locally with the `qrcode` package (no `api.qrserver.com`).
12. **Hygiene**: generic error messages to clients + server logging with a request id; `try/catch` around `req.json()` everywhere via one `parseJson(req, schema)` helper; Zod on `PUT /api/applications`; `Origin`/`Sec-Fetch-Site` check on mutating routes; cron route fails closed if `CRON_SECRET` is missing; remove the unauthenticated order lookup.
13. **Security tests** (Vitest/Playwright, committed): forged webhook (no signature / wrong signature / stale / wrong amount / replay) → no entitlement change; `verify` route gone (404); two-user IDOR test across every table and route (user B can't read/update/delete user A's resumes, designs, assets, applications, letters, versions, payments); free user cannot use Pro templates via direct Supabase calls; RLS tests run against a local Supabase (`supabase start`).

---
## Phase B — Information architecture, loaders, performance
1. **Global loading UX** (fixes the ~1 s navigation lag the users feel):
   - Add `loading.tsx` with skeletons for `/dashboard`, `/studio`, `/templates`, `/jobs`, `/cover-letters`, `/tailor`, `/settings`.
   - Add a slim top progress bar (brand lavender on mocha) driven by navigation start/end (use `useLinkStatus` / `next/link` pending state per the bundled docs, or a small custom provider), plus a pending state on nav items so clicks feel instant.
   - One branded full-screen loader (logo mark + subtle pulse) for first load/auth handoff; never a blank page. Respect `prefers-reduced-motion`.
2. **Remove the real latency**: dedupe auth per request with a cached helper (`getSessionUser = cache(...)`) instead of calling `getUser()` in proxy + layout + page; prefer local JWT verification (`getClaims`) where the bundled supabase-js supports it; run independent queries with `Promise.all`; stop calling admin plan lookups on every page (cache plan on the session payload / read once in layout and pass down); add DB indexes for every `eq(user_id)` + `order by updated_at` query. **Check regions**: set `"regions": ["bom1"]` in `vercel.json` and confirm the Supabase project is in `ap-south-1`; if it isn't, tell me (migrating costs time, but a cross-ocean hop per query is the likely main cause).
3. Prefetch primary routes; lazy-load heavy studio code (`next/dynamic`, no SSR for the canvas); keep landing JS < 120 KB gzip.
4. Measure before/after with Lighthouse + `@vercel/speed-insights`; targets: nav to skeleton < 100 ms, p75 content < 700 ms, landing LCP < 2.0 s on 4G.
5. Implement the new nav (above), redirects, and move Billing into Settings (tabs: Profile · Plan & Billing · Public profile · Brand kit · Danger zone). Delete the builder route/components once Phase D is live (keep `ResumeForm`/schemas, they become the Studio "Content" panel).

---
## Phase C — Brand system pass
- Replace tokens with `brand-tokens.css`; add dark-on-mocha and light-on-ice component variants; recolour the app, emails, OG images, loaders, charts (use palette only; follow `BRAND_GUIDE.md`; validate contrast ≥ 4.5:1 for text).
- Rebuild the 5 existing resume templates + add 5 more in-palette (10 resume templates total), driven by a `theme` object (palette + font pairing) instead of hard-coded colours.
- Self-host fonts (Fontsource, OFL): Plus Jakarta Sans (UI), plus a studio set: Inter, Space Grotesk, DM Serif Display, Playfair Display, Poppins, Montserrat, Oswald, Anton, Bebas Neue, Lora, JetBrains Mono, and **Noto Sans Devanagari / Bengali** for Hindi and Bengali content.
- Get my answer on the fifth brand colour.

---
## Phase D — Xenvra Studio (the Canva-grade editor) — the flagship
### Decision on Penpot
Do **not** try to copy Penpot's features/code: it is a large Clojure/ClojureScript platform (backend, frontend, exporter, render modules) under MPL-2.0, whose file-level copyleft means copied files stay MPL and their source must be offered if distributed. It also can't be hosted on Vercel. Build the Studio on an MIT canvas stack and borrow **ideas** (layers, constraints, components, boolean ops, auto-layout, SVG-native export). For content, allow **importing SVG** (sanitised) so people can bring Penpot/Figma exports. Do not bulk-scrape Penpot libraries/templates: each item carries its own licence — only include an asset if its licence allows it, and record it in `ATTRIBUTIONS.md` (source, author, licence, URL). Remove the "Penpot" label from the UI; call it **Xenvra Studio**.

### Stack
`react-konva`/Konva **or** Fabric.js v6 (both MIT; pick after a 1-day spike on text editing quality, performance with 300 nodes, and SVG export fidelity — document the choice in `docs/adr/001-studio-engine.md`), Zustand for editor state with an undo/redo **command stack** (cap 200, patch-based, not full copies), `@dnd-kit` for panels, `pptxgenjs` (MIT) for PPTX, `pdf-lib` or server-side Playwright for PDF, `sharp` for image processing, `qrcode`, DOMPurify for imported SVG, Lucide (ISC) for the icon library.

### Data model (migration `005_studio.sql`)
- `designs(id, user_id, kind check in ('resume','deck','cover_letter','poster','social','card','certificate','banner','custom'), title, doc jsonb, schema_version int, resume_id uuid null, thumb_path text, version int, is_template bool default false, created_at, updated_at)` with RLS own-rows + realtime; `check (pg_column_size(doc) < 2000000)`.
- `doc` = `{ pages: [{ id, name, width, height, background, elements: Element[] }], brandKit?: {...}, meta }`, validated by a strict Zod **discriminated union** (`text | shape | image | frame | group | line | icon | table | chart | qr`), with numeric bounds, max 50 pages, max 500 elements/page, string length limits, and colour/font allow-lists. Reject unknown keys.
- `assets(id, user_id, bucket_path, mime, bytes, width, height, sha256, created_at)`; Supabase Storage private bucket `user-assets/{user_id}/…` with RLS on path prefix; plan quotas (Free 50 MB, Pro 2 GB).
- Migrate old `resumes.design_json` into `designs`. Resume-kind designs stay linked to structured `resumes.data` so ATS score, JD tailor and AI writing keep working: text nodes can be **data-bound** (`{ bind: "experience[0].highlights[1]" }`), and editing either side updates the other.

### Features (all required for v1 of the Studio; mark anything you can't finish in `docs/studio-gaps.md`)
- **Documents & pages**: presets A4, US Letter, 16:9 slide (1920×1080), 4:3, 1:1 post, 4:5, 9:16 story, LinkedIn banner (1584×396), business card, A3 poster, custom size; multi-page decks with page thumbnails strip, add/duplicate/reorder/delete, **Magic resize** to another preset.
- **Canvas**: pan/zoom (trackpad, wheel, pinch, fit/100%/200%), rulers + draggable guides, grid, **smart guides + snapping** to edges/centres/spacing, multi-select (marquee, shift), group/ungroup, lock, hide, z-order, align + distribute, flip, rotate with angle snap, nudge with arrows, copy/paste/duplicate, **layers panel** with rename and drag-reorder, keyboard shortcuts with a cheat sheet (`?`).
- **Text**: on-canvas editing (double-click), font family/size/weight/italic/underline, line-height, letter-spacing, alignment, case, lists, colour/gradient, text shadow/outline, auto-fit box, curved text optional; paragraph styles ("Heading/Body/Caption") per document; Hindi/Bengali rendering verified.
- **Shapes & graphics**: rect (per-corner radius), ellipse, line/arrow, polygon/star, blob/organic shapes library, dividers, stickers; fills: solid, gradient (brand-limited presets), image; stroke, dash, opacity, blend (multiply/overlay), shadows; **icon library** (Lucide) with colour control; **charts** (bar/line/donut from an editable mini table) and **tables**; **QR code** element.
- **Images & photo frames (key requirement: "people can simply add their pics")**: upload (drag-drop, picker, paste, camera on mobile) → validated, resized, EXIF-stripped (privacy), stored as an asset; **frames** (circle/rounded/blob/arch/polaroid/device) with a placeholder "Add photo"; drop an image onto a frame → auto-fill with crop/pan/zoom; replace-image keeping the crop; filters (brightness/contrast/saturation/blur/duotone in brand palette); image **background removal** only if you can use a client-side library whose licence you have checked (some are AGPL; if unsure, ship without it and list it in gaps).
- **Panels**: Templates, Elements, Text, Uploads, Brand kit (palette + fonts + logo), Layers, Pages, Properties (contextual), Content (resume form/data-bound fields for resume kind), ATS (live score for resume kind).
- **Autosave** through the server API with the serialized queue, offline indicator, conflict handling (reuse Phase 3 logic from v1), version history (explicit + periodic), realtime sync across tabs, **presence** ("also open elsewhere").
- **Export**: PNG/JPG (1×/2×/4×, transparent option), **SVG** (export from the document model, NOT `document.querySelector("svg")` — the current code exports the wrong SVG), **PDF** (vector, correct page size, embedded fonts, real selectable text so resumes stay ATS-readable), **PPTX** (native text/shapes/images, editable; document what is rasterised), multi-page PDF/PPTX for decks, ZIP of PNGs. Free plan: watermark on export (`Made with Xenvra`, bottom-right, removable only on paid); no watermark in the editor.
- **Present mode** for decks (full-screen, arrows, speaker notes optional) and a shareable **view link** (unlisted, revocable, view-count) with a server-rendered preview image for link unfurls.
- **Accessibility/performance**: keyboard operable tool palette, focus management, ARIA labels, reduced-motion; virtualise layers/pages lists; render only visible pages; 60 fps drag on 300 nodes on a mid-range laptop; image proxies/thumbnails; lazy-load fonts per use.
- **Tests**: unit (Zod doc schema, command stack, export mappers), Playwright (create → add text/image/frame → autosave → reload → export PDF/PNG/SVG/PPTX → open PPTX with a validator), visual regression of the template gallery.
Remove the old `design-*` components after parity and migration.

---
## Phase E — Template library (originals only)
**Important:** the three PDFs you sent (blue/white startup pitch, blue-lime marketing pitch, red/pink bold pitch) are Canva designs with Canva-licensed photos and graphics. Use them only as a **structure reference** (the 10-slide anatomy below). Do not trace their layouts, copy their photos, shapes, fonts-as-designed, or wording. Build **original** layouts in the Xenvra brand palette, with neutral placeholders (gradients/abstract shapes and "Add photo" frames) rather than stock photos.

**10 presentation templates, 10 slides each** (16:9). Slide anatomy to follow in every deck: 1 Cover · 2 Problem/Context · 3 Solution/Idea · 4 Market/Research (chart or big-number) · 5 Product/Business model · 6 Traction/Success stories (big numbers) · 7 Strategy/Plan · 8 Team (photo frames) · 9 Roadmap/Timeline (or Financials) · 10 Thank you/Contact.
Decks: (1) Startup Pitch, (2) Marketing Plan, (3) Consulting/Strategy, (4) Product Launch, (5) College Project / Viva, (6) Hackathon Demo Day, (7) Business Proposal / Sales, (8) Portfolio & Case Study, (9) Event / MUN / Conference, (10) Personal Brand / Interview Intro. Each has 3 brand-palette themes (Mocha-dark, Ice-light, Lavender-accent) switchable in one click, distinct type pairing and layout rhythm (so they don't look like one template recoloured).

**Resume**: 10 templates (existing 5 rebuilt + 5 new: two-column, minimal serif, creative sidebar, compact one-page, academic/CV), all ATS-safe PDF export with real text.
**More categories (≥ 4 each at launch)**: cover letter, LinkedIn banner, business card, certificate, event poster, Instagram post/story, name tag/placard, one-page portfolio. Categories + tags drive the gallery and SEO.
Build templates in code (`src/templates/**` TypeScript builders that output the doc JSON) so they are reviewable and testable; generate thumbnails in CI; each template must pass a Playwright visual snapshot and a contrast/overflow check (text must not overflow frames with 2× longer copy). `templates` table or static manifest with `slug, title, kind, category, tags, aspect, premium, thumb, seoDescription`.

---
## Phase F — Payments with automatic live tracking
**Principle:** the payment gateway's signed webhook (verified server-side) is the only thing that unlocks features. The UI "live tracks" by subscribing to the payment row; it never decides anything.
1. **Provider interface** `src/lib/payments/provider.ts`: `createOrder`, `verifyWebhook(rawBody, headers) → {orderId, paymentId, amountPaise, status}`, `fetchOrderStatus(orderId)`, `refund`. Providers: `razorpay` (primary), optionally `cashfree`/`phonepe` later, and `youpi` (see below). Selected by `PAYMENT_PROVIDER` env; **no personal VPA anywhere**; UPI QR/intent comes from the provider per order.
2. **Primary: Razorpay** (UPI/QR/cards/netbanking) — I'll supply test keys now and live keys after account activation (KYC can take days). Checkout via Orders API; webhook events `payment.captured`/`order.paid`/`payment.failed`/`refund.processed`. Until live activation, ship in test mode and keep the "Upgrade" button visible but clearly labelled; do not take real money through unverified paths.
3. **Live tracking UX** (Settings → Plan & Billing → checkout modal): states `Order created → Waiting for payment (QR / UPI intent, 15:00 countdown) → Payment received, confirming → Plan active`, or `Failed / Expired / Needs review`. Implementation: Supabase Realtime subscription on the caller's `payments` row (RLS select-own) + 3 s polling of `/api/billing/status` as fallback + `visibilitychange` re-sync; on success, confetti-free calm success state, entitlement realtime already unlocks the UI; on expiry, "Create new order" button. Works across tabs/devices; idempotent if the user pays twice (second payment auto-queued for refund/needs_review).
4. **YouPI-PG (optional, experimental, off by default)** — you asked for it, so support it as `PAYMENT_PROVIDER=youpi`, **but** its own README says it is an experimental, not bank/NPCI-approved project, not for critical payments, not to be the sole source of truth, and that bank alerts can be spoofed, delayed, duplicated or misattributed. So, if enabled:
   - Never auto-grant from a single signal: require valid HMAC (+ timestamp, nonce, no default secret), exact amount + currency + order match, within the order's 15-minute window, and **unique-amount matching** (e.g. ₹49.07 per order) to avoid misattribution; anything ambiguous → `needs_review` + an admin queue, not an upgrade.
   - Run the observer on a separate hardened host with a **dedicated business bank account/VPA** and a dedicated mailbox, never your personal phone-number VPA or main Gmail; document secrets handling; kill-switch env flag; daily reconciliation job comparing paid orders vs bank statement export.
   - Rate-limit, log, and alert on anomalies (many pending, repeated amounts). Document these limits in `docs/payments.md` and tell users plainly that UPI payments confirm automatically within ~1 minute.
   If any of this is too heavy, leave YouPI as a disabled stub and ship Razorpay only; tell me.
5. **Plans** (update copy + DB): keep Free / Beginner ₹29 / Pro ₹49 (30-day non-renewing passes) unless I change them, but re-express benefits for the Studio: watermark-free export, PPTX/PDF/SVG export, premium templates, storage quota, AI credits (state real numbers, no "generous"), JD tailor/cover letters, job search match scores, version history, public link analytics. Remove the unverifiable "0% gateway fees" claim. Server-side price from DB only. GST/invoice: generate a simple receipt PDF and email it; tell me whether I need GST registration (ask a CA; this is not legal/tax advice).
6. **Settings → Plan & Billing**: current plan, expiry, usage meters (AI credits, storage, designs), payment history, receipts, "Extend / Upgrade", refund policy link, support mail `xenvra.official@gmail.com`.
7. Webhook tests with Razorpay's test events + replayed/forged payloads (see Phase A).

---
## Phase G — Job search + apply inside the Tracker ("Jobs")
**What is actually possible:** there is no legal way to submit applications on LinkedIn/Naukri/Indeed on a user's behalf (no public apply APIs; scraping violates their terms and breaks). Employer ATS APIs (e.g., Greenhouse/Lever apply endpoints) need the employer's own key. So "direct apply" is delivered as: **find → match → prepare a tailored application package → one-click open the employer's apply page → track it automatically**. Say this plainly in the UI copy; don't promise auto-submit.
1. **Job sources** behind a `JobSource` interface, each with Zod-validated normalisation, caching in a `job_listings` table (TTL ~6 h), dedupe (company+title+location hash), and per-source rate limits. Use only legitimate APIs with keys and attribution as required — check each provider's current terms before use: Adzuna (has India coverage), Jooble, Remotive, Arbeitnow, and a "Company career pages" adapter for public Greenhouse/Lever job-board feeds. No scraping. Show source + "View on {source}" attribution.
2. **Search UI** (`/dashboard/jobs`): tabs **Search | Saved | Applications (kanban)**. Filters: keyword, location (default India), remote/hybrid/on-site, experience (intern/fresher/junior/mid), posted in last 24h/7d/30d, salary where given; sort by relevance/date/match; infinite scroll, skeletons, empty states; saved searches + optional daily email digest (Resend + cron).
3. **Match score**: deterministic, explainable score between a chosen resume and each listing using the existing ATS engine (matched/missing keywords); never fabricated.
4. **Apply flow**: "Apply" opens a side sheet: (a) pick resume (or "Tailor for this job" → duplicates the design and applies JD keywords the user can accept/reject, only using facts already in their resume), (b) generate/choose cover letter, (c) copy-ready answers (summary, links), (d) **Open employer apply page** → a server route `/go/[listingId]` looks the URL up by id, validates `https`, logs the click, and 302s (no open redirect; `rel="noopener noreferrer"`). When the user returns, a non-blocking prompt "Did you apply?" moves the card to **Applied** and stores which resume/cover-letter version was used.
5. **Tracker upgrade**: drag-and-drop kanban (`@dnd-kit`), card fields: company, role, job URL, source, location, salary, deadline, contact, notes, follow-up date, resume/cover letter used, JD text; timeline table `application_events`; stats (response rate, stage funnel); search/filter; CSV export; **visible error toasts** (the current code swallows errors); realtime across tabs; reminders (follow-up/deadline) by email cron.
6. **Safety**: Zod on every route; plan limits (Free: 25 saved/tracked, Pro: unlimited); rate-limit search per user; sanitise listing HTML before display (DOMPurify, strip scripts/styles/iframes); never store third-party credentials.

---
## Phase H — SEO (proper, not a checklist)
1. `metadataBase`, per-route `generateMetadata` (unique title ≤ 60 chars, description ≤ 155), canonical URLs, `en-IN` language/`hreflang`, Open Graph + Twitter cards with **dynamic OG images** per template/category (`next/og`).
2. **Public, server-rendered template gallery** (indexable): `/templates`, `/templates/resume`, `/templates/presentation`, `/templates/[kind]/[slug]` with H1, description, thumbnails (`next/image`, descriptive `alt`), related templates, "Use this template" CTA (login redirect preserves intent). Programmatic landing pages with genuinely useful content (not thin/duplicated): e.g. "free pitch deck templates for students", "ATS-friendly resume templates (India)", "college project presentation template", "MUN placard and certificate templates", "LinkedIn banner maker". Each needs unique copy, FAQs, and examples.
3. Structured data (JSON-LD): `Organization`, `WebSite` (+ SearchAction), `SoftwareApplication` with `offers` (INR), `FAQPage`, `BreadcrumbList`, `CreativeWork` for templates. Validate with Rich Results Test.
4. `sitemap.ts` (templates, categories, blog, static pages; lastmod), `robots.ts` (disallow `/dashboard`, `/api`, `/print`, `/go`; allow gallery), `noindex` on app pages, `/print`, share-view links unless the owner opts in; 301 for removed routes.
5. Content: `/blog` (MDX) with 5 launch posts (resume tips for freshers in India, ATS myths, how to build a pitch deck in 10 slides, college project PPT checklist, LinkedIn banner guide) — real, useful, no AI filler; internal linking; author/about page; `llms.txt` optional.
6. Core Web Vitals: LCP image priority, font `display: swap` with self-hosted fonts, no CLS, tiny landing JS, image sizes/AVIF; Lighthouse SEO ≥ 95, Performance ≥ 90 on landing and gallery.
7. Analytics/consent: Vercel Analytics + a privacy-respecting event plan (template_opened, export_clicked, upgrade_started) with a short cookie/analytics notice; Search Console + Bing verification meta (I'll supply tokens); update Terms/Privacy/Refund to match actual behaviour, and the new contact email.
8. Brand consistency: favicon set, `manifest.ts` (name/short_name/theme `#5A4032`/background `#E6EEF4`), apple-touch icon.

---
## Phase I — Differentiators (build in this order after A–H; each behind a feature flag)
1. **Career Kit**: one profile feeds resume, cover letter, deck bio slide, LinkedIn banner, business card and portfolio page — edit once, update everywhere (data-bound text).
2. **One-click Brand re-theme** and **Magic Resize** across formats.
3. **Bulk certificate/placard generator**: upload CSV (name, role, event) → N personalised PDFs in a ZIP (great for MUNs, hackathons, college clubs; fits the campus market). Rate-limited, size-capped, quota by plan.
4. **AI deck/resume draft from an outline** (structured JSON that must pass the doc Zod schema; uses only facts the user typed; shows what it added; metered credits; no fabricated metrics).
5. **ATS-safe guarantee**: live ATS score while designing, plus a "text layer check" that warns if exported PDF text isn't extractable.
6. **Present mode + speaker notes + shareable view link analytics.**
7. **Student & club plans** (campus codes/bulk seats, cheaper), Hindi/Bengali-first templates, **PWA/offline editing** with background sync.
8. Later: real-time collaboration (presence cursors, comments), Penpot/Figma SVG import presets, extension to apply-autofill.

---
## Phase J — Quality gates and launch
- Definition of done for every phase: lint/tsc/build green; tests added; no new `any`; no secrets in client bundles (grep for `NEXT_PUBLIC_` additions); `npm audit` no high/critical; axe has no serious issues; Lighthouse targets met.
- Run: Playwright E2E (signup → create from template → add photo → export 4 formats → upgrade in test mode → live status flips → feature unlocks → delete account), security tests from Phase A, RLS two-user suite, load test on `/api/*` (k6) to confirm the Redis limiter works across instances.
- Observability: Sentry (client+server), structured logs with request ids, a payments dashboard query (orders by status, needs_review), uptime check on `/api/health` (add it, no secrets in output).
- Release: preview deploy → staging Supabase → run migrations 004/005 on a copy first → feature-flag Studio → production. Write `LAUNCH.md` (updated: no Razorpay-only text, YouPI notes), `docs/runbook.md` (rotate keys, refund flow, incident response), and a rollback plan (previous Vercel deployment pinned, reversible migrations).

## Things I (Karan) must provide — stop and ask when you need them
Fifth brand colour · Razorpay test then live keys (and activation status) · Groq/OpenAI key choice and monthly budget cap · Upstash Redis URL/token · job API keys (Adzuna/Jooble) · Resend key and sender domain · Search Console/Bing tokens · confirmation of Supabase region · the deployed branch name · decision on whether to enable YouPI at all.

## Rules for you
- Security phase ships first, alone. Don't start Studio work on top of the exploitable payment code.
- Prices, plans and entitlements are decided server-side only; the browser never grants anything.
- No scraping, no copying third-party designs/photos; record licences in `ATTRIBUTIONS.md`.
- No fabricated metrics or achievements in any AI or heuristic output; show real numbers or ask.
- Small, reviewable commits; no unrelated refactors; explain any new dependency (name, licence, why).
- When unsure about Next 16 behaviour, read `node_modules/next/dist/docs/` instead of guessing. 
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-24T13:03:35+05:30.

The user's current state is as follows:
Active Document: c:\Users\2006k\OneDrive\Desktop\Xenvra\SECURITY_AUDIT.md (LANGUAGE_MARKDOWN)
Cursor is on line: 1
Other open documents:
- c:\Users\2006k\OneDrive\Desktop\Xenvra\src\components\templates\modern-2.tsx (LANGUAGE_TSX)
- c:\Users\2006k\OneDrive\Desktop\Xenvra\src\components\design\layer-panel.tsx (LANGUAGE_TSX)
- c:\Users\2006k\OneDrive\Desktop\Xenvra\src\app\global-error.tsx (LANGUAGE_TSX)
- c:\Users\2006k\OneDrive\Desktop\Xenvra\src\app\not-found.tsx (LANGUAGE_TSX)
- c:\Users\2006k\OneDrive\Desktop\Xenvra\src\app\print\[id]\page.tsx (LANGUAGE_TSX)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from Gemini 3.8 Flash (High) to Claude Opus 4.6 (Thinking). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>