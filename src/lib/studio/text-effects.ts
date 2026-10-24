import type { StudioElement, TextElement, TextEffectType } from "@/lib/schemas/studio";

export interface StudioTextEffectPreset {
  id: string;
  number: number;
  name: string;
  category: "Built-in" | "Layering Hack" | "Animation Effect" | "Frame Method" | "AI Texture";
  badge: string;
  tagline: string;
  howToDo: string;
  sampleText: string;
  defaultColor: string;
  defaultFontSize: number;
  defaultFontFamily: string;
  effectType: TextEffectType;
  effectOptions?: {
    glitchShift?: "pink-cyan" | "red-blue";
    glitchIntensity?: number;
    curveAngle?: number;
    neonIntensity?: number;
    neonColor?: string;
    duotoneColor?: string;
    duotoneOffsetX?: number;
    duotoneOffsetY?: number;
    hollowThickness?: number;
    spliceThickness?: number;
    spliceColor?: string;
    spliceOffsetX?: number;
    spliceOffsetY?: number;
    maskImage?: string;
    gradientColors?: string[];
    gradientAngle?: number;
    morphTexture?: "chrome" | "gold-foil" | "wood" | "fabric" | "water" | "plastic";
    echoOffset?: number;
    echoDirection?: "left" | "right" | "up" | "down";
    echoColor?: string;
    backgroundRibbonColor?: string;
    backgroundRibbonRoundness?: number;
    backgroundRibbonSpread?: number;
    backgroundRibbonOpacity?: number;
  };
  animationType?: "none" | "typewriter" | "fade" | "slide" | "rise";
  animationSpeed?: number;
  animationMode?: "character" | "word";
  createElement: (content?: string, x?: number, y?: number, zIndex?: number) => TextElement;
}

// Reusable Gold Foil Shimmer SVG Data-URI for Text Masking
export const GOLD_FOIL_TEXTURE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BF953F"/>
      <stop offset="25%" stop-color="#FCF6BA"/>
      <stop offset="50%" stop-color="#B38728"/>
      <stop offset="75%" stop-color="#FBF5B7"/>
      <stop offset="100%" stop-color="#AA771C"/>
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#gold)"/>
  <circle cx="150" cy="150" r="120" fill="#FFE599" opacity="0.4"/>
  <circle cx="80" cy="80" r="50" fill="#FFF2CC" opacity="0.5"/>
</svg>
`.trim())}`;

// Chrome 3D Metallic Gradient Data-URI for Magic Morph
export const CHROME_TEXTURE_DATA_URI = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
  <defs>
    <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2c3e50"/>
      <stop offset="20%" stop-color="#bdc3c7"/>
      <stop offset="40%" stop-color="#ecf0f1"/>
      <stop offset="60%" stop-color="#7f8c8d"/>
      <stop offset="80%" stop-color="#bdc3c7"/>
      <stop offset="100%" stop-color="#2c3e50"/>
    </linearGradient>
  </defs>
  <rect width="300" height="300" fill="url(#chrome)"/>
</svg>
`.trim())}`;

