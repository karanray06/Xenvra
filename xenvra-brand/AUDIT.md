# Xenvra — Deep Audit (repo `karanray06/Xenvra`, commit 4ea3b6e, audited 23 Oct 2026)

## What was actually verified
- Cloned and read every source file (~3,000 lines): auth, middleware (`proxy.ts`), builder, templates, dashboard, settings, SQL migration.
- `npm ci` OK. `eslint` clean. `tsc --noEmit` clean **after** `next typegen` (the `LayoutProps` error is just a generated type).
- `next build` could **not** be completed here: my sandbox can't reach Google Fonts. That is an environment limit, not proof of a bug — run `npm run build` on your machine/Vercel before launch.
- Not verified: your live deployment, your Supabase project settings, Google OAuth console, Razorpay account, DNS.

## The headline
The app today is: login + dashboard + form editor + 3 working templates + autosave + browser-print PDF. **There is no backend logic at all** (zero `app/api` routes). The landing page and pricing promise AI writing, ATS score, DOCX export, 5 templates, paid plans, public profile, job tracker — none of those exist yet. Launching tomorrow with those claims = misleading users. Either ship them or cut the claims (P0-1).

## P0 — fix before launch
1. **Marketing claims exceed the product.** Landing/pricing/FAQ promise AI assistant, ATS score, DOCX, "unlimited AI", ₹29/₹49 plans, version history, public profile. Settings page literally says "Razorpay payments coming in Phase 4". → Build the minimum (payments, plan enforcement, 1 AI action, ATS score) or relabel as "Coming soon".
2. **PDF export is likely broken/unstyled.** `builder-toolbar.tsx` opens a blank window and copies only `previewEl.innerHTML`; the templates are styled with Tailwind classes, but no stylesheet is copied into that window, so the printed PDF loses its styling. Also popup blockers kill it, and there is no free-plan watermark. → Use a real print stylesheet on the same page, or a server route that renders to PDF.
3. **Autosave can silently lose data.** Supabase JS returns `{ error }` instead of throwing; the code only has `try/catch`, so failed saves (RLS, FK, offline) still flip to "Saved". Also: pending debounce is cleared on unmount (last ~1.5 s of edits lost when navigating), no `beforeunload` flush, and two quick edits before the first insert returns can create duplicate resumes (id is `null` until the response).
4. **Profile row is created only in the OAuth callback.** If that insert fails (or a user is created another way), `resumes.user_id → profiles.id` FK fails and, because of #3, nobody notices. No `entitlements` row is ever created either. → DB trigger on `auth.users` insert creating `profiles` + free `entitlements`.
5. **Open redirect in `/auth/callback`.** `next` is appended unvalidated to `https://${x-forwarded-host}${next}`; `next=@evil.com` becomes `https://yourhost@evil.com`. → Accept only paths starting with a single `/`. Also `encodeURIComponent` the `redirect` param on the login page.
6. **`usage_events` INSERT policy is `WITH CHECK (true)`** (comment says "service role only"). Service role bypasses RLS anyway, so this policy only opens inserts to everyone — anyone can write fake usage rows (quota poisoning for AI limits). → Drop the policy. Same pattern on `profile_views` (anyone can insert): move behind a server route with rate-limiting.
7. **Plan gating is UI-only.** `free: false` templates are selectable; `professional-1` renders the ATS template and `modern-2` is Modern with a different colour (placeholder templates sold as "Pro"). Free-plan limit of 1 resume is not enforced anywhere. Templates page links `?template=` but the builder ignores it. → Enforce in DB/server (RLS + RPC) not just UI.
8. **Template id mismatch.** SQL default is `'modern'`, app uses `'modern-1'` → falls into the renderer default silently. Align.
9. **Delete account is disabled but the Privacy Policy promises it** ("delete from Settings"). Legal/trust issue (and DPDP Act expectations in India). → Implement via a server route using the service role (`auth.admin.deleteUser`).
10. **Email sign-in won't survive real traffic.** Supabase's built-in email sender is heavily rate-limited. → Configure custom SMTP (see launch notes).
11. **Contact addresses inconsistent:** `support@kareixo.me` in README/landing vs the new `xenvra.official@gmail.com`. Pick one everywhere (landing footer, legal pages, README, Razorpay/Google consoles).

