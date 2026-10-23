"use client";

import { useState } from "react";
import { ResumeProvider } from "./resume-provider";
import { BuilderToolbar } from "./builder-toolbar";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { DesignEditor } from "@/components/design/design-editor";
import { CanvaToolsDrawer } from "./canva-tools-drawer";
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
  const [isCanvaToolsOpen, setIsCanvaToolsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState("#2563EB");
  const [fontFamily, setFontFamily] = useState("Inter");

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
              onOpenCanvaTools={() => setIsCanvaToolsOpen(true)}
            />
            <div className="flex flex-1 overflow-hidden relative">
              {/* Left: Form */}
              <div className="w-[420px] shrink-0 border-r border-border bg-surface overflow-hidden">
                <ResumeForm />
              </div>

              {/* Right: Preview with dynamic live styles */}
              <div className="flex-1 overflow-hidden">
                <ResumePreview
                  isPaid={isPaid}
                  accentColor={accentColor}
                  fontFamily={fontFamily}
                />
              </div>

              {/* Canva-Grade Design Tools & Brand Kit Drawer */}
              <CanvaToolsDrawer
                isOpen={isCanvaToolsOpen}
                onClose={() => setIsCanvaToolsOpen(false)}
                accentColor={accentColor}
                onAccentColorChange={setAccentColor}
                fontFamily={fontFamily}
                onFontFamilyChange={setFontFamily}
              />
            </div>
          </>
        )}
      </div>
    </ResumeProvider>
  );
}
