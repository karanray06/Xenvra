import type { ResumeData } from "@/lib/schemas/resume";
import { ModernClassic } from "./modern-1";
import { Minimalist } from "./minimal-1";
import { ATSOptimized } from "./ats-1";
import { ProfessionalExecutive } from "./professional-1";
import { ModernGradientEdge } from "./modern-2";
import { TwoColumnSlate } from "./two-column-slate";
import { MinimalSerif } from "./minimal-serif";
import { CreativeSidebar } from "./creative-sidebar";
import { CompactOnePage } from "./compact-one-page";
import { AcademicCV } from "./academic-cv";
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
  const normalizedId = templateId ? templateId.replace(/^resume-/, "") : "modern-1";

  // 1. Support 10 core in-palette templates
  switch (normalizedId) {
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
    case "two-column-slate":
      return <TwoColumnSlate data={data} accentColor={accentColor} fontFamily={fontFamily} />;
    case "minimal-serif":
      return <MinimalSerif data={data} accentColor={accentColor} fontFamily={fontFamily} />;
    case "creative-sidebar":
      return <CreativeSidebar data={data} accentColor={accentColor} fontFamily={fontFamily} />;
    case "compact-one-page":
      return <CompactOnePage data={data} accentColor={accentColor} fontFamily={fontFamily} />;
    case "academic-cv":
      return <AcademicCV data={data} accentColor={accentColor} fontFamily={fontFamily} />;
    default: {
      // 2. Data-driven TemplateSpec renderer (All 24 Canva-parity templates)
      const spec = getTemplateSpecById(normalizedId);
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
