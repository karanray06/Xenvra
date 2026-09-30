import type { ResumeData } from "@/lib/schemas/resume";
import { ModernClassic } from "./modern-1";
import { Minimalist } from "./minimal-1";
import { ATSOptimized } from "./ats-1";

interface TemplateRendererProps {
  templateId: string;
  data: ResumeData;
  accentColor?: string;
}

export function TemplateRenderer({ templateId, data, accentColor }: TemplateRendererProps) {
  switch (templateId) {
    case "modern-1":
      return <ModernClassic data={data} accentColor={accentColor} />;
    case "minimal-1":
      return <Minimalist data={data} accentColor={accentColor} />;
    case "ats-1":
      return <ATSOptimized data={data} accentColor={accentColor} />;
    case "professional-1":
      return <ATSOptimized data={data} accentColor={accentColor} />;
    case "modern-2":
      return <ModernClassic data={data} accentColor={accentColor || "#6366F1"} />;
    default:
      return <ModernClassic data={data} accentColor={accentColor} />;
  }
}
