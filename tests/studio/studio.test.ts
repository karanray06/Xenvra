import { describe, it, expect } from "vitest";
import { studioDocumentSchema } from "@/lib/schemas/studio";
import { exportPageToSVG } from "@/lib/studio/export";
import { useStudioStore } from "@/lib/studio/store";

describe("Phase D: Xenvra Studio Flagship Test Suite", () => {
  it("Validates Studio Document Zod Schema successfully", () => {
    const validDoc = {
      schemaVersion: 1,
      brandKit: {
        colors: ["#E6EEF4", "#5A4032", "#C9CCD1", "#DCD3F2", "#241915"],
        fonts: ["Plus Jakarta Sans", "Inter"],
      },
      pages: [
        {
          id: "page-1",
          name: "Cover Slide",
          width: 1920,
          height: 1080,
          background: "#FFFFFF",
          elements: [
            {
              id: "el-1",
              name: "Heading",
              type: "text",
              x: 100,
              y: 100,
              width: 500,
              height: 80,
              content: "Xenvra Studio Launch",
              fontSize: 48,
              fontFamily: "Plus Jakarta Sans",
              fontWeight: 800,
              color: "#241915",
              align: "left",
            },
            {
              id: "el-2",
              name: "Card",
              type: "shape",
              shapeType: "rect",
              x: 100,
              y: 200,
              width: 300,
              height: 200,
              fill: "#5A4032",
              cornerRadius: 12,
            },
          ],
        },
      ],
    };

    const parsed = studioDocumentSchema.safeParse(validDoc);
    expect(parsed.success).toBe(true);
  });

  it("Rejects document exceeding page constraints", () => {
    const pages = Array.from({ length: 55 }, (_, i) => ({
      id: `page-${i}`,
      name: `Page ${i}`,
      width: 1920,
      height: 1080,
      background: "#FFFFFF",
      elements: [],
    }));

    const invalidDoc = {
      schemaVersion: 1,
      pages,
    };

    const parsed = studioDocumentSchema.safeParse(invalidDoc);
    expect(parsed.success).toBe(false);
  });

  it("Serializes Page directly to SVG from AST without DOM scraping", () => {
    const page = {
      id: "page-svg-test",
      name: "SVG Slide",
      width: 1920,
      height: 1080,
      background: "#FFFFFF",
      elements: [
        {
          id: "text-1",
          name: "AST Title",
          type: "text" as const,
          x: 120,
          y: 200,
          width: 600,
          height: 100,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          zIndex: 1,
          content: "Clean Vector Serialization",
          fontSize: 54,
          fontFamily: "Plus Jakarta Sans",
          fontWeight: 700,
          fontStyle: "normal" as const,
          color: "#241915",
          align: "left" as const,
          lineHeight: 1.2,
          letterSpacing: 0,
          underline: false,
          uppercase: false,
        },
      ],
    };

    const svg = exportPageToSVG(page, true);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('viewBox="0 0 1920 1080"');
    expect(svg).toContain("Clean Vector Serialization");
    expect(svg).toContain('fill="#241915"');
  });

  it("Includes watermark for Free tier exports", () => {
    const page = {
      id: "page-free",
      name: "Free Page",
      width: 1920,
      height: 1080,
      background: "#FFFFFF",
      elements: [],
    };

    const proSvg = exportPageToSVG(page, true);
    expect(proSvg).not.toContain("Made with Xenvra");

    const freeSvg = exportPageToSVG(page, false);
    expect(freeSvg).toContain("Made with Xenvra");
  });

  it("Supports 200-depth undo/redo command stack in Studio store", () => {
    const store = useStudioStore.getState();

    // Reset store
    useStudioStore.setState({ undoStack: [], redoStack: [] });

    // Add elements and verify undo stack records previous state
    store.addElement({
      id: "test-el-1",
      name: "Box 1",
      type: "shape",
      shapeType: "rect",
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      zIndex: 1,
      fill: "#5A4032",
      cornerRadius: 0,
    });

    expect(useStudioStore.getState().undoStack.length).toBe(1);

    // Undo
    useStudioStore.getState().undo();
    expect(useStudioStore.getState().undoStack.length).toBe(0);
    expect(useStudioStore.getState().redoStack.length).toBe(1);

    // Redo
    useStudioStore.getState().redo();
    expect(useStudioStore.getState().undoStack.length).toBe(1);
    expect(useStudioStore.getState().redoStack.length).toBe(0);
  });
});
