import { describe, it, expect } from "vitest";
import {
  ELEMENT_CATEGORIES,
  STUDIO_ELEMENT_LIBRARY,
} from "@/lib/studio/element-library";

describe("Studio Element Library Architecture", () => {
  it("defines all 7 aesthetic element categories plus the All option", () => {
    expect(ELEMENT_CATEGORIES.length).toBe(8);
    const categoryIds = ELEMENT_CATEGORIES.map((c) => c.id);
    expect(categoryIds).toContain("all");
    expect(categoryIds).toContain("boho");
    expect(categoryIds).toContain("retro-y2k");
    expect(categoryIds).toContain("collage");
    expect(categoryIds).toContain("watercolor");
    expect(categoryIds).toContain("cosmic");
    expect(categoryIds).toContain("minimal-ui");
    expect(categoryIds).toContain("kawaii");
  });

  it("contains rich elements across every single category", () => {
    const requiredCategories = [
      "boho",
      "retro-y2k",
      "collage",
      "watercolor",
      "cosmic",
      "minimal-ui",
      "kawaii",
    ];

    for (const cat of requiredCategories) {
      const itemsInCat = STUDIO_ELEMENT_LIBRARY.filter((item) => item.category === cat);
      expect(
        itemsInCat.length,
        `Category ${cat} should contain elements`
      ).toBeGreaterThanOrEqual(10);
    }
  });

  it("includes all requested Canva set codes in the element library", () => {
    const requestedSets = [
      "set:nAFruCFP1M0",
      "set:nAFG28pZ3kU",
      "set:nAFFfD8v9k8",
      "set:nAFDeS-HskQ",
      "set:nAFF7T70l1M",
      "set:nAFEFX8RreE",
      "set:nAFK3X3Gz6E",
      "set:nAFFpC6_z0g",
      "set:nAFE6G4zX-M",
      "set:nAFO1X3K-6I",
    ];

    for (const setCode of requestedSets) {
      const found = STUDIO_ELEMENT_LIBRARY.some(
        (item) => item.name.includes(setCode) || item.tags.includes(setCode)
      );
      expect(found, `Element library should contain ${setCode}`).toBe(true);
    }
  });

  it("includes signature requested items like washi tape, polaroid, cassette, and eucalyptus", () => {
    const keywords = [
      "washi",
      "polaroid",
      "cassette",
      "vinyl",
      "eucalyptus",
      "terrazzo",
      "brush stroke",
      "astrology",
      "browser",
      "strawberry",
      "clouds",
    ];

    for (const kw of keywords) {
      const found = STUDIO_ELEMENT_LIBRARY.some(
        (item) =>
          item.name.toLowerCase().includes(kw) ||
          item.tags.some((t) => t.toLowerCase().includes(kw))
      );
      expect(found, `Element library should contain item matching '${kw}'`).toBe(true);
    }
  });

  it("ensures every element creates a valid StudioElement with coordinates and dimensions", () => {
    for (const item of STUDIO_ELEMENT_LIBRARY) {
      const element = item.createElement(120, 180, 5);
      expect(element.id).toBeTruthy();
      expect(element.x).toBe(120);
      expect(element.y).toBe(180);
      expect(element.width).toBe(item.width);
      expect(element.height).toBe(item.height);
      expect(element.zIndex).toBe(5);
      expect(["image", "frame", "shape"]).toContain(element.type);
    }
  });

  it("ensures all SVG previews are valid SVG strings", () => {
    for (const item of STUDIO_ELEMENT_LIBRARY) {
      expect(item.svgIcon.trim().startsWith("<svg")).toBe(true);
      expect(item.svgIcon.trim().endsWith("</svg>")).toBe(true);
      expect(item.svgIcon).toContain('xmlns="http://www.w3.org/2000/svg"');
    }
  });
});
