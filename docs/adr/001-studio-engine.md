# ADR 001: Xenvra Studio Canvas Engine & Architecture

**Date:** 2026-10-24  
**Status:** Accepted  
**Deciders:** Lead Full-Stack & Systems Engineer  
**Context:** Xenvra Studio Flagship Pivot (Phase D)

---

## 1. Context & Problem Statement

Xenvra is pivoting from a resume-only builder to **Xenvra Studio**: an interactive design studio for career and campus work (pitch decks, viva presentations, resumes, LinkedIn banners, certificates, posters, and business cards).

Key design requirements:
1. **Flawless Multi-Page & Multi-Artboard support**: seamless switching between 16:9 slides (1920×1080), A4/US Letter resumes (794×1123), LinkedIn banners (1584×396), etc.
2. **Text Fidelity & On-Canvas Editing**: native typographical crispness, subpixel anti-aliasing, Hindi/Bengali script support, double-click inline editing, and 100% extractable vector text for ATS-safe PDF exports.
3. **High Performance**: Smooth 60 FPS panning, zooming, and dragging with 300+ nodes on modern and mid-range devices.
4. **Export Integrity**: Direct export to **Vector PDF** (ATS readable), **Editable PPTX** (`pptxgenjs`), **Valid SVG** from the document AST, and **High-Res PNG** (1×/2×/4×).
5. **Modern React 19 Compatibility**: Zero peer-dependency conflicts with React 19.2 and Next.js 16.4.

---

## 2. Decision on Penpot

**Decision:** We do **not** copy or port Penpot's codebase into Xenvra.
- **Licensing Constraint:** Penpot is licensed under **MPL-2.0** (Mozilla Public License 2.0). Porting files directly imposes file-level copyleft requirements.
- **Architectural Incompatibility:** Penpot's backend is written in Clojure and depends on Docker/PostgreSQL/Redis microservices which cannot run inside Vercel's serverless edge runtime.
- **Adoption of Concepts:** We borrow Penpot and Figma's best interaction paradigms:
  - Document-tree state model (Pages → Artboards → Discriminated Elements).
  - Smart alignment guides (edges, centers, equal spacing).
  - Data-bound text fields linking structured career profile data to visual layout nodes.
  - Sanitized SVG import/export support so users can bring vector assets into Xenvra Studio.

---

## 3. Evaluated Canvas Engines

### Option A: `react-konva` / Konva.js (HTML5 2D Canvas)
- **Pros:** Fast 2D rendering, mature scene graph.
- **Cons:** Canvas text rendering lacks browser-native subpixel antialiasing and complex script shaping (e.g. Devanagari ligatures often render with kerning glitches without heavy WebAssembly text shaping engines like HarfBuzz). Inline text editing requires spawning floating DOM `<textarea>` overlays over canvas coordinates. Peer-dependency friction with React 19.

### Option B: Fabric.js v6
- **Pros:** Comprehensive vector object model, SVG import/export out of the box.
- **Cons:** Heavy bundle footprint (~350KB gzip), complex custom text-shaping layer, requires canvas sync hooks, server-side rendering complications on Next.js App Router.

### Option C: Hybrid Vector DOM/SVG Canvas Engine (Chosen Architecture)
- **Architecture:** 
  - The canvas viewport runs an interactive SVG/Vector surface with CSS hardware-accelerated transforms (`transform: translate3d(...) scale(...)`).
  - Text nodes render through native vector typography and SVG `<foreignObject>`/`<text>` elements, ensuring 100% native font rendering, perfect Hindi/Bengali glyph ligatures, and native accessibility.
  - Interactive transform handles (rotation, 8-point resize, snap guides) are rendered in a dedicated overlay plane.
  - State is driven by **Zustand** with an immutable 200-depth patch-based command stack (Undo/Redo).
  - Direct exporters:
    - **Vector PDF:** Uses `jspdf` / `pdf-lib` to emit true PDF text operators and vector paths (ATS-safe).
    - **PPTX:** Uses `pptxgenjs` to emit native PowerPoint text frames, shapes, and images.
    - **SVG:** Serialized directly from the Document JSON AST without DOM scraping.
    - **Raster (PNG/JPG):** Rendered off-screen via HTML5 Canvas rasterization at 1×, 2×, or 4× with optional Free-tier watermark.

---

## 4. Consequences

### Positive:
- **Zero React 19 / Turbopack Conflicts:** No canvas library monkey-patching or peer-dependency overrides required.
- **Crisp Typography:** Text is rendered using the browser's own font engine, honoring all 14 self-hosted Fontsource font families without text-blur or kerning flaws.
- **Multi-Format Export Fidelity:** Because the document is represented as a clean JSON AST, converting to PPTX slides, vector PDF, and clean SVG is deterministic and unit-testable.
- **Data Binding:** Two-way sync between structured resume data (`contact.fullName`, `experience[0].jobTitle`) and visual canvas nodes works with zero overhead.

### Mitigations:
- For very large element sets (>500 elements per page), viewport virtualization renders only active pages.
- Draggable smart guides and snap calculations run in pure memory matrix math to sustain 60 FPS.
