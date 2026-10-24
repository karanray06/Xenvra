import { describe, it, expect } from "vitest";
import {
  ALL_BRAND_PALETTE_CATEGORIES,
  ALL_BRAND_COLORS,
  DESATURATED_EDITORIAL,
  ACID_MUTED_PASTELS,
  BOTANICAL_EARTH,
  BRUTALIST_GRAYS,
  WARM_SOLAR,
  DEEP_COSMIC_NEUTRALS,
  CORE_BRAND_PALETTE,
  findBrandColor,
} from "@/lib/studio/brand-palettes";

describe("Brand Kit Palettes Architecture", () => {
  it("contains exactly 7 palette categories (1 signature + 6 curated editorial collections)", () => {
    expect(ALL_BRAND_PALETTE_CATEGORIES).toHaveLength(7);
  });

  it("contains exactly 59 total curated brand colors", () => {
    expect(ALL_BRAND_COLORS).toHaveLength(59);
  });

  it("every single color has a valid uppercase 6-digit hex code, title, and description", () => {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    ALL_BRAND_COLORS.forEach((color) => {
      expect(color.name.length).toBeGreaterThan(0);
      expect(color.hex).toMatch(hexRegex);
      expect(color.description.length).toBeGreaterThan(0);
    });
  });

  it("verifies Collection 1: Desaturated Editorial Tones (9 colors)", () => {
    expect(DESATURATED_EDITORIAL.colors).toHaveLength(9);
    const expected = [
      "#F7F4EF", // Quiet Linen
      "#E6DED4", // Muted Alabaster
      "#D5C7B7", // Parchment Silk
      "#C4B5A5", // Warm Greige
      "#A99A8C", // Driftwood Shadow
      "#8E7F72", // Tuscan Soil
      "#75675B", // Smoked Umber
      "#5A4D43", // Espresso Raw
      "#38302A", // Obsidian Earth
    ];
    expected.forEach((hex) => {
      const found = DESATURATED_EDITORIAL.colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
      expect(found).toBeDefined();
    });
  });

  it("verifies Collection 2: Acid & Muted Pastels (9 colors)", () => {
    expect(ACID_MUTED_PASTELS.colors).toHaveLength(9);
    const expected = [
      "#E3F2FD", // Ice Glacier
      "#D0E7D2", // Dewy Mint
      "#ECEE81", // Acid Citron
      "#F3D7CA", // Faded Peach
      "#FCDDB0", // Soft Apricot
      "#EAA7B5", // Dusty Petal
      "#D3B4E3", // Muted Lilac
      "#BBE1FA", // Powder Frost
      "#98DDCA", // Pale Sagebrush
    ];
    expected.forEach((hex) => {
      const found = ACID_MUTED_PASTELS.colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
      expect(found).toBeDefined();
    });
  });

  it("verifies Collection 3: Botanical & Earth Slates (9 colors)", () => {
    expect(BOTANICAL_EARTH.colors).toHaveLength(9);
    const expected = [
      "#EAE7DC", // Oat Dry
      "#D8C3A5", // Sand Dune
      "#8E9A86", // Silver Sage
      "#687964", // Moss Velvet
      "#4B5340", // Olive Slate
      "#E07A5F", // Terracotta Dust
      "#F4F1DE", // Warm Eggshell
      "#3D5A80", // Industrial Steel
      "#293241", // Deep Baltic
    ];
    expected.forEach((hex) => {
      const found = BOTANICAL_EARTH.colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
      expect(found).toBeDefined();
    });
  });

  it("verifies Collection 4: Brutalist Architectural Grays (9 colors)", () => {
    expect(BRUTALIST_GRAYS.colors).toHaveLength(9);
    const expected = [
      "#FAFAFA", // Gallery Stark
      "#F0F2F5", // Studio Concrete
      "#E5E7EB", // Anodized Aluminum
      "#D1D5DB", // Raw Zinc
      "#9CA3AF", // Smoked Platinum
      "#6B7280", // Basalt Shadow
      "#4B5563", // Cast Iron
      "#374151", // Charcoal Core
      "#1F2937", // Brutalist Ink
    ];
    expected.forEach((hex) => {
      const found = BRUTALIST_GRAYS.colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
      expect(found).toBeDefined();
    });
  });

  it("verifies Collection 5: Warm Solar Accents (9 colors)", () => {
    expect(WARM_SOLAR.colors).toHaveLength(9);
    const expected = [
      "#FFFDF6", // Solar Linen
      "#FFF2CC", // Pale Buttercream
      "#FFE599", // Warm Maize
      "#F1C232", // Muted Ochre
      "#E69138", // Burnt Sienna
      "#B45F06", // Raw Amber
      "#783F04", // Roasted Chestnut
      "#4C2600", // Dark Sepia
      "#261300", // Void Espresso
    ];
    expected.forEach((hex) => {
      const found = WARM_SOLAR.colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
      expect(found).toBeDefined();
    });
  });

  it("verifies Collection 6: Deep Cosmic Neutrals (9 colors)", () => {
    expect(DEEP_COSMIC_NEUTRALS.colors).toHaveLength(9);
    const expected = [
      "#1E1E24", // Midnight Onyx
      "#141115", // Obsidian Plum
      "#0B0C10", // Cyber Slate
      "#1F2833", // Deep Titanium
      "#0D1B2A", // Abyssal Blue
      "#1B263B", // Shadow Steel
      "#222222", // Flat Matte
      "#111111", // Absolute Minimal
      "#050505", // Pure Abyss
    ];
    expected.forEach((hex) => {
      const found = DEEP_COSMIC_NEUTRALS.colors.find((c) => c.hex.toUpperCase() === hex.toUpperCase());
      expect(found).toBeDefined();
    });
  });

  it("verifies Core Signature Brand Palette (5 colors)", () => {
    expect(CORE_BRAND_PALETTE.colors).toHaveLength(5);
  });

  it("lookup helper findBrandColor resolves accurately case-insensitively", () => {
    const citron = findBrandColor("#ecee81");
    expect(citron).toBeDefined();
    expect(citron?.name).toBe("Acid Citron");

    const abyss = findBrandColor("#050505");
    expect(abyss).toBeDefined();
    expect(abyss?.name).toBe("Pure Abyss");

    expect(findBrandColor("#ffffff00")).toBeUndefined();
  });
});
