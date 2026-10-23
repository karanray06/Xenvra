# Xenvra Brand Guide (v1)

Positioning: calm, premium, quietly confident. "Resumes, refined." Metallic neutrals + one warm anchor (mocha) + one soft accent (lavender). Not loud, not startup-orange.

## Colours

| Role | Name | Hex | Use |
|---|---|---|---|
| Brand 1 | Ice Silver | `#E6EEF4` | page tint, cards, light logo tile, empty states |
| Brand 2 | Mocha Brown | `#5A4032` | primary buttons, logo tile, headings, links |
| Brand 3 | Platinum Silver | `#C9CCD1` | borders, dividers, disabled, tagline |
| Brand 4 | Pale Lavender | `#DCD3F2` | highlights, badges (PRO), selected states, focus halo |

Rules
- Text is always mocha-ink (`#241915`) or mocha (`#5A4032`) — never lavender or platinum on white (fails contrast).
- Lavender is a fill, not a text colour. Text on lavender = mocha.
- Primary CTA: mocha background, ice-50 text. Secondary: white, platinum border, mocha text. Tertiary: lavender-100 fill.
- Ratio guide: ~60% white/ice, 25% platinum/neutral, 10% mocha, 5% lavender.
- Contrast checks: mocha `#5A4032` on ice `#E6EEF4` ≈ 8:1; on white ≈ 9:1 (AA/AAA for body text).

Resume template accent colours should come from this palette too (mocha, lavender-600 `#7B66B8`, slate-platinum `#8A8F98`) so exported resumes feel on-brand.

## Logo

Files in `logo/`:
- `xenvra-icon.svg` — primary mark (mocha tile, ice + lavender crossing strokes forming an X, platinum dot)
- `xenvra-icon-light.svg` — for dark/mocha backgrounds' inverse and light surfaces
- `xenvra-full.svg` — icon + wordmark + tagline lockup
- `xenvra-wordmark.svg` — wordmark only
- `icon-{16,32,48,180,192,512}.png` — favicon / PWA / apple-touch sizes; `xenvra-*.png` — raster previews

Concept: two strokes cross to make an X — one over, one under — like two edits layered on one page. The ice stroke sits on top (the "refined" version), lavender underneath (the draft).

Clear space: 0.5× tile width on all sides. Minimum size: icon 16 px, full lockup 120 px wide (drop the tagline under 200 px).
Don't: recolour strokes outside the palette, add gradients/shadows, stretch, or place the dark tile on mocha.

Wordmark note: the SVG wordmark uses live text (Plus Jakarta Sans → Inter → Arial fallback). Before wide distribution, open the SVG in Penpot/Figma/Inkscape and convert text to outlines so it never depends on installed fonts.

## Typography
- Display + UI: **Plus Jakarta Sans** (700 headings, 500/600 UI, 400 body) via `next/font/google` or self-hosted.
- Mono (code, IDs): Geist Mono.
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48. Headings tracking −0.02em. Body line-height 1.6.

## Shape, depth, motion
- Radius: 8 px inputs/buttons, 12–16 px cards, logo tile ≈ 23% of width.
- Shadows: soft, mocha-tinted (`0 8px 24px rgba(90,64,50,.10)`), never pure black.
- Motion: 150–250 ms ease-out; respect `prefers-reduced-motion`.

## Voice
Plain, direct, warm. Short sentences. No hype words ("revolutionary", "game-changing"). Never claim what the product doesn't do (e.g. don't promise AI features until they ship).
Tagline: **Resumes, refined.** Alt: "Your best story, formatted."

## Assets checklist for launch
- `app/icon.svg` (use `xenvra-icon.svg`), `app/apple-icon.png` (180), `public/icon-192.png`, `public/icon-512.png`, `manifest.webmanifest`
- OG image 1200×630: ice background, full lockup left, resume-mockup right (generate with `next/og`)
- Email header (600 px wide) using the full lockup on ice
- Social avatar: `icon-512.png`
