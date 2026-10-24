import { describe, it, expect } from "vitest";
import { ALL_PRESENTATION_DECKS } from "@/lib/templates/decks/presentation-decks";
import { ALL_GRAPHIC_TEMPLATES } from "@/lib/templates/graphics/multi-format-templates";
import {
  ALL_STUDIO_TEMPLATES,
  getStudioTemplateById,
  getStudioTemplatesByCategory,
} from "@/lib/templates/manifest";
import { studioDocumentSchema } from "@/lib/schemas/studio";

describe("Phase E: Studio Template Library", () => {
  describe("Presentation Decks (10 Decks × 10 Slides = 100 Slides)", () => {
    it("should have exactly 10 presentation decks", () => {
      expect(ALL_PRESENTATION_DECKS).toHaveLength(10);
    });

    it("every deck must have exactly 10 slides conforming to standard deck anatomy", () => {
      ALL_PRESENTATION_DECKS.forEach((deck) => {
        const doc = deck.getDoc("mocha");
        expect(doc.pages).toHaveLength(10);

        // Every slide must be 16:9 1920×1080
        doc.pages.forEach((page) => {
          expect(page.width).toBe(1920);
          expect(page.height).toBe(1080);
          expect(page.elements.length).toBeGreaterThan(0);
        });

        // Slide anatomy titles
        const slideNames = doc.pages.map((p) => p.name);
        expect(slideNames[0]).toContain("Cover");
        expect(slideNames[1]).toContain("Problem");
        expect(slideNames[2]).toContain("Solution");
        expect(slideNames[3]).toContain("Market");
        expect(slideNames[4]).toContain("Business Model");
        expect(slideNames[5]).toContain("Traction");
        expect(slideNames[6].includes("Strategy") || slideNames[6].includes("Go-To-Market")).toBe(true);
        expect(slideNames[7]).toContain("Team");
        expect(slideNames[8]).toContain("Roadmap");
        expect(slideNames[9]).toContain("Contact");
      });
    });

    it("every deck validates strictly against Zod studioDocumentSchema", () => {
      ALL_PRESENTATION_DECKS.forEach((deck) => {
        const doc = deck.getDoc("ice");
        const parseResult = studioDocumentSchema.safeParse(doc);
        expect(parseResult.success).toBe(true);
      });
    });

    it("theme switching generates valid documents for all 4 brand themes", () => {
      const themes: ("mocha" | "ice" | "lavender" | "charcoal")[] = [
        "mocha",
        "ice",
        "lavender",
        "charcoal",
      ];
      ALL_PRESENTATION_DECKS.forEach((deck) => {
        themes.forEach((theme) => {
          const doc = deck.getDoc(theme);
          expect(doc.pages).toHaveLength(10);
          expect(doc.pages[0].elements.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Multi-Format Graphic Templates (16 Templates)", () => {
    it("should have 16 multi-format templates", () => {
      expect(ALL_GRAPHIC_TEMPLATES).toHaveLength(16);
    });

    it("4 LinkedIn banners must have dimensions 1584×396", () => {
      const banners = ALL_GRAPHIC_TEMPLATES.filter((t) => t.kind === "banner");
      expect(banners).toHaveLength(4);
      banners.forEach((b) => {
        const page = b.doc.pages[0];
        expect(page.width).toBe(1584);
        expect(page.height).toBe(396);
      });
    });

    it("4 Certificates must have landscape A4 dimensions 1123×794", () => {
      const certs = ALL_GRAPHIC_TEMPLATES.filter((t) => t.kind === "certificate");
      expect(certs).toHaveLength(4);
      certs.forEach((c) => {
        const page = c.doc.pages[0];
        expect(page.width).toBe(1123);
        expect(page.height).toBe(794);
      });
    });

    it("4 Business Cards must have business card proportions 1050×600", () => {
      const cards = ALL_GRAPHIC_TEMPLATES.filter((t) => t.kind === "card");
      expect(cards).toHaveLength(4);
      cards.forEach((c) => {
        const page = c.doc.pages[0];
        expect(page.width).toBe(1050);
        expect(page.height).toBe(600);
      });
    });

    it("4 Cover Letters must have portrait A4 dimensions 794×1123", () => {
      const letters = ALL_GRAPHIC_TEMPLATES.filter((t) => t.kind === "cover_letter");
      expect(letters).toHaveLength(4);
      letters.forEach((l) => {
        const page = l.doc.pages[0];
        expect(page.width).toBe(794);
        expect(page.height).toBe(1123);
      });
    });

    it("all graphic templates validate strictly against Zod studioDocumentSchema", () => {
      ALL_GRAPHIC_TEMPLATES.forEach((tmpl) => {
        const parseResult = studioDocumentSchema.safeParse(tmpl.doc);
        expect(parseResult.success).toBe(true);
      });
    });
  });

  describe("Unified Template Manifest", () => {
    it("contains at least 36 total templates across all formats", () => {
      expect(ALL_STUDIO_TEMPLATES.length).toBeGreaterThanOrEqual(36);
    });

    it("resolves template by ID and slug", () => {
      const startup = getStudioTemplateById("deck-startup-pitch");
      expect(startup).toBeDefined();
      expect(startup?.title).toContain("Startup Pitch");

      const banner = getStudioTemplateById("banner-software-engineer");
      expect(banner).toBeDefined();
      expect(banner?.dimensions.width).toBe(1584);
    });

    it("filters templates accurately by category", () => {
      const presentations = getStudioTemplatesByCategory("Presentations");
      expect(presentations).toHaveLength(10);

      const resumes = getStudioTemplatesByCategory("Resumes");
      expect(resumes).toHaveLength(10);
    });
  });
});
