"use client";

import { useState } from "react";
import { ResumeProvider } from "./resume-provider";
import { BuilderToolbar } from "./builder-toolbar";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { DesignEditor } from "@/components/design/design-editor";
import type { ResumeData } from "@/lib/schemas/resume";
import type { DesignElement } from "@/components/design/types";

interface BuilderClientProps {
  userId: string;
  initialId: string | null;
  initialTitle: string;
  initialTemplateId: string;
  initialData: ResumeData | null;
  initialDesignJson?: { elements?: DesignElement[] } | null;
  isPaid?: boolean;
}

export function BuilderClient({
  userId,
  initialId,
  initialTitle,
  initialTemplateId,
  initialData,
  initialDesignJson,
  isPaid = false,
}: BuilderClientProps) {
  const [mode, setMode] = useState<"template" | "design">("template");

  return (
    <ResumeProvider
      userId={userId}
      initialId={initialId}
      initialTitle={initialTitle}
      initialTemplateId={initialTemplateId}
      initialData={initialData || undefined}
    >
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        {mode === "design" ? (
          <DesignEditor
            onBackToTemplate={() => setMode("template")}
            initialDesignJson={initialDesignJson}
          />
        ) : (
          <>
            <BuilderToolbar
              mode={mode}
              onModeChange={setMode}
            />
            <div className="flex flex-1 overflow-hidden">
              {/* Left: Form */}
              <div className="w-[420px] shrink-0 border-r border-border bg-surface overflow-hidden">
                <ResumeForm />
              </div>
              {/* Right: Preview */}
              <div className="flex-1 overflow-hidden">
                <ResumePreview isPaid={isPaid} />
              </div>
            </div>
          </>
        )}
      </div>
    </ResumeProvider>
  );
}

