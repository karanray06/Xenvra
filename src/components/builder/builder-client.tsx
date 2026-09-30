"use client";

import { ResumeProvider } from "./resume-provider";
import { BuilderToolbar } from "./builder-toolbar";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import type { ResumeData } from "@/lib/schemas/resume";

interface BuilderClientProps {
  userId: string;
  initialId: string | null;
  initialTitle: string;
  initialTemplateId: string;
  initialData: ResumeData | null;
}

export function BuilderClient({
  userId,
  initialId,
  initialTitle,
  initialTemplateId,
  initialData,
}: BuilderClientProps) {
  return (
    <ResumeProvider
      userId={userId}
      initialId={initialId}
      initialTitle={initialTitle}
      initialTemplateId={initialTemplateId}
      initialData={initialData || undefined}
    >
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <BuilderToolbar />
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Form */}
          <div className="w-[420px] shrink-0 border-r border-border bg-surface overflow-hidden">
            <ResumeForm />
          </div>
          {/* Right: Preview */}
          <div className="flex-1 overflow-hidden">
            <ResumePreview />
          </div>
        </div>
      </div>
    </ResumeProvider>
  );
}
