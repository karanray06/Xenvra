# Asset Licenses & Compliance Ledger

This document tracks all external open-source assets, fonts, icons, illustrations, and dependencies utilized in Xenvra to ensure 100% legal compliance and strict adherence to permissive open-source licenses.

---

## 1. Typography & Web Fonts

All fonts are open-source and served locally or via `next/font/google` (zero third-party tracking, zero runtime CDN dependencies).

| Font Family | Designer / Origin | License | Source / Link | Permitted Use |
|-------------|-------------------|---------|---------------|---------------|
| **Plus Jakarta Sans** | Tokotype (Gumpita Rahayu) | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | Free commercial & personal use, web embedding, bundling |
| **Inter** | Rasmus Andersson | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/Inter) | Free commercial & personal use, web embedding, bundling |
| **Roboto** | Christian Robertson | Apache License 2.0 | [Google Fonts](https://fonts.google.com/specimen/Roboto) | Free commercial & personal use, modification |
| **Merriweather** | Sorkin Type | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/Merriweather) | Free commercial & personal use, print & digital publishing |
| **Playfair Display** | Claus Eggers Sørensen | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/Playfair+Display) | Free commercial & personal use, editorial publishing |
| **Lora** | Cyreal | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/Lora) | Free commercial & personal use |
| **Outfit** | Outfit.io | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/Outfit) | Free commercial & personal use |
| **DM Sans** | Colophon Foundry, Jonny Pinhorn | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/DM+Sans) | Free commercial & personal use |
| **Space Grotesk** | Florian Karsten | SIL Open Font License 1.1 (OFL) | [Google Fonts](https://fonts.google.com/specimen/Space+Grotesk) | Free commercial & personal use |
| **Fira Code / JetBrains Mono** | Mozilla / JetBrains | OFL 1.1 / Apache 2.0 | [Google Fonts](https://fonts.google.com/specimen/Fira+Code) | Free commercial & personal use, code blocks |

---

## 2. Iconography & Vector Badges

All icons used across the resume builder, dashboard, and vector studio are permissively licensed with zero copyleft.

| Asset Library | Author | License | Source | Permitted Use |
|---------------|--------|---------|--------|---------------|
| **Lucide Icons** | Lucide Contributors | ISC License (MIT-equivalent) | [lucide.dev](https://lucide.dev) | Commercial and personal use, bundling, direct SVG inlining |
| **Phosphor Icons** | Tobias Fried & Helena Zhang | MIT License | [phosphoricons.com](https://phosphoricons.com) | Commercial & personal use, SVG manipulation |
| **Tabler Icons** | Paweł Kuna | MIT License | [tabler.io/icons](https://tabler.io/icons) | Commercial & personal use |

---

## 3. Vector Studio Shapes & Illustrations

- All geometric primitives (Rectangles, Circles, Dividers, Badges, Bounding Handles) are calculated and rendered mathematically via native SVG / HTML5 Canvas.
- No proprietary Canva layouts, templates, illustrations, or graphics are copied, traced, or mirrored.
- All template designs in Xenvra are original procedural compositions designed explicitly for high ATS parseability and clean A4 / Letter typography.

---

## 4. Software Libraries & Dependencies

| Package | Purpose | License |
|---------|---------|---------|
| `next` | React application framework | MIT |
| `react` / `react-dom` | UI foundation | MIT |
| `zod` | Schema validation | MIT |
| `@supabase/supabase-js` | Postgres client | MIT |
| `@supabase/ssr` | Next.js cookie-based Supabase authentication | MIT |
| `docx` | Microsoft Word document generation | MIT |
| `lucide-react` | Interface icons | ISC |
| `tailwindcss` | Utility styling | MIT |

---

## 5. Non-Negotiable Compliance Guardrails

1. **No Trademark Infringement**: No third-party corporate logos (Google, Apple, Microsoft, Canva, etc.) are embedded without authorization or implied endorsement.
2. **Honest Marketing**: No fabricated claims ("#1 Resume Builder", "Millions of Users"). All public counts represent actual platform statistics.
3. **No Copyleft Contamination**: AGPL, GPLv3, and CC-BY-SA assets are strictly excluded from runtime production bundles.
