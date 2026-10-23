import { z } from "zod";

export const templateCategorySchema = z.enum([
  "modern",
  "minimal",
  "ats",
  "creative",
  "executive",
  "student",
]);
export type TemplateCategory = z.infer<typeof templateCategorySchema>;

export const templateIndustrySchema = z.enum([
  "tech",
  "design",
  "finance",
  "healthcare",
  "education",
  "marketing",
  "fresher",
]);
export type TemplateIndustry = z.infer<typeof templateIndustrySchema>;

export const templateTierSchema = z.enum(["free", "beginner", "pro"]);
export type TemplateTier = z.infer<typeof templateTierSchema>;

export const templateGridSchema = z.object({
  layout: z.enum([
    "single-column",
    "two-column-equal",
    "sidebar-left",
    "sidebar-right",
    "header-band",
  ]),
  sidebarWidth: z.string().default("32%"),
});

export const designTokensSchema = z.object({
  palette: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    background: z.string().default("#ffffff"),
    surface: z.string().default("#f8fafc"),
    text: z.string().default("#0f172a"),
    textMuted: z.string().default("#475569"),
    border: z.string().default("#e2e8f0"),
  }),
  fontPair: z.object({
    heading: z.string().default("Inter"),
    body: z.string().default("Inter"),
  }),
  typeScale: z.object({
    name: z.string().default("24pt"),
    title: z.string().default("12pt"),
    sectionHeading: z.string().default("11pt"),
    itemTitle: z.string().default("10pt"),
    body: z.string().default("9pt"),
    small: z.string().default("8pt"),
  }),
  spacing: z.object({
    sectionGap: z.string().default("16px"),
    itemGap: z.string().default("10px"),
  }),
  borderRadius: z.string().default("4px"),
  photoSlot: z.boolean().default(false),
});

export const templateSpecSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: templateCategorySchema,
  industry: templateIndustrySchema,
  tier: templateTierSchema,
  atsSafe: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  thumbnailUrl: z.string().optional(),
  page: z.object({
    format: z.enum(["a4", "letter"]).default("a4"),
    margin: z.string().default("0.5in"),
    bleed: z.boolean().default(false),
  }),
  grid: templateGridSchema,
  designTokens: designTokensSchema,
  sectionVariants: z.object({
    contact: z.enum(["inline-row", "compact-badges", "stacked-icons", "sidebar-list"]).default("inline-row"),
    skills: z.enum(["tags", "bullets", "level-bars", "level-dots", "plain-text"]).default("tags"),
    experience: z.enum(["timeline", "classic-block", "modern-split", "minimal-indent"]).default("classic-block"),
    education: z.enum(["compact-row", "standard-block"]).default("standard-block"),
  }),
  sectionOrder: z.object({
    main: z.array(z.string()),
    sidebar: z.array(z.string()).optional(),
  }),
  constraints: z.object({
    maxPages: z.number().int().min(1).max(3).default(2),
  }),
});

export type TemplateSpec = z.infer<typeof templateSpecSchema>;
