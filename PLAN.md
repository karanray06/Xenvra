# Xenvra Engineering & Product Plan: Canva-Grade Feature Parity

This roadmap outlines the complete architecture, database migrations, security controls, and file-by-file implementation plan to achieve full feature parity with Canva's resume suite while strictly maintaining 100% original, copyright-compliant designs and server-enforced tier boundaries.

---

## 1. Architectural Foundation & Single Sources of Truth

### 1.1 Templates as Pure Data (`TemplateSpec`)
Templates are decoupled from React component code. Adding or modifying a template requires zero new TSX files:
- **Schema**: `src/lib/schemas/template-spec.ts` (validated with Zod).
- **Definition**: JSON specifications defining grid layout (single column, two column, left/right sidebar, header band), page size (A4 / US Letter, margins $\ge 0.4$ in), design tokens (palette, font pairs, spacing, radius), section slot orders, and ATS-safe classification.
- **Renderer**: Single universal component `src/components/templates/universal-renderer.tsx` translating `TemplateSpec` + `ResumeDocument` into styled DOM elements.

### 1.2 Canonical Document Model (`ResumeDocument`)
- **Schema**: `src/lib/schemas/resume-document.ts` (versioned Zod schema).
- **Scope**: Contact, photo metadata, executive summary, work experience, education, skills (with proficiency levels & visualization styles), certifications, projects, languages, custom sections, section ordering, visibility toggles, and user style overrides.

### 1.3 Dual-Mode Editing Model
1. **STRUCTURED Mode (Default, ATS-Safe)**: Form-driven input with real-time live preview. Strictly retains machine-readable DOM and linear text stream for ATS compliance.
2. **CANVAS Mode (Vector Artboard)**: Freeform drag-and-drop powered by the Vector Studio engine (`src/components/design/`). Labeled clearly as **"Visual Design Mode (Not ATS-Optimized)"**. One-way conversion from Structured $\to$ Canvas with user confirmation.

### 1.4 Single Source of Truth for Plan Gating (`src/lib/entitlements.ts`)
| Capability | Free | Beginner (₹29 / 30-day) | Pro (₹49 / 30-day) |
|---|:---:|:---:|:---:|
| **Max Resumes** | 1 | 3 | Unlimited (999) |
| **Template Access** | 3 Basic Templates | All 24 Templates | All Templates + Early Access |
| **PDF Export** | With Watermark | Clean (No Watermark) | Clean (No Watermark) |
| **Image Export (PNG/JPG)** | ❌ | Clean (2x High-DPI) | Clean (2x High-DPI) |
| **DOCX Export** | ❌ | ❌ | Included (ATS Templates) |
| **Style Kits (Brand Hub)** | 1 Kit | 3 Kits | Unlimited |
| **AI Actions Quota** | ~5 actions / day | ~30 actions / day | 150 actions / day |
| **Storage Quota** | 20 MB | 100 MB | 500 MB |
| **Cover Letter Suite** | ❌ | Included (Matched Theme) | Included (Matched Theme) |
| **Background Remover** | ❌ | ❌ | Included |
| **Canvas Vector Studio** | ❌ | ❌ | Full Access |
| **Share Links & Embed** | View only (Basic) | Password & Expiry | Sandboxed `<iframe>` & Full |
| **Version History** | Last 3 snapshots | Last 10 snapshots | Full unlimited timeline |

---

## 2. Phase-by-Phase Implementation Roadmap

### Phase 0: Immediate Stability & Live Bug Fixes (PR 0)
- **Files Modified**:
  - `src/app/globals.css`: Fix `@media print` rules to reveal `#cover-letter-printable` in addition to `#resume-preview`, eliminating the blank page print bug.
  - `src/components/cover-letter/cover-letter-client.tsx`: Add dedicated `#cover-letter-printable` container with formatted typography and print layout.
  - `src/app/api/billing/checkout/route.ts`: Insert pending payment via `createAdminClient()` to avoid RLS block on user role.
  - `src/app/api/billing/verify/route.ts`: Accept `plan` parameter, prioritize database plan, and strictly fall back to `"beginner"` (never `"pro"`).
  - `src/components/billing/billing-client.tsx`: Pass `plan: youpiModal.planId` in all confirmation handlers.
- **Database**: Reversible script verifying and correcting any mismatched user entitlements.

---

### Phase 1: Template Library & Customization Suite (PR 1)
- **Goal**: 24 original `TemplateSpec` templates across 6 categories with real-time thumbnail rendering, live style customizer, and resume linter.
- **Categories**: Modern, Minimal, ATS-Simple, Creative, Executive, Student/Fresher (tagged by industry: Tech, Finance, Healthcare, Creative, Education, Marketing, Fresher).
- **Files**:
  - `src/lib/schemas/template-spec.ts`: Zod schema for templates.
  - `src/lib/templates/specs/*.json`: 24 template definitions.
  - `src/components/templates/universal-renderer.tsx`: Unified data renderer.
  - `src/components/builder/customization-panel.tsx`: Accent color picker, font pairings (12 Google Fonts pairs), section spacing, margin sliders.
  - `src/lib/palette-extractor.ts`: Image color extraction via median-cut quantization with automated WCAG AA contrast adjustments.
  - `src/lib/resume-linter.ts` & `src/components/builder/resume-linter.tsx`: Live guidance detecting missing contact info, bullet length, inconsistent dates, and page balance hints.
- **Database**:
  - Migration `004_style_kits.sql`: Table `public.style_kits` (`id`, `user_id`, `name`, `colors`, `fonts`, `density`, `created_at`). RLS enforced per user.

---

