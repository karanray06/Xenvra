import { z } from "zod";

// ==============================================================================
// Xenvra Studio Document Schema & Discriminated Element Unions
// ==============================================================================

export const STUDIO_KINDS = [
  "resume",
  "deck",
  "cover_letter",
  "poster",
  "social",
  "card",
  "certificate",
  "banner",
  "custom",
] as const;

export type StudioKind = (typeof STUDIO_KINDS)[number];

// Standard dimensions in pixels (optimized for crisp screen display & vector scale)
export const ARTBOARD_PRESETS: Record<
  string,
  { name: string; width: number; height: number; kind: StudioKind; description: string }
> = {
  DECK_16_9: {
    name: "Presentation Slide (16:9)",
    width: 1920,
    height: 1080,
    kind: "deck",
    description: "Startup pitch decks, college projects & viva presentations",
  },
  DECK_4_3: {
    name: "Presentation Slide (4:3)",
    width: 1440,
    height: 1080,
    kind: "deck",
    description: "Standard projector & seminar presentations",
  },
  A4_RESUME: {
    name: "A4 Document / Resume",
    width: 794,
    height: 1123,
    kind: "resume",
    description: "ATS-friendly resumes, CVs & cover letters",
  },
  US_LETTER: {
    name: "US Letter Resume",
    width: 816,
    height: 1056,
    kind: "resume",
    description: "North American standard resume format",
  },
  LINKEDIN_BANNER: {
    name: "LinkedIn Banner",
    width: 1584,
    height: 396,
    kind: "banner",
    description: "Profile banner for personal branding & tech specialists",
  },
  INSTAGRAM_POST: {
    name: "Square Post (1:1)",
    width: 1080,
    height: 1080,
    kind: "social",
    description: "Social media announcement, hackathon shoutout",
  },
  INSTAGRAM_STORY: {
    name: "Mobile Story / Reel (9:16)",
    width: 1080,
    height: 1920,
    kind: "social",
    description: "Campus club announcements & event stories",
  },
  CERTIFICATE: {
    name: "Certificate of Merit (Landscape)",
    width: 1123,
    height: 794,
    kind: "certificate",
    description: "Hackathon winners, workshop completion & MUN credentials",
  },
  BUSINESS_CARD: {
    name: "Business Card",
    width: 1050,
    height: 600,
    kind: "card",
    description: "Networking cards with contact QR code",
  },
  A3_POSTER: {
    name: "Event Poster (A3)",
    width: 1123,
    height: 1587,
    kind: "poster",
    description: "Campus symposiums, hackathon posters & club announcements",
  },
};

// Base properties common to all visual elements
const baseElementSchema = z.object({
  id: z.string().min(1),
  name: z.string().default("Element"),
  x: z.number(),
  y: z.number(),
  width: z.number().min(1),
  height: z.number().min(1),
  rotation: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
  zIndex: z.number().optional(),
});

export const TEXT_EFFECT_TYPES = [
  "none",
  "glitch",
  "curve",
  "neon",
  "duotone",
  "typewriter",
  "hollow",
  "splice",
  "mask",
  "gradient",
  "magic-morph",
  "echo",
  "background",
] as const;

export type TextEffectType = (typeof TEXT_EFFECT_TYPES)[number];

// 1. Text Element
export const textElementSchema = baseElementSchema.extend({
  type: z.literal("text"),
  content: z.string().max(10000).default("Heading Text"),
  fontSize: z.number().min(6).max(200).default(24),
  fontFamily: z.string().default("Plus Jakarta Sans"),
  fontWeight: z.union([z.number(), z.string()]).default(400),
  fontStyle: z.enum(["normal", "italic"]).optional(),
  color: z.string().default("#241915"),
  align: z.enum(["left", "center", "right", "justify"]).optional(),
  lineHeight: z.number().min(0.5).max(3).optional(),
  letterSpacing: z.number().min(-5).max(20).optional(),
  underline: z.boolean().optional(),
  uppercase: z.boolean().optional(),
  // 12 Built-in Text Effects & Styling
  effectType: z.enum(TEXT_EFFECT_TYPES).optional(),
  effectOptions: z
    .object({
      glitchShift: z.enum(["pink-cyan", "red-blue"]).optional(),
      glitchIntensity: z.number().min(1).max(20).optional(),
      curveAngle: z.number().min(-360).max(360).optional(),
      neonIntensity: z.number().min(1).max(20).optional(),
      neonColor: z.string().optional(),
      duotoneColor: z.string().optional(),
      duotoneOffsetX: z.number().optional(),
      duotoneOffsetY: z.number().optional(),
      hollowThickness: z.number().min(1).max(20).optional(),
      spliceThickness: z.number().min(1).max(20).optional(),
      spliceColor: z.string().optional(),
      spliceOffsetX: z.number().optional(),
      spliceOffsetY: z.number().optional(),
      maskImage: z.string().optional(),
      gradientColors: z.array(z.string()).optional(),
      gradientAngle: z.number().optional(),
      morphTexture: z
        .enum(["chrome", "gold-foil", "wood", "fabric", "water", "plastic"])
        .optional(),
      echoOffset: z.number().optional(),
      echoDirection: z.enum(["left", "right", "up", "down"]).optional(),
      echoColor: z.string().optional(),
      backgroundRibbonColor: z.string().optional(),
      backgroundRibbonRoundness: z.number().optional(),
      backgroundRibbonSpread: z.number().optional(),
      backgroundRibbonOpacity: z.number().optional(),
    })
    .optional(),
  // Animation Effects
  animationType: z.enum(["none", "typewriter", "fade", "slide", "rise"]).optional(),
  animationSpeed: z.number().optional(),
  animationMode: z.enum(["character", "word"]).optional(),
  // Data-binding to structured resume/profile field e.g. "contact.fullName"
  dataBinding: z.string().optional(),
  bind: z.string().optional(),
});