export const STUDIO_TEXT_EFFECT_PRESETS: StudioTextEffectPreset[] = [
  // 1. The Glitch Effect (Built-in)
  {
    id: "glitch",
    number: 1,
    name: "The Glitch Effect",
    category: "Built-in",
    badge: "Built-in",
    tagline: "Gives your text a digital, retro-futuristic, or sci-fi distortion wave.",
    howToDo:
      "Select your text, click Effects in the top menu, and choose Glitch. You can adjust the offset intensity and toggle between neon pink/cyan or red/blue color shifts.",
    sampleText: "CYBER GLITCH",
    defaultColor: "#FFFFFF",
    defaultFontSize: 44,
    defaultFontFamily: "Space Grotesk",
    effectType: "glitch",
    effectOptions: {
      glitchShift: "pink-cyan",
      glitchIntensity: 4,
    },
    createElement: (content = "CYBER GLITCH", x = 120, y = 140, zIndex = 1) => ({
      id: `text-glitch-${Date.now()}`,
      name: "Glitch Text",
      type: "text",
      content,
      x,
      y,
      width: 440,
      height: 70,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 44,
      fontFamily: "Space Grotesk",
      fontWeight: 800,
      color: "#FFFFFF",
      align: "center",
      letterSpacing: 2,
      effectType: "glitch",
      effectOptions: {
        glitchShift: "pink-cyan",
        glitchIntensity: 4,
      },
    }),
  },

  // 2. The Curved Arch (Built-in)
  {
    id: "curve",
    number: 2,
    name: "The Curved Arch",
    category: "Built-in",
    badge: "Built-in",
    tagline:
      "Perfect for badges, retro layouts, stickers, or wrapping text around circular elements.",
    howToDo:
      "Go to Effects, look under the Shape section at the bottom, and select Curve. Use the slider to adjust the bend from a gentle wave to a full 360-degree circle.",
    sampleText: "• OFFICIAL EST. 2026 XENVRA STUDIO •",
    defaultColor: "#5A4032",
    defaultFontSize: 28,
    defaultFontFamily: "Montserrat",
    effectType: "curve",
    effectOptions: {
      curveAngle: 65,
    },
    createElement: (
      content = "• OFFICIAL EST. 2026 XENVRA STUDIO •",
      x = 120,
      y = 140,
      zIndex = 1
    ) => ({
      id: `text-curve-${Date.now()}`,
      name: "Curved Arch Text",
      type: "text",
      content,
      x,
      y,
      width: 480,
      height: 120,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 28,
      fontFamily: "Montserrat",
      fontWeight: 700,
      color: "#5A4032",
      align: "center",
      letterSpacing: 3,
      uppercase: true,
      effectType: "curve",
      effectOptions: {
        curveAngle: 65,
      },
    }),
  },

  // 3. The Neon Glow (Built-in)
  {
    id: "neon",
    number: 3,
    name: "The Neon Glow",
    category: "Built-in",
    badge: "Built-in",
    tagline:
      "Transforms basic text into a vibrant, glowing light tube ideal for dark backgrounds or nightlife themes.",
    howToDo:
      "Go to Effects and select Neon. Turn up the intensity slider to max to increase the background glow radiance, and use a bright pastel color for the best results.",
    sampleText: "NEON NIGHTS",
    defaultColor: "#FFFFFF",
    defaultFontSize: 46,
    defaultFontFamily: "Bebas Neue",
    effectType: "neon",
    effectOptions: {
      neonIntensity: 8,
      neonColor: "#00F0FF",
    },
    createElement: (content = "NEON NIGHTS", x = 120, y = 140, zIndex = 1) => ({
      id: `text-neon-${Date.now()}`,
      name: "Neon Glow Text",
      type: "text",
      content,
      x,
      y,
      width: 420,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 46,
      fontFamily: "Bebas Neue",
      fontWeight: 400,
      color: "#FFFFFF",
      align: "center",
      letterSpacing: 3,
      effectType: "neon",
      effectOptions: {
        neonIntensity: 8,
        neonColor: "#00F0FF",
      },
    }),
  },

  // 4. The Duotone Shadow (Layering Hack)
  {
    id: "duotone",
    number: 4,
    name: "The Duotone Shadow",
    category: "Layering Hack",
    badge: "Layering Hack",
    tagline:
      "Creates a vibrant, two-tone pop-art drop shadow that is much sharper than standard blur shadows.",
    howToDo:
      "Type your text in a bright color. Duplicate it, change the copy's color to a contrasting shade (like black, dark blue, or hot pink), click Position, and send it backward. Nudge it slightly up and to the left.",
    sampleText: "POP ART RETRO",
    defaultColor: "#FFE600",
    defaultFontSize: 42,
    defaultFontFamily: "Plus Jakarta Sans",
    effectType: "duotone",
    effectOptions: {
      duotoneColor: "#FF007F",
      duotoneOffsetX: -4,
      duotoneOffsetY: -4,
    },
    createElement: (content = "POP ART RETRO", x = 120, y = 140, zIndex = 1) => ({
      id: `text-duotone-${Date.now()}`,
      name: "Duotone Pop-Art Text",
      type: "text",
      content,
      x,
      y,
      width: 440,
      height: 75,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 42,
      fontFamily: "Plus Jakarta Sans",
      fontWeight: 900,
      color: "#FFE600",
      align: "center",
      letterSpacing: 1,
      effectType: "duotone",
      effectOptions: {
        duotoneColor: "#FF007F",
        duotoneOffsetX: -4,
        duotoneOffsetY: -4,
      },
    }),
  },

  // 5. Typewriter Style (Animation Effect)
  {
    id: "typewriter",
    number: 5,
    name: "Typewriter Style",
    category: "Animation Effect",
    badge: "Animation",
    tagline:
      "Makes your text reveal itself dynamically letter-by-letter, perfect for video presentations or reels.",
    howToDo:
      "Click on your text box, select Animate from the top panel, and choose Typewriter. You can adjust the speed and choose whether it animates character-by-character or word-by-word.",
    sampleText: "Welcome to the future of design...",
    defaultColor: "#241915",
    defaultFontSize: 24,
    defaultFontFamily: "JetBrains Mono",
    effectType: "typewriter",
    animationType: "typewriter",
    animationSpeed: 2,
    animationMode: "character",
    createElement: (
      content = "Welcome to the future of design...",
      x = 120,
      y = 140,
      zIndex = 1
    ) => ({
      id: `text-typewriter-${Date.now()}`,
      name: "Typewriter Text",
      type: "text",
      content,
      x,
      y,
      width: 500,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 24,
      fontFamily: "JetBrains Mono",
      fontWeight: 600,
      color: "#241915",
      align: "left",
      effectType: "typewriter",
      animationType: "typewriter",
      animationSpeed: 2,
      animationMode: "character",
    }),
  },

  // 6. The Outline / Hollow Look (Built-in)
  {
    id: "hollow",
    number: 6,
    name: "The Outline / Hollow Look",
    category: "Built-in",
    badge: "Built-in",
    tagline:
      "Strips away the center fill of your font, leaving a clean, minimalist wireframe outline.",
    howToDo:
      "Go to Effects and click Hollow. Use the thickness slider to make the outline razor-thin for a luxury vibe or chunky for a streetwear aesthetic.",
    sampleText: "MINIMAL HOLLOW",
    defaultColor: "#5A4032",
    defaultFontSize: 44,
    defaultFontFamily: "Oswald",
    effectType: "hollow",
    effectOptions: {
      hollowThickness: 2,
    },
    createElement: (content = "MINIMAL HOLLOW", x = 120, y = 140, zIndex = 1) => ({
      id: `text-hollow-${Date.now()}`,
      name: "Hollow Outline Text",
      type: "text",
      content,
      x,
      y,
      width: 440,
      height: 70,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 44,
      fontFamily: "Oswald",
      fontWeight: 700,
      color: "#5A4032",
      align: "center",
      letterSpacing: 3,
      effectType: "hollow",
      effectOptions: {
        hollowThickness: 2,
      },
    }),
  },

  // 7. The Splice Effect (Built-in)
  {
    id: "splice",
    number: 7,
    name: "The Splice Effect",
    category: "Built-in",
    badge: "Built-in",
    tagline:
      "Combines a hollow outline text with a solid color drop shadow that is purposefully offset.",
    howToDo:
      "Go to Effects and click Splice. You can change both the thickness of the outline and the color of the offset internal shadow to create a fun, comic-book style.",
    sampleText: "SPLICE COMIC",
    defaultColor: "#241915",
    defaultFontSize: 44,
    defaultFontFamily: "Plus Jakarta Sans",
    effectType: "splice",
    effectOptions: {
      spliceThickness: 2,
      spliceColor: "#E07A5F",
      spliceOffsetX: 4,
      spliceOffsetY: 4,
    },
    createElement: (content = "SPLICE COMIC", x = 120, y = 140, zIndex = 1) => ({
      id: `text-splice-${Date.now()}`,
      name: "Splice Effect Text",
      type: "text",
      content,
      x,
      y,
      width: 440,
      height: 75,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 44,
      fontFamily: "Plus Jakarta Sans",
      fontWeight: 900,
      color: "#241915",
      align: "center",
      letterSpacing: 2,
      effectType: "splice",
      effectOptions: {
        spliceThickness: 2,
        spliceColor: "#E07A5F",
        spliceOffsetX: 4,
        spliceOffsetY: 4,
      },
    }),
  },

  // 8. Text Masking (Frame Method)
  {
    id: "mask",
    number: 8,
    name: "Text Masking",
    category: "Frame Method",
    badge: "Frame Method",
    tagline:
      "Drops a living image, moving video, or texture (like gold foil or glitter) directly inside your letters.",
    howToDo:
      "Go to Elements, scroll down to Frames, and click See All. Search for 'letter' frames. Drag individual letter frames onto your canvas to spell your word, then drop any photo or video right into them.",
    sampleText: "GOLD LUXURY",
    defaultColor: "#AA771C",
    defaultFontSize: 46,
    defaultFontFamily: "Playfair Display",
    effectType: "mask",
    effectOptions: {
      maskImage: GOLD_FOIL_TEXTURE_DATA_URI,
    },
    createElement: (content = "GOLD LUXURY", x = 120, y = 140, zIndex = 1) => ({
      id: `text-mask-${Date.now()}`,
      name: "Text Masking (Gold Foil)",
      type: "text",
      content,
      x,
      y,
      width: 440,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 46,
      fontFamily: "Playfair Display",
      fontWeight: 900,
      color: "#AA771C",
      align: "center",
      letterSpacing: 2,
      effectType: "mask",
      effectOptions: {
        maskImage: GOLD_FOIL_TEXTURE_DATA_URI,
      },
    }),
  },

  // 9. The Gradient Text Shift (Built-in)
  {
    id: "gradient",
    number: 9,
    name: "The Gradient Text Shift",
    category: "Built-in",
    badge: "Built-in",
    tagline:
      "Blends two or three colors seamlessly across your text for a modern, sleek tech or lifestyle vibe.",
    howToDo:
      "Open the Color panel for your text. Under the solid colors, look for the Gradient section. Select a preset or click the '+' button to add your own custom hex codes and change the gradient angle.",
    sampleText: "GRADIENT SHIFT",
    defaultColor: "#FF71CE",
    defaultFontSize: 44,
    defaultFontFamily: "Space Grotesk",
    effectType: "gradient",
    effectOptions: {
      gradientColors: ["#FF71CE", "#01CDFE", "#05FFA1"],
      gradientAngle: 90,
    },
    createElement: (content = "GRADIENT SHIFT", x = 120, y = 140, zIndex = 1) => ({
      id: `text-gradient-${Date.now()}`,
      name: "Gradient Text Shift",
      type: "text",
      content,
      x,
      y,
      width: 460,
      height: 75,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 44,
      fontFamily: "Space Grotesk",
      fontWeight: 800,
      color: "#FF71CE",
      align: "center",
      letterSpacing: 1,
      effectType: "gradient",
      effectOptions: {
        gradientColors: ["#FF71CE", "#01CDFE", "#05FFA1"],
        gradientAngle: 90,
      },
    }),
  },

  // 10. The Magic Morph (AI Texture)
  {
    id: "magic-morph",
    number: 10,
    name: "The Magic Morph",
    category: "AI Texture",
    badge: "AI Texture",
    tagline:
      "Uses Canva's native AI to wrap your text in hyper-realistic 3D textures like chrome, wood, fabric, or water.",
    howToDo:
      "Go to the left sidebar, click Apps, and open Magic Morph. Select your text box, type a highly visual prompt (e.g., 'shiny gold foil balloon text' or 'red glossy plastic'), and click generate.",
    sampleText: "3D CHROME AI",
    defaultColor: "#CBD5E1",
    defaultFontSize: 44,
    defaultFontFamily: "Montserrat",
    effectType: "magic-morph",
    effectOptions: {
      morphTexture: "chrome",
    },
    createElement: (content = "3D CHROME AI", x = 120, y = 140, zIndex = 1) => ({
      id: `text-morph-${Date.now()}`,
      name: "Magic Morph 3D Chrome",
      type: "text",
      content,
      x,
      y,
      width: 440,
      height: 75,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 44,
      fontFamily: "Montserrat",
      fontWeight: 900,
      color: "#CBD5E1",
      align: "center",
      letterSpacing: 2,
      effectType: "magic-morph",
      effectOptions: {
        morphTexture: "chrome",
      },
    }),
  },

  // 11. The Echo Visual (Built-in)
  {
    id: "echo",
    number: 11,
    name: "The Echo Visual",
    category: "Built-in",
    badge: "Built-in",
    tagline:
      "Creates a trailing, multi-layered echo effect that adds a sense of motion or music to your text.",
    howToDo:
      "Select your text, hit Effects, and choose Echo. Adjust the offset direction and distance to create a staggered, triple-layered repetition look.",
    sampleText: "ECHO MOTION",
    defaultColor: "#5A4032",
    defaultFontSize: 44,
    defaultFontFamily: "Poppins",
    effectType: "echo",
    effectOptions: {
      echoOffset: 4,
      echoDirection: "right",
      echoColor: "#C9CCD1",
    },
    createElement: (content = "ECHO MOTION", x = 120, y = 140, zIndex = 1) => ({
      id: `text-echo-${Date.now()}`,
      name: "Echo Visual Text",
      type: "text",
      content,
      x,
      y,
      width: 440,
      height: 80,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 44,
      fontFamily: "Poppins",
      fontWeight: 800,
      color: "#5A4032",
      align: "center",
      letterSpacing: 2,
      effectType: "echo",
      effectOptions: {
        echoOffset: 4,
        echoDirection: "right",
        echoColor: "#C9CCD1",
      },
    }),
  },

  // 12. The Background Ribbon (Built-in)
  {
    id: "background",
    number: 12,
    name: "The Background Ribbon",
    category: "Built-in",
    badge: "Built-in",
    tagline:
      "Adds a solid, perfectly fitted rectangular block behind your text, ensuring absolute readability over complex photos.",
    howToDo:
      "Go to Effects and choose Background. You can customize the background block's roundness, spread (how far it extends past the letters), transparency, and color.",
    sampleText: "EDITORIAL HIGHLIGHT",
    defaultColor: "#241915",
    defaultFontSize: 28,
    defaultFontFamily: "Inter",
    effectType: "background",
    effectOptions: {
      backgroundRibbonColor: "#ECEE81",
      backgroundRibbonRoundness: 10,
      backgroundRibbonSpread: 14,
      backgroundRibbonOpacity: 0.95,
    },
    createElement: (content = "EDITORIAL HIGHLIGHT", x = 120, y = 140, zIndex = 1) => ({
      id: `text-bg-${Date.now()}`,
      name: "Background Ribbon Text",
      type: "text",
      content,
      x,
      y,
      width: 420,
      height: 60,
      rotation: 0,
      opacity: 1,
      zIndex,
      fontSize: 28,
      fontFamily: "Inter",
      fontWeight: 700,
      color: "#241915",
      align: "center",
      letterSpacing: 1,
      effectType: "background",
      effectOptions: {
        backgroundRibbonColor: "#ECEE81",
        backgroundRibbonRoundness: 10,
        backgroundRibbonSpread: 14,
        backgroundRibbonOpacity: 0.95,
      },
    }),
  },
];