### Phase 2: Assets, Photo Uploads & Background Remover (PR 2)
- **Goal**: Native asset library, secure image uploads with private Supabase Storage, and client-side photo editing tools.
- **Files**:
  - `src/components/builder/asset-library-modal.tsx`: Curated inline SVG icons (Lucide/Phosphor), dividers, and badge shapes.
  - `src/app/api/uploads/route.ts`: Image upload endpoint with magic-byte validation (PNG/JPEG/WebP), EXIF stripping, 5 MB limit, and per-user storage quota enforcement.
  - `src/components/builder/photo-editor-modal.tsx`: Crop (circle, square, rounded), zoom, brightness, contrast, saturation, and filters.
  - `src/app/api/ai/remove-bg/route.ts` & `src/lib/bg-remover.ts`: Pro-tier background removal with transparent PNG output and undo history.
- **Database**:
  - Supabase Storage bucket `user-uploads` with private RLS (owner CRUD only).
  - Column `storage_used_bytes` on `public.profiles`.

---

### Phase 3: AI Writing Assistant (Canva Magic Write Equivalent) (PR 3)
- **Goal**: Contextual AI writing actions with strict anti-hallucination guardrails and atomic DB quota checks.
- **Files**:
  - `src/app/api/ai/magic-write/route.ts`: Server endpoint for `rewrite`, `expand`, `shorten`, `impact`, `grammar`, `tone`, `translate`.
  - `src/lib/ai/prompts.ts`: Anti-hallucination system prompts strictly forbidding the invention of metrics, employers, or dates.
  - `src/components/builder/magic-write-popover.tsx`: Inline floating action bar with diff preview and Accept / Reject / Regenerate controls.
  - `tests/ai-hallucination.test.ts`: Automated test suite asserting no new numerals or unsupported entities are injected.
- **Database**:
  - Atomic counter in `usage_events` with daily reset logic.

---

### Phase 4: Auto-Design ("Magic Design" Equivalent) (PR 4)
- **Goal**: Intelligent template and styling recommendation based on user industry and desired aesthetic.
- **Files**:
  - `src/lib/auto-design.ts`: Deterministic scoring engine matching candidate profile with top 3 `TemplateSpecs`.
  - `src/components/builder/auto-design-modal.tsx`: Interactive wizard applying color palette, font pairing, and layout with one click.
  - `src/lib/fit-to-page.ts`: "Fit to 1 Page" algorithm balancing typography scale, line-height, and padding without dropping user data.

---

### Phase 5: Charts, Tables & Visual Elements (PR 5)
- **Goal**: Skill visualizations, proficiency indicators, and accessible custom data tables with ATS degradation.
- **Files**:
  - `src/components/templates/elements/skill-visualizer.tsx`: Horizontal bars, dots, donut charts, and plain-text ATS fallback.
  - `src/components/templates/elements/custom-table.tsx`: Clean tabular layout for certifications, publications, and coursework.
  - Universal ATS degradation ensuring visual elements serialize to standard clean text in raw view.

---

### Phase 6: Export, Sharing, Embed & Print-Ready PDF (PR 6)
- **Goal**: Pixel-perfect Chromium server export (PDF/PNG/JPG), secure view-only share links, sandboxed embed snippets, and print margins.
- **Files**:
  - `src/app/api/export/pdf/route.ts` & `src/app/api/export/image/route.ts`: Headless Chromium export via Playwright / Puppeteer-core. Server-side watermark enforcement based on active entitlement.
  - `src/app/api/share/route.ts` & `src/app/share/[token]/page.tsx`: 128-bit unguessable tokens, optional password, expiry duration, and view counters.
  - `src/components/builder/export-modal.tsx`: Download dialog displaying pre-calculated page count and file size estimate.
  - `src/components/builder/embed-modal.tsx`: Sandboxed `<iframe>` generator with configurable domain allowlists.
- **Database**:
  - Migration `005_share_links.sql`: Table `public.share_links` (`id`, `resume_id`, `token_hash`, `password_hash`, `expires_at`, `view_count`, `created_at`).

---

### Phase 7: Platform Features & Cloud Management (PR 7)
- **Goal**: Robust autosave with conflict detection, cloud folder organization, trash with 30-day restore, and responsive mobile editor.
- **Files**:
  - `src/components/builder/resume-provider.tsx`: Debounced (800ms) save queue with version sequencing and merge conflict prompt.
  - `src/app/dashboard/resumes/page.tsx`: Folder organization, search, duplication, and 30-day trash recovery.
  - Responsive layouts optimized for 360px mobile (form/preview switch), 768px tablet, and 1280px+ desktop.

---

### Phase 8: Quality Assurance, Security Verification & Performance (PR 8)
- **Goal**: End-to-end automated test coverage, RLS cross-user isolation verification, and sub-50ms render performance.
- **Files**:
  - `tests/rls-isolation.test.ts`: Automated verification that user A cannot read or write user B's documents, style kits, or uploads.
  - `tests/template-validation.test.ts`: Strict schema test for all 24 `TemplateSpec` objects.
  - `tests/e2e/resume-flow.spec.ts`: Playwright full journey test (Create $\to$ Edit $\to$ AI Rewrite $\to$ Export $\to$ Share).
  - Performance audit verifying Lighthouse $\ge 90$ and sub-2s initial mobile paint.

---

## 3. Plan Sign-off Checklist

- [x] **Legal Compliance**: Zero Canva assets copied; all typography and icons verified under OFL, MIT, or ISC in `docs/ASSET_LICENSES.md`.
- [x] **Architecture**: Pure data `TemplateSpec` + single React renderer; headless Chromium export for pixel parity.
- [x] **Plan Gating**: Centralized in `src/lib/entitlements.ts` and enforced server-side.
- [x] **Immediate Bug Fixes**: Cover letter blank print and plan tier assignment queued for immediate resolution.