// 2. Shape Element
export const shapeElementSchema = baseElementSchema.extend({
  type: z.literal("shape"),
  shapeType: z.enum(["rect", "ellipse", "polygon", "star", "line", "arrow", "divider"]).default("rect"),
  fill: z.string().default("#5A4032"),
  stroke: z.string().optional(),
  strokeWidth: z.number().min(0).max(50).optional(),
  strokeDash: z.enum(["solid", "dashed", "dotted"]).optional(),
  cornerRadius: z.number().min(0).max(200).optional(),
  arrowEnd: z.boolean().optional(),
});

// 3. Image Element
export const imageElementSchema = baseElementSchema.extend({
  type: z.literal("image"),
  src: z.string().min(1),
  alt: z.string().optional(),
  cornerRadius: z.number().min(0).max(200).optional(),
  filters: z
    .object({
      brightness: z.number().default(100),
      contrast: z.number().default(100),
      saturation: z.number().default(100),
      blur: z.number().default(0),
      duotone: z.string().optional(),
    })
    .optional(),
});

// 4. Photo Frame Element ("Add photo" placeholder and mask container)
export const frameElementSchema = baseElementSchema.extend({
  type: z.literal("frame"),
  frameShape: z.enum(["circle", "rounded", "blob", "arch", "polaroid", "device"]).default("circle"),
  imageSrc: z.string().optional(),
  placeholderText: z.string().default("Drop or Click to Add Photo"),
  zoom: z.number().min(0.1).max(5).optional(),
  cropX: z.number().optional(),
  cropY: z.number().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().optional(),
});

// 5. Icon Element (Lucide Icon name and stroke)
export const iconElementSchema = baseElementSchema.extend({
  type: z.literal("icon"),
  iconName: z.string().default("Sparkles"),
  color: z.string().default("#5A4032"),
  strokeWidth: z.number().min(0.5).max(4).default(2),
});

// 6. QR Code Element
export const qrElementSchema = baseElementSchema.extend({
  type: z.literal("qr"),
  value: z.string().min(1).default("https://xenvraresume.vercel.app"),
  color: z.string().default("#241915"),
  backgroundColor: z.string().default("#FFFFFF"),
});

// 7. Chart Element
export const chartElementSchema = baseElementSchema.extend({
  type: z.literal("chart"),
  chartType: z.enum(["bar", "line", "donut"]).default("bar"),
  title: z.string().default("Metrics"),
  data: z
    .array(
      z.object({
        label: z.string(),
        value: z.number(),
      })
    )
    .default([
      { label: "Q1", value: 35 },
      { label: "Q2", value: 68 },
      { label: "Q3", value: 92 },
      { label: "Q4", value: 120 },
    ]),
  colors: z.array(z.string()).default(["#5A4032", "#7B66B8", "#DCD3F2", "#C9CCD1"]),
});

// Discriminated Element Union
export const studioElementSchema = z.discriminatedUnion("type", [
  textElementSchema,
  shapeElementSchema,
  imageElementSchema,
  frameElementSchema,
  iconElementSchema,
  qrElementSchema,
  chartElementSchema,
]);

export type StudioElement = z.infer<typeof studioElementSchema>;
export type TextElement = z.infer<typeof textElementSchema>;
export type ShapeElement = z.infer<typeof shapeElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type FrameElement = z.infer<typeof frameElementSchema>;
export type IconElement = z.infer<typeof iconElementSchema>;
export type QrElement = z.infer<typeof qrElementSchema>;
export type ChartElement = z.infer<typeof chartElementSchema>;

// Page Schema
export const studioPageSchema = z.object({
  id: z.string().min(1),
  name: z.string().default("Slide 1"),
  width: z.number().min(100).max(4000).default(1920),
  height: z.number().min(100).max(4000).default(1080),
  background: z.string().default("#FFFFFF"),
  elements: z.array(studioElementSchema).max(500).default([]),
});

export type StudioPage = z.infer<typeof studioPageSchema>;

// Top-level Studio Document Model
export const studioDocumentSchema = z.object({
  schemaVersion: z.number().default(1),
  pages: z.array(studioPageSchema).min(1).max(50),
  brandKit: z
    .object({
      colors: z.array(z.string()).default(["#E6EEF4", "#5A4032", "#C9CCD1", "#DCD3F2", "#241915"]),
      fonts: z.array(z.string()).default(["Plus Jakarta Sans", "Inter", "Space Grotesk"]),
    })
    .optional(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

export type StudioDocument = z.infer<typeof studioDocumentSchema>;
