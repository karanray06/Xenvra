"use client";

import { useResume } from "./resume-provider";
import { TemplateRenderer } from "@/components/templates/template-renderer";
import { useRef } from "react";

export function ResumePreview() {
  const { data, templateId } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full flex-col items-center overflow-auto bg-surface-tertiary p-6">
      {/* A4 Preview Container */}
      <div
        ref={previewRef}
        id="resume-preview"
        className="w-[210mm] bg-white shadow-xl"
        style={{
          minHeight: "297mm",
          transformOrigin: "top center",
        }}
      >
        <TemplateRenderer templateId={templateId} data={data} />
      </div>
    </div>
  );
}
