import type { ResumeData } from "@/lib/schemas/resume";
import { TEMPLATE_LIBRARY } from "@/lib/templates/library";

export interface TemplateInfo {
  id: string;
  name: string;
  category: "modern" | "minimal" | "ats" | "creative" | "executive" | "student" | "professional";
  description: string;
  free: boolean;
  tier?: "free" | "beginner" | "pro";
  industry?: string;
  atsSafe?: boolean;
  tags?: string[];
}

export interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
  fontFamily?: string;
}

// 1. Core 10 In-Palette Templates
const CORE_TEMPLATES: TemplateInfo[] = [
  { id: "modern-1", name: "Modern Classic", category: "modern", description: "Clean two-column layout with Mocha Brown accent", free: true, tier: "free", atsSafe: true, tags: ["trending", "modern", "brand"] },
  { id: "minimal-1", name: "Minimalist", category: "minimal", description: "Simple single-column with elegant typography", free: true, tier: "free", atsSafe: true, tags: ["minimalist", "simple", "professional"] },
  { id: "ats-1", name: "ATS Optimized", category: "ats", description: "Clean text-only layout that passes every ATS check", free: true, tier: "free", atsSafe: true, tags: ["simple", "ats", "corporate"] },
  { id: "professional-1", name: "Executive", category: "professional", description: "Traditional corporate-style layout in Mocha & Charcoal", free: false, tier: "pro", atsSafe: true, tags: ["corporate", "executive", "professional"] },
  { id: "modern-2", name: "Gradient Edge", category: "modern", description: "Subtle brand lavender-to-mocha edge accent", free: false, tier: "pro", atsSafe: true, tags: ["modern", "gradient", "brand"] },
  { id: "two-column-slate", name: "Two-Column Slate", category: "modern", description: "Structured two-column layout in Ice Silver & Mocha", free: true, tier: "free", atsSafe: true, tags: ["two-column", "ice", "structured"] },
  { id: "minimal-serif", name: "Minimal Serif", category: "minimal", description: "Scholarly editorial typography in DM Serif & Charcoal", free: true, tier: "free", atsSafe: true, tags: ["serif", "editorial", "minimal"] },
  { id: "creative-sidebar", name: "Creative Sidebar", category: "creative", description: "Mocha Brown sidebar with high-contrast skills and metrics", free: false, tier: "pro", atsSafe: true, tags: ["creative", "mocha", "portfolio"] },
  { id: "compact-one-page", name: "Compact One-Page", category: "ats", description: "High-density engineering format in Charcoal Ink", free: true, tier: "free", atsSafe: true, tags: ["compact", "tech", "ats"] },
  { id: "academic-cv", name: "Academic CV", category: "professional", description: "Formal scholarly research format with Lora & Playfair", free: false, tier: "pro", atsSafe: true, tags: ["academic", "research", "cv"] },
];

// 2. All 24 Canva-parity TemplateSpecs mapped to registry format
const SPEC_TEMPLATES: TemplateInfo[] = TEMPLATE_LIBRARY.map((spec) => ({
  id: spec.id,
  name: spec.name,
  category: spec.category,
  description: spec.description,
  free: spec.tier === "free",
  tier: spec.tier,
  industry: spec.industry,
  atsSafe: spec.atsSafe,
  tags: spec.tags,
}));

export const TEMPLATES: TemplateInfo[] = [...CORE_TEMPLATES, ...SPEC_TEMPLATES];

export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getFreeTemplates(): TemplateInfo[] {
  return TEMPLATES.filter((t) => t.free);
}
