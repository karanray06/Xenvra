# Xenvra — Security & Quality Audit v2
Repo `karanray06/Xenvra` @ `eb32ba3` · Live: https://xenvraresume.vercel.app · Audited 23–24 Oct 2026

## Scope and honest limits
- **Read in full:** all 17 API routes, `proxy.ts`, Supabase clients, payments lib, plan limits, rate limiter, env/config, migrations 001–003, resume provider, billing UI, tracker, design studio.
- **Ran:** `npm ci`, `eslint` (1 error, 3 warnings), `tsc --noEmit` (clean), `npm audit` (2 vulns: 1 critical, 1 high).
- **Not done:** `next build` (my sandbox can't reach Google Fonts), live header/route probing (my shell is blocked from the site; I could only read page text), authenticated testing, your Supabase/Vercel dashboard settings, RLS tested against a live database (conclusions below come from reading the SQL).
- **Repo vs live drift:** your screenshots show a **Vector Studio** nav item, a **blue** Modern template and a FamPay card tab. GitHub HEAD has no Vector Studio nav item and the Modern template defaults to orange. So the deployed build is not what is on `main`. Push/identify the deployed branch, because I can only audit what I can see.

---
## CRITICAL — fix before any more users (someone can exploit these today)

### C1. Anyone logged in can give themselves Pro for free (and extend it forever)
`src/app/api/billing/verify/route.ts` (POST) never checks that money moved.
- Accepts `auto_confirm: true`, or any user-typed "UTR" (the regex only checks 8–22 alphanumerics), or no UTR at all (it invents one).
- If the order doesn't exist (`paymentRecord` is null) it still does `plan = paymentRecord?.plan || "pro"` and upserts an **active Pro entitlement**.
- Each call extends `current_period_end` by another 30 days.
- Your own UI ships the button: "I Have Paid — Unlock Pro Immediately" sends `auto_confirm: true`.
Exploit: signed-in user → `POST /api/billing/verify {"order_id":"x","auto_confirm":true}` → Pro. Repeat for years.
**Fix:** delete client-triggered fulfilment. Only a signature-verified server-to-server webhook (or the gateway's order-status API called server-side) may grant a plan, through one DB function (see build prompt Phase A).

### C2. The payment webhook accepts unsigned requests, and the secret has a public default
`src/app/api/billing/webhook/route.ts`:
- In production it rejects only when a signature is **present and wrong**: `if (NODE_ENV === "production" && signature)`. Send **no signature header** and the event is processed.
- `YOUPI_WEBHOOK_SECRET` defaults to the literal `"youpi_wh_sec_xenvra"` in a public repo; if the env var is unset, anyone can compute valid signatures.
- If no payment row exists it trusts `event.metadata.userId` / `event.metadata.plan` from the request body → grant any plan to any user id.
- No amount check, no timestamp/replay window.
- `crypto.timingSafeEqual` throws when lengths differ → attacker-triggered 500s.

### C3. Payment rows are never actually written
`checkout/route.ts` inserts into `payments` with the **user-scoped** client, but `payments` only has a SELECT policy (migration 001). The insert is rejected by RLS and only `console.error`'d. So pending orders don't exist, `verify` finds nothing, and falls back to "pro" (C1). Use the admin client server-side, and make failure a hard error.

### C4. Fake card form collects card number, expiry and CVV
`billing-client.tsx` "FamPay / Card" tab asks for full card details, then sends only `CARD_FAM_<last4>` to `verify`, which grants Pro. No card is charged. This is both a fraud-looking pattern (a real card entry form that charges nothing) and, if users believe it, a trust/legal problem. **Remove the entire tab.**

### C5. Next.js 16.3.7 has known critical advisories
`npm audit` lists, for `next`: unauthenticated RCE in the Image Optimization API with SVG, unauthenticated RCE in `use cache` functions returning typed arrays, SSRF in image optimization, cache poisoning across users in SSG/ISR, Server Actions DoS, metadata image route disclosure. npm's suggested fix is `next@16.4.3`. Also `source-map-js` (high, DoS, build-time chain). Upgrade, re-run build, re-audit. (Your image config only allows two remote hosts, which reduces but does not remove risk.)

---
## HIGH
- **H1. Personal number exposed as payment address.** The modal shows a UPI ID that looks like a phone number (`…@fam`). It's also a `NEXT_PUBLIC_` env var, so it ships to every browser. Anyone can look up/contact it. Use gateway-generated per-order QR/intents and a business VPA, never a personal one.
- **H2. Rate limiting doesn't work on Vercel.** `rate-limit.ts` is an in-memory `Map` per serverless instance (each cold instance resets it) keyed by `x-forwarded-for`. It also keys by IP only, so a campus NAT shares 60 req/min. Use Upstash/Vercel KV keyed by user id + IP, with stricter limits on auth, billing, AI, and uploads.
- **H3. AI endpoints are unmetered or ungated.** `/api/cover-letter` calls the LLM with no quota and no plan check; `/api/tailor` has no plan check though pricing says paid-only. `/api/ai/improve` counts first, then silently falls back to a weak heuristic if the LLM fails (user loses quota for nothing), and the count→insert is racy (parallel requests bypass the daily cap). Cost-abuse risk on your Groq key.
- **H4. Client writes bypass server rules.** `resume-provider.tsx` updates `resumes` directly with the Supabase browser client, so the API's Zod validation, premium-template check and size limits don't apply (RLS only checks ownership). A free user can set `template_id` to a Pro template directly; `/print/[id]` renders any template regardless of plan. `design_json` has no size cap (the 500 KB check covers `data` only; API schema is `z.unknown()`).
- **H5. Version-history growth (storage DoS).** Every autosave through the API inserts a full `resume_versions` row (up to 500 KB). Debounced typing = hundreds of rows. No pruning, no cap. `POST /versions` accepts arbitrary unvalidated `data` and doesn't verify that `resume_id` belongs to the caller.
- **H6. Migration 003 undoes migration 002.** 002 drops "Anyone can insert profile views"; 003 recreates it `WITH CHECK (true)`. Anyone can spam inserts. The public page also inserts a view on **every render** (bots/refresh inflate analytics).
- **H7. Public portfolio can't work as written, and the obvious fix is dangerous.** RLS on `resumes` is owner-only, so `/p/[slug]` (anonymous server client) cannot read the resume → 404 for visitors (from the SQL; verify live). "Download PDF" links to `/print/[id]`, which requires the owner's login. The tempting fix (public SELECT on `resumes`) would leak every user's resume. Do it with a SECURITY DEFINER RPC/view that returns only the published resume, and make email/phone opt-in.
- **H8. Fail-open behaviour when env is missing.** `updateSession` returns early (no auth) if Supabase env vars are absent, and `validateEnv` only `console.warn`s. Pages/routes still call `getUser`, but a misconfigured deploy shouldn't silently run. Fail closed in production; require `YOUPI_WEBHOOK_SECRET`/`CRON_SECRET` etc. with no defaults.

## MEDIUM
- CSP allows `'unsafe-inline' 'unsafe-eval'` and `img-src https:` (any host); still lists Razorpay domains. Move to nonce-based CSP, tighten img/connect.
- QR is generated by `api.qrserver.com`: the order id, amount and VPA go to a third party. Generate locally (`qrcode` package).
- Internal `err.message` / Supabase error text is returned to clients in most routes (information disclosure). Return generic messages, log server-side with request ids.
- Many routes call `req.json()` with no try/catch → malformed body = 500. `PUT /api/applications` has no Zod (status/notes unbounded). `/api/tailor` uses `z.any()` for resume data.
- `GET /api/billing/verify?order_id=` is unauthenticated and leaks payment status/plan for an order id.
- Cron: `if (cronSecret && …)` → open if `CRON_SECRET` is unset. Fail closed.
- No `Origin`/`Sec-Fetch-Site` check on cookie-authenticated mutating routes (SameSite=Lax helps; add it anyway).
- Account deletion: no re-authentication; iterates all storage buckets; no audit log. Acceptable for MVP, tighten later.
- Public slugs: no reserved-word list (`admin`, `login`, `api`…), no profanity/impersonation checks.
- `auth/callback` redirect safety fix from v1 is good; keep tests for it.
- `LAUNCH.md` still documents Razorpay; `payments` columns are still named `razorpay_*` while storing YouPI data. Rename to `provider`, `provider_order_id`, `provider_payment_id`.
- Webhook handler uses `any` (the one ESLint error) and logs payloads.

## Functional bugs found
1. **Vector Studio "redirects to the builder"** (your screenshots): in code it's a mode toggle inside `BuilderClient`, not a route; the nav link and toolbar button both land on `/dashboard/builder`. It needs its own route (`/dashboard/studio`) and documents.
2. **SVG export is wrong:** `document.querySelector("svg")` returns the first `<svg>` in the page, usually a Lucide icon in the toolbar, not the artboard. PNG export has the same bug.
3. **PDF export from studio** = `window.print()` of the whole app chrome.
4. Studio autosave `PUT`s bump the shared `version`, causing false 409/conflict banners against form autosaves.
5. Undo history is an unbounded array of full element arrays; element ids use `Date.now()` (collide on fast duplicates).
6. Studio only supports text/rect/circle/line/badge: no images, no groups, no multi-select, no alignment, no pages. Labelled "Penpot" but contains no Penpot code (misleading naming).
7. Tracker swallows every error (`catch { // ignore }`), can't edit fields after creation, no drag/drop, no job URL/deadline/source, no "apply" action, no search.
8. Tailor "score after" is `Math.max(before + 15, real)`, i.e. a fabricated minimum +15 improvement; it also appends text like "with a focus on X optimization" to real bullets (fabricating claims), which contradicts the site's "never invents metrics" promise. Cover-letter/summary fallbacks also invent achievements ("spearheaded high-velocity initiatives").
9. Template hard-coded colours: modern-2 uses `#6366F1`; Modern default accent `#F97316`; blue/amber/emerald utilities in billing (37 hits), builder toolbar, tracker. Off-brand versus your palette.
10. No `loading.tsx` anywhere. Each nav does proxy `getUser` + layout `getUser` + page `getUser` + queries, with no skeleton → the ~1 s lag you noticed. Also check Vercel function region vs Supabase region (default Vercel region is far from Mumbai).
11. Landing copy conflicts: Beginner plan lists Executive/Gradient templates while the features section lists other names; "0% gateway fees" is unverifiable marketing; "Pro: generous AI" has no number.
12. ESLint: `no-explicit-any` error in webhook; unused `Sparkles`, `userEmail`, `userName`.

## About the payment approach you asked for (YouPI-PG)
Its README describes it as an **experimental research/learning project, not bank- or NPCI-approved, not for critical payments, not to be the sole source of truth.** It confirms payments by reading bank SMS/push notifications (Android APK), Gmail, or Google Messages for Web, and says alerts can be wrong, delayed, duplicated or **spoofed**, equal amounts can be matched to the wrong order, and a valid signature does not prove funds settled. Running it means giving a service access to your bank-alert email/SMS. It can be a *secondary, flagged* signal, but I'd not make it the thing that unlocks paid features. The build prompt does "automatic live tracking" with a real gateway webhook as the source of truth, and an optional YouPI provider behind safeguards.

## Priority order
1. C1–C4 (disable verify/card flow, lock webhook, fix payments writes) — **today**, before any more traffic.
2. C5 upgrade Next; H2/H3 limits; H4 server-only writes; H6 policy fix.
3. Everything in the build prompt after that.
