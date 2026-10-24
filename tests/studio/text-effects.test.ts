import { describe, it, expect } from "vitest";
import {
  STUDIO_TEXT_EFFECT_PRESETS,
  computeTextEffectStyles,
  GOLD_FOIL_TEXTURE_DATA_URI,
  CHROME_TEXTURE_DATA_URI,
} from "@/lib/studio/text-effects";
import { textElementSchema, TEXT_EFFECT_TYPES } from "@/lib/schemas/studio";

describe("Studio Text Effects & Styles Architecture", () => {
  it("defines all 12 curated text effect presets in exact order", () => {
    expect(STUDIO_TEXT_EFFECT_PRESETS.length).toBe(12);

    const expectedNames = [
      "The Glitch Effect",
      "The Curved Arch",
      "The Neon Glow",
      "The Duotone Shadow",
      "Typewriter Style",
      "The Outline / Hollow Look",
      "The Splice Effect",
      "Text Masking",
      "The Gradient Text Shift",
      "The Magic Morph",
      "The Echo Visual",
      "The Background Ribbon",
    ];

    STUDIO_TEXT_EFFECT_PRESETS.forEach((preset, idx) => {
      expect(preset.number).toBe(idx + 1);
      expect(preset.name).toBe(expectedNames[idx]);
      expect(preset.tagline).toBeTruthy();
      expect(preset.howToDo).toBeTruthy();
      expect(preset.howToDo.length).toBeGreaterThan(20);
    });
  });

  it("contains all 13 text effect type values in TEXT_EFFECT_TYPES schema", () => {
    expect(TEXT_EFFECT_TYPES).toContain("none");
    expect(TEXT_EFFECT_TYPES).toContain("glitch");
    expect(TEXT_EFFECT_TYPES).toContain("curve");
    expect(TEXT_EFFECT_TYPES).toContain("neon");
    expect(TEXT_EFFECT_TYPES).toContain("duotone");
    expect(TEXT_EFFECT_TYPES).toContain("typewriter");
    expect(TEXT_EFFECT_TYPES).toContain("hollow");
    expect(TEXT_EFFECT_TYPES).toContain("splice");
    expect(TEXT_EFFECT_TYPES).toContain("mask");
    expect(TEXT_EFFECT_TYPES).toContain("gradient");
    expect(TEXT_EFFECT_TYPES).toContain("magic-morph");
    expect(TEXT_EFFECT_TYPES).toContain("echo");
    expect(TEXT_EFFECT_TYPES).toContain("background");
  });

  it("ensures every text effect preset creates a schema-valid StudioElement", () => {
    for (const preset of STUDIO_TEXT_EFFECT_PRESETS) {
      const el = preset.createElement("TEST TEXT", 150, 200, 3);
      expect(el.id).toBeTruthy();
      expect(el.type).toBe("text");
      expect(el.x).toBe(150);
      expect(el.y).toBe(200);
      expect(el.zIndex).toBe(3);
      expect(el.content).toBe("TEST TEXT");

      // Validate through Zod textElementSchema
      const validated = textElementSchema.safeParse(el);
      expect(validated.success, `Element for ${preset.name} must be valid Zod schema`).toBe(true);
    }
  });

  it("computes glitch effect CSS textShadow correctly", () => {
    const glitchPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "glitch")!;
    const el = glitchPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.textShadow).toContain("4px 0 0 #FF007F");
    expect(style.textShadow).toContain("-4px 0 0 #00FFFF");
  });

  it("computes neon glow effect CSS radiance correctly", () => {
    const neonPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "neon")!;
    const el = neonPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.color).toBe("#FFFFFF");
    expect(style.textShadow).toContain("0 0 8px #FFFFFF");
    expect(style.textShadow).toContain("#00F0FF");
  });

  it("computes duotone sharp pop-art shadow correctly", () => {
    const duotonePreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "duotone")!;
    const el = duotonePreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.textShadow).toBe("-4px -4px 0px #FF007F");
  });

  it("computes hollow wireframe outline stroke correctly", () => {
    const hollowPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "hollow")!;
    const el = hollowPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.color).toBe("transparent");
    expect(style.WebkitTextStroke).toContain("2px");
  });

  it("computes splice outline and offset drop shadow correctly", () => {
    const splicePreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "splice")!;
    const el = splicePreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.color).toBe("transparent");
    expect(style.WebkitTextStroke).toContain("2px");
    expect(style.textShadow).toBe("4px 4px 0px #E07A5F");
  });

  it("computes echo multi-layer trailing shadows correctly", () => {
    const echoPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "echo")!;
    const el = echoPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.textShadow).toContain("4px 0px 0px");
    expect(style.textShadow).toContain("8px 0px 0px");
    expect(style.textShadow).toContain("12px 0px 0px");
  });

  it("computes gradient text shift with linear-gradient background clip", () => {
    const gradientPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "gradient")!;
    const el = gradientPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.backgroundImage).toContain("linear-gradient(90deg");
    expect(style.backgroundImage).toContain("#FF71CE");
    expect(style.WebkitBackgroundClip).toBe("text");
  });

  it("computes text masking with gold foil texture data URI", () => {
    const maskPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "mask")!;
    const el = maskPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.backgroundImage).toContain(GOLD_FOIL_TEXTURE_DATA_URI);
    expect(style.WebkitBackgroundClip).toBe("text");
  });

  it("computes magic morph 3D chrome metallic texture correctly", () => {
    expect(CHROME_TEXTURE_DATA_URI).toContain("data:image/svg+xml");
    const morphPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "magic-morph")!;
    const el = morphPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.backgroundImage).toContain("linear-gradient(135deg");
    expect(style.WebkitBackgroundClip).toBe("text");
    expect(style.textShadow).toContain("rgba(0,0,0,0.3)");
  });

  it("computes background ribbon block with padding and roundness", () => {
    const bgPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "background")!;
    const el = bgPreset.createElement();
    const style = computeTextEffectStyles(el);
    expect(style.backgroundColor).toBe("#ECEE81");
    expect(style.borderRadius).toBe("10px");
    expect(style.display).toBe("inline-block");
  });

  it("validates typewriter animation preset metadata", () => {
    const typewriterPreset = STUDIO_TEXT_EFFECT_PRESETS.find((p) => p.id === "typewriter")!;
    const el = typewriterPreset.createElement();
    expect(el.animationType).toBe("typewriter");
    expect(el.animationSpeed).toBe(2);
    expect(el.animationMode).toBe("character");
  });
});
