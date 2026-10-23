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

// 1. Legacy templates for backward compatibility
const LEGACY_TEMPLATES: TemplateInfo[] = [
  { id: "modern-1", name: "Modern Classic (Classic)", category: "modern", description: "Clean two-column layout with accent sidebar", free: true, tier: "free", atsSafe: true, tags: ["trending", "modern", "simple"] },
  { id: "minimal-1", name: "Minimalist (Classic)", category: "minimal", description: "Simple single-column with elegant typography", free: true, tier: "free", atsSafe: true, tags: ["minimalist", "simple", "professional"] },
  { id: "ats-1", name: "ATS Optimized (Classic)", category: "ats", description: "Clean text-only layout that passes every ATS", free: true, tier: "free", atsSafe: true, tags: ["simple", "seek", "corporate"] },
  { id: "professional-1", name: "Executive (Classic)", category: "professional", description: "Traditional corporate-style resume", free: false, tier: "pro", atsSafe: true, tags: ["corporate", "executive", "professional"] },
  { id: "modern-2", name: "Gradient Edge (Classic)", category: "modern", description: "Bold gradient accents with modern spacing", free: false, tier: "pro", atsSafe: true, tags: ["colorful", "modern", "trending"] },
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

export const TEMPLATES: TemplateInfo[] = [...SPEC_TEMPLATES, ...LEGACY_TEMPLATES];

export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getFreeTemplates(): TemplateInfo[] {
  return TEMPLATES.filter((t) => t.free);
}
