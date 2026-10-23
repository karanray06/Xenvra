import type { ResumeData } from "@/lib/schemas/resume";
import { ModernClassic } from "./modern-1";
import { Minimalist } from "./minimal-1";
import { ATSOptimized } from "./ats-1";
import { ProfessionalExecutive } from "./professional-1";
import { ModernGradientEdge } from "./modern-2";
import { UniversalRenderer } from "./universal-renderer";
import { getTemplateSpecById } from "@/lib/templates/library";

interface TemplateRendererProps {
  templateId: string;
  data: ResumeData;
  accentColor?: string;
  fontFamily?: string;
}

export function TemplateRenderer({
  templateId,
  data,
  accentColor,
  fontFamily,
}: TemplateRendererProps) {
  // 1. Support legacy templates
  switch (templateId) {
    case "modern-1":
      return <ModernClassic data={data} accentColor={accentColor} />;
    case "minimal-1":
      return <Minimalist data={data} accentColor={accentColor} />;
    case "ats-1":
      return <ATSOptimized data={data} accentColor={accentColor} />;
    case "professional-1":
      return <ProfessionalExecutive data={data} accentColor={accentColor} />;
    case "modern-2":
      return <ModernGradientEdge data={data} accentColor={accentColor} />;
    default: {
      // 2. Data-driven TemplateSpec renderer (All 24 Canva-parity templates)
      const spec = getTemplateSpecById(templateId);
      return (
        <UniversalRenderer
          data={data}
          spec={spec}
          accentColor={accentColor}
          fontFamily={fontFamily}
        />
      );
    }
  }
}