## P1 — should fix this week
- No input limits / server validation: Zod schema exists but is never used on save; `jsonb` size unbounded. Add size cap + validate on a server route.
- No rate limiting, no security headers/CSP, no error monitoring (Sentry), no analytics, no `robots.txt`/`sitemap.xml`, no OG image, default Next favicon.
- `.single()` on missing rows logs errors; use `.maybeSingle()`.
- Dashboard cards show an icon instead of resume thumbnails; no delete/duplicate/rename on dashboard.
- `resume_versions` table exists, nothing writes to it.
- `public_profiles` readable but resumes are not (RLS has no public read of the linked resume) → public profile feature can't work yet.
- Fonts: self-host (`next/font/local`) so builds don't depend on Google at build time.
- Accessibility: contrast on `text-tertiary` (#94A3B8 on white ≈ 2.6:1) fails AA; fixed in the new tokens.
- Tests: none. Add at least Playwright smoke (login → create resume → autosave → export).

## "Real-time working" — what it needs
- `alter publication supabase_realtime add table public.resumes, public.entitlements;` then subscribe in the builder (multi-tab/device sync, conflict via `updated_at` / version column) and in the shell (plan unlocks instantly when the payment webhook flips the entitlement).
- Reliable save queue (serialize writes, retry with backoff, "Offline – changes queued" state) — fixes P0-3 too.
- Optional: Supabase Presence for "also open in another tab/device".

## Penpot and Hyperswitch — honest take
- **Penpot** (MPL-2.0) is a full design platform written mainly in Clojure/ClojureScript with separate backend, frontend, exporter and render modules. "Copy all its features into Xenvra" is not achievable by tomorrow and probably not at all as a copy: it is a multi-year product, and copying its files obliges you to keep those files under MPL-2.0 and publish their source if you distribute. Realistic paths: (a) a **Design mode** built on an MIT canvas library (Konva/Fabric): free-position text/shapes/images, layers, snapping, SVG/PDF export, resume-specific components — a 1–2 week MVP after launch; (b) optional Penpot **plugin/API** interop or "open in Penpot" later; (c) SVG import/export so users can move between tools.
- **Hyperswitch** (Apache-2.0, Rust) is a payment **orchestrator** you must run yourself (server + Postgres + Redis) or use hosted; it sits in front of processors. I could not confirm from its docs that a Razorpay/UPI connector exists (the connector list page was blocked for me) — check this first. For a student launch tomorrow, self-hosting it adds an infrastructure and PCI-adjacent risk surface with no benefit at ₹29–₹49 price points. Recommendation: **launch with Razorpay directly** (schema and env template already assume it), behind a small `PaymentProvider` interface so Hyperswitch can be slotted in later if you add international cards/routing. Note Razorpay live mode needs account activation/KYC that can take days — test mode works today.

## Launch notes for xenvra.official@gmail.com
- Use it as the **owner/recovery account** for Vercel, Supabase, Google Cloud (OAuth consent screen "support email" + "developer contact"), Razorpay, and as public support/reply-to.
- Do **not** send app email from Gmail SMTP at scale (≈500/day cap, poor deliverability, you can't DKIM/SPF a Gmail address). Use Resend/Brevo/Zoho with a domain sender such as `hello@xenvra.kareixo.me` and keep Gmail as reply-to.
- Google OAuth: move consent screen from *Testing* to *In production* (otherwise only listed test users can sign in), add `xenvra.kareixo.me` as authorized domain, add privacy/terms URLs.
- Supabase → Auth → URL Configuration: Site URL `https://xenvra.kareixo.me`, redirect allow-list for `http://localhost:3000/**` and the Vercel preview pattern.
