"use client";

import { useResume } from "./resume-provider";
import { TemplateRenderer } from "@/components/templates/template-renderer";
import { useRef } from "react";

interface ResumePreviewProps {
  isPaid?: boolean;
}

export function ResumePreview({ isPaid = false }: ResumePreviewProps) {
  const { data, templateId } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full flex-col items-center overflow-auto bg-surface-tertiary p-6">
      {/* A4 Preview Container */}
      <div
        ref={previewRef}
        id="resume-preview"
        className="relative w-[210mm] bg-white shadow-xl overflow-hidden"
        style={{
          minHeight: "297mm",
          transformOrigin: "top center",
        }}
      >
        <TemplateRenderer templateId={templateId} data={data} />

        {/* Free Plan Diagonal Watermark (paid = none) */}
        {!isPaid && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.06] print:opacity-[0.08]"
            >
              <span className="rotate-[-35deg] text-6xl font-black tracking-widest text-text-primary uppercase whitespace-nowrap">
                Made with Xenvra
              </span>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none select-none absolute bottom-4 right-6 text-[11px] font-medium tracking-wide text-text-tertiary opacity-80 print:opacity-100"
            >
              Made with <strong className="font-semibold text-text-primary">Xenvra</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
