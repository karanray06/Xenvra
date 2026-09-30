import type { ResumeData } from "@/lib/schemas/resume";

export interface TemplateInfo {
  id: string;
  name: string;
  category: "modern" | "minimal" | "ats" | "professional";
  description: string;
  free: boolean;
}

export interface TemplateProps {
  data: ResumeData;
  accentColor?: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: "modern-1", name: "Modern Classic", category: "modern", description: "Clean two-column layout with accent sidebar", free: true },
  { id: "minimal-1", name: "Minimalist", category: "minimal", description: "Simple single-column with elegant typography", free: true },
  { id: "ats-1", name: "ATS Optimized", category: "ats", description: "Clean text-only layout that passes every ATS", free: true },
  { id: "professional-1", name: "Executive", category: "professional", description: "Traditional corporate-style resume", free: false },
  { id: "modern-2", name: "Gradient Edge", category: "modern", description: "Bold gradient accents with modern spacing", free: false },
];

export function getTemplateById(id: string): TemplateInfo | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function getFreeTemplates(): TemplateInfo[] {
  return TEMPLATES.filter((t) => t.free);
}