/**
 * Computes exact inline CSS styles for text effects in canvas & presenter view
 */
export function computeTextEffectStyles(el: StudioElement): React.CSSProperties {
  if (el.type !== "text" || !el.effectType || el.effectType === "none") {
    return {};
  }

  const opts = el.effectOptions || {};

  switch (el.effectType) {
    case "glitch": {
      const intensity = opts.glitchIntensity || 4;
      const isRedBlue = opts.glitchShift === "red-blue";
      const c1 = isRedBlue ? "#FF0000" : "#FF007F";
      const c2 = isRedBlue ? "#0055FF" : "#00FFFF";
      return {
        textShadow: `${intensity}px 0 0 ${c1}, -${intensity}px 0 0 ${c2}`,
      };
    }

    case "neon": {
      const color = opts.neonColor || "#00F0FF";
      const intensity = opts.neonIntensity || 7;
      const r1 = Math.round(intensity * 1);
      const r2 = Math.round(intensity * 2);
      const r3 = Math.round(intensity * 3.5);
      const r4 = Math.round(intensity * 5);
      return {
        color: "#FFFFFF",
        textShadow: `0 0 ${r1}px #FFFFFF, 0 0 ${r2}px ${color}, 0 0 ${r3}px ${color}, 0 0 ${r4}px ${color}`,
      };
    }

    case "duotone": {
      const sColor = opts.duotoneColor || "#FF007F";
      const ox = opts.duotoneOffsetX !== undefined ? opts.duotoneOffsetX : -4;
      const oy = opts.duotoneOffsetY !== undefined ? opts.duotoneOffsetY : -4;
      return {
        textShadow: `${ox}px ${oy}px 0px ${sColor}`,
      };
    }

    case "hollow": {
      const thickness = opts.hollowThickness || 2;
      return {
        WebkitTextStroke: `${thickness}px ${el.color || "#241915"}`,
        color: "transparent",
      };
    }

    case "splice": {
      const thickness = opts.spliceThickness || 2;
      const shadowColor = opts.spliceColor || "#E07A5F";
      const ox = opts.spliceOffsetX !== undefined ? opts.spliceOffsetX : 4;
      const oy = opts.spliceOffsetY !== undefined ? opts.spliceOffsetY : 4;
      return {
        WebkitTextStroke: `${thickness}px ${el.color || "#241915"}`,
        color: "transparent",
        textShadow: `${ox}px ${oy}px 0px ${shadowColor}`,
      };
    }

    case "echo": {
      const offset = opts.echoOffset || 4;
      const dir = opts.echoDirection || "right";
      const baseShadowColor = opts.echoColor || "#8A8F98";
      const multX = dir === "left" ? -1 : dir === "right" ? 1 : 0;
      const multY = dir === "up" ? -1 : dir === "down" ? 1 : 0;
      const o1x = offset * 1 * multX;
      const o1y = offset * 1 * multY;
      const o2x = offset * 2 * multX;
      const o2y = offset * 2 * multY;
      const o3x = offset * 3 * multX;
      const o3y = offset * 3 * multY;
      return {
        textShadow: `${o1x}px ${o1y}px 0px ${baseShadowColor}88, ${o2x}px ${o2y}px 0px ${baseShadowColor}55, ${o3x}px ${o3y}px 0px ${baseShadowColor}22`,
      };
    }

    case "gradient": {
      const colors = opts.gradientColors || ["#FF71CE", "#01CDFE", "#05FFA1"];
      const angle = opts.gradientAngle !== undefined ? opts.gradientAngle : 90;
      const gradientString = `linear-gradient(${angle}deg, ${colors.join(", ")})`;
      return {
        backgroundImage: gradientString,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      };
    }

    case "mask": {
      const bgImage = opts.maskImage || GOLD_FOIL_TEXTURE_DATA_URI;
      return {
        backgroundImage: `url("${bgImage}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      };
    }

    case "magic-morph": {
      const texture = opts.morphTexture || "chrome";
      if (texture === "chrome") {
        return {
          backgroundImage: "linear-gradient(135deg, #111827 0%, #E2E8F0 25%, #FFFFFF 50%, #64748B 75%, #1E293B 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        };
      }
      if (texture === "gold-foil") {
        return {
          backgroundImage: `url("${GOLD_FOIL_TEXTURE_DATA_URI}")`,
          backgroundSize: "cover",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
        };
      }
      if (texture === "plastic") {
        return {
          backgroundImage: "linear-gradient(180deg, #FF6B6B 0%, #EE5253 60%, #FF9FF3 100%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          color: "transparent",
          textShadow: "0 4px 12px rgba(238, 82, 83, 0.4)",
        };
      }
      return {
        backgroundImage: "linear-gradient(135deg, #8E7F72 0%, #D5C7B7 50%, #5A4D43 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        color: "transparent",
      };
    }

    case "background": {
      const bgColor = opts.backgroundRibbonColor || "#ECEE81";
      const roundness = opts.backgroundRibbonRoundness !== undefined ? opts.backgroundRibbonRoundness : 8;
      const opacity = opts.backgroundRibbonOpacity !== undefined ? opts.backgroundRibbonOpacity : 0.95;
      return {
        backgroundColor: bgColor,
        borderRadius: `${roundness}px`,
        opacity,
        display: "inline-block",
        padding: "4px 14px",
      };
    }

    default:
      return {};
  }
}
