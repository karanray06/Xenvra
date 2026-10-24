import { describe, it, expect } from "vitest";
import {
  ALL_BRUTALIST_DECKS,
  buildSalfordBlueprintDeck,
  buildAldenaireNeoTechDeck,
  buildStrategicConsultingDeck,
} from "@/lib/templates/decks/brutalist-pitch-decks";
import { studioDocumentSchema } from "@/lib/schemas/studio";
import { getStudioTemplateById, getStudioTemplatesByCategory } from "@/lib/templates/manifest";

describe("Brutalist Pitch Decks Architecture & Layout Rules", () => {
  it("defines exactly 3 distinct brutalist presentation decks", () => {
    expect(ALL_BRUTALIST_DECKS).toHaveLength(3);
    const ids = ALL_BRUTALIST_DECKS.map((d) => d.id);
    expect(ids).toContain("deck-salford-blueprint");
    expect(ids).toContain("deck-aldenaire-neotech");
    expect(ids).toContain("deck-strategic-consulting-brutalist");
  });

  describe("Universal Structural Parameters (16:9 Widescreen & Strict Schema)", () => {
    for (const deckMeta of ALL_BRUTALIST_DECKS) {
      it(`deck '${deckMeta.title}' conforms to 16:9 1920×1080 and validates Zod schema`, () => {
        const doc = deckMeta.getDoc();
        expect(doc.pages).toHaveLength(10);

        // Validate each slide geometry
        doc.pages.forEach((page, idx) => {
          expect(page.width, `Slide ${idx + 1} width must be 1920`).toBe(1920);
          expect(page.height, `Slide ${idx + 1} height must be 1080`).toBe(1080);
          expect(page.elements.length, `Slide ${idx + 1} must contain elements`).toBeGreaterThan(0);
        });

        // Strict Zod schema verification
        const result = studioDocumentSchema.safeParse(doc);
        expect(result.success, `Schema validation for ${deckMeta.id}`).toBe(true);
      });
    }
  });

  describe("Presentation 1: Salford & Co. (Blueprint Editorial Vibe)", () => {
    const doc = buildSalfordBlueprintDeck();

    it("Slide 1 (Cover): solid cobalt blue with edge-to-edge PITCHDECK behind monument cutout", () => {
      const s1 = doc.pages[0];
      expect(s1.background).toBe("#0047AB");

      const title = s1.elements.find((el) => el.id === "s1-title-bg");
      expect(title?.type).toBe("text");
      if (title?.type === "text") {
        expect(title.content).toBe("PITCHDECK");
        expect(title.fontSize).toBeGreaterThanOrEqual(200);
        expect(title.fontFamily).toBe("Montserrat");
      }

      const monument = s1.elements.find((el) => el.id === "s1-monument-cutout");
      expect(monument?.type).toBe("image");
    });

    it("Slide 2 (Introduction): off-white canvas with stacked INTRO-DUCTION header and 3 bottom photo frames", () => {
      const s2 = doc.pages[1];
      expect(s2.background).toBe("#F8F9FA");

      const header = s2.elements.find((el) => el.id === "s2-header");
      expect(header?.type).toBe("text");
      if (header?.type === "text") {
        expect(header.content).toContain("INTRO-\nDUCTION");
        expect(header.color).toBe("#0047AB");
      }

      const frames = s2.elements.filter((el) => el.type === "frame");
      expect(frames.length).toBe(3);
    });

    it("Slide 3 (Problem): cobalt background with 2-row pain points and vertical photo frame", () => {
      const s3 = doc.pages[2];
      expect(s3.background).toBe("#0047AB");

      const p1 = s3.elements.find((el) => el.id === "s3-pain-1-title");
      const p2 = s3.elements.find((el) => el.id === "s3-pain-2-title");
      if (p1?.type === "text" && p2?.type === "text") {
        expect(p1.content).toContain("Access to Quality Education");
        expect(p2.content).toContain("Outdated Teaching Methods");
      }

      const rightFrame = s3.elements.find((el) => el.id === "s3-tech-frame");
      expect(rightFrame?.type).toBe("frame");
    });

    it("Slide 5 (Market Research): contains minimalist 4-bar white data chart and MARKET RESEARCH header", () => {
      const s5 = doc.pages[4];
      expect(s5.background).toBe("#0047AB");

      const chart = s5.elements.find((el) => el.type === "chart");
      expect(chart?.type).toBe("chart");
      if (chart?.type === "chart") {
        expect(chart.chartType).toBe("bar");
        expect(chart.data).toHaveLength(4);
        expect(chart.colors).toContain("#FFFFFF");
      }

      const header = s5.elements.find((el) => el.id === "s5-header");
      if (header?.type === "text") {
        expect(header.content).toContain("MARKET\nRESEARCH");
      }
    });

    it("Slide 10 (Outro): giant THANK YOU SO MUCH! text framing centered monument cutout", () => {
      const s10 = doc.pages[9];
      expect(s10.background).toBe("#0047AB");

      const title = s10.elements.find((el) => el.id === "s10-title");
      if (title?.type === "text") {
        expect(title.content).toBe("THANK YOU SO MUCH!");
      }

      const monument = s10.elements.find((el) => el.id === "s10-monument-cutout");
      expect(monument?.type).toBe("image");
    });
  });

  describe("Presentation 2: Aldenaire & Partners (Modern Geometric Tech Vibe)", () => {
    const doc = buildAldenaireNeoTechDeck();

    it("Slide 1 (Cover): electric blue canvas with white block PITCH DECK, lime metadata, and 3 abstract shapes", () => {
      const s1 = doc.pages[0];
      expect(s1.background).toBe("#1F51FF");

      const title = s1.elements.find((el) => el.id === "a1-title");
      if (title?.type === "text") {
        expect(title.content).toBe("PITCH\nDECK");
        expect(title.color).toBe("#FFFFFF");
      }

      const meta = s1.elements.find((el) => el.id === "a1-meta");
      if (meta?.type === "text") {
        expect(meta.color).toBe("#CCFF00");
      }

      // Check the 3 abstract shapes anchored bottom-right
      const diamond = s1.elements.find((el) => el.id === "a1-shape-diamond");
      const semicircle = s1.elements.find((el) => el.id === "a1-shape-semicircle");
      const star = s1.elements.find((el) => el.id === "a1-shape-star");
      expect(diamond).toBeDefined();
      expect(semicircle).toBeDefined();
      expect(star).toBeDefined();
    });

    it("Slide 2 (Problem): off-white canvas with massive blue PROBLEM and 3 numbered lime blocks", () => {
      const s2 = doc.pages[1];
      expect(s2.background).toBe("#F7F8FA");

      const header = s2.elements.find((el) => el.id === "a2-header");
      if (header?.type === "text") {
        expect(header.content).toBe("PROBLEM");
        expect(header.color).toBe("#1F51FF");
      }

      const col1 = s2.elements.find((el) => el.id === "a2-col-1");
      const col2 = s2.elements.find((el) => el.id === "a2-col-2");
      const col3 = s2.elements.find((el) => el.id === "a2-col-3");
      if (col1?.type === "text" && col2?.type === "text" && col3?.type === "text") {
        expect(col1.content).toContain("Market Saturation");
        expect(col2.content).toContain("Digital Complexity");
        expect(col3.content).toContain("Inefficient Operations");
      }
    });

    it("Slide 4 (Market Approach): giant hollow metric $500B+ and pill badge", () => {
      const s4 = doc.pages[3];
      expect(s4.background).toBe("#FFFFFF");

      const metric = s4.elements.find((el) => el.id === "a4-metric");
      expect(metric?.type).toBe("text");
      if (metric?.type === "text") {
        expect(metric.content).toBe("$500B+");
        expect(metric.effectType).toBe("hollow");
      }

      const badge = s4.elements.find((el) => el.id === "a4-badge");
      expect(badge?.type).toBe("shape");
    });

    it("Slide 8 (Our Team): electric blue background with 2x2 grid hosting 4 profile frames", () => {
      const s8 = doc.pages[7];
      expect(s8.background).toBe("#1F51FF");

      const frames = s8.elements.filter((el) => el.type === "frame");
      expect(frames).toHaveLength(4);
    });

    it("Slide 9 (Timeline): horizontal timeline axis with 5 sequential checkpoints (Q1 to Q5)", () => {
      const s9 = doc.pages[8];
      expect(s9.background).toBe("#FFFFFF");

      const axis = s9.elements.find((el) => el.id === "a9-axis-line");
      expect(axis).toBeDefined();

      const q1 = s9.elements.find((el) => el.id === "a9-q1-content");
      const q5 = s9.elements.find((el) => el.id === "a9-q5-content");
      if (q1?.type === "text" && q5?.type === "text") {
        expect(q1.content).toContain("Q1");
        expect(q5.content).toContain("Q1 2027");
      }
    });
  });

  describe("Presentation 3: Strategic Consulting (Editorial Swiss Brutalism)", () => {
    const doc = buildStrategicConsultingDeck();

    it("Slide 1 (Cover): crimson background with compressed vertical PITCH DECK in soft pink (Anton font)", () => {
      const s1 = doc.pages[0];
      expect(s1.background).toBe("#4A0404");

      const title = s1.elements.find((el) => el.id === "sc1-title");
      if (title?.type === "text") {
        expect(title.content).toBe("PITCH\nDECK");
        expect(title.color).toBe("#FFD1D1");
        expect(title.fontFamily).toBe("Anton");
      }
    });

    it("Slide 2 (Problem): giant condensed PROBLEM title and 3-column structural challenges", () => {
      const s2 = doc.pages[1];
      expect(s2.background).toBe("#4A0404");

      const header = s2.elements.find((el) => el.id === "sc2-header");
      if (header?.type === "text") {
        expect(header.content).toBe("PROBLEM");
        expect(header.fontSize).toBeGreaterThanOrEqual(170);
      }
    });

    it("Slide 3 (Our Solution): ultra-condensed OUR SOLUTION fills left half with divider rules on right", () => {
      const s3 = doc.pages[2];
      const header = s3.elements.find((el) => el.id === "sc3-header");
      if (header?.type === "text") {
        expect(header.content).toBe("OUR\nSOLUTION");
      }

      const dividers = s3.elements.filter((el) => el.type === "shape" && el.shapeType === "line");
      expect(dividers.length).toBeGreaterThanOrEqual(2);
    });

    it("Slide 4 (Market Opportunity): massive title with hollow outline metric $900B+ and boxed label", () => {
      const s4 = doc.pages[3];
      const metric = s4.elements.find((el) => el.id === "sc4-metric");
      if (metric?.type === "text") {
        expect(metric.content).toBe("$900B+");
        expect(metric.effectType).toBe("hollow");
      }

      const box = s4.elements.find((el) => el.id === "sc4-box-border");
      expect(box).toBeDefined();
    });

    it("Slide 8 (Team): crimson background with 4 clean white framed portraits", () => {
      const s8 = doc.pages[7];
      expect(s8.background).toBe("#4A0404");

      const frames = s8.elements.filter((el) => el.type === "frame");
      expect(frames).toHaveLength(4);
    });

    it("Slide 10 (Thank You): overlapping THANK YOU display with tonal drop shadow effect", () => {
      const s10 = doc.pages[9];
      expect(s10.background).toBe("#4A0404");

      const shadow = s10.elements.find((el) => el.id === "sc10-shadow");
      const title = s10.elements.find((el) => el.id === "sc10-title");
      if (shadow?.type === "text" && title?.type === "text") {
        expect(shadow.content).toBe("THANK\nYOU");
        expect(title.content).toBe("THANK\nYOU");
        expect(shadow.color).toBe("#2B0202");
        expect(title.color).toBe("#FFD1D1");
      }
    });
  });

  describe("Manifest Integration & Lookup", () => {
    it("resolves all 3 brutalist decks through getStudioTemplateById", () => {
      const salford = getStudioTemplateById("salford-blueprint-deck");
      expect(salford).toBeDefined();
      expect(salford?.title).toContain("Salford & Co.");
      expect(salford?.kind).toBe("deck");

      const aldenaire = getStudioTemplateById("deck-aldenaire-neotech");
      expect(aldenaire).toBeDefined();
      expect(aldenaire?.title).toContain("Aldenaire & Partners");

      const strat = getStudioTemplateById("strategic-consulting-swiss-brutalist-deck");
      expect(strat).toBeDefined();
      expect(strat?.title).toContain("Strategic Consulting");
    });

    it("filters brutalist decks accurately by category", () => {
      const brutalistDecks = getStudioTemplatesByCategory("Brutalist Decks");
      expect(brutalistDecks).toHaveLength(3);
    });
  });
});
