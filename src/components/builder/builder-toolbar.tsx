"use client";

import { useResume } from "./resume-provider";
import { TEMPLATES } from "@/components/templates/registry";
import {
  Download,
  Check,
  Loader2,
  Layout,
  CloudOff,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

export function BuilderToolbar() {
  const {
    title,
    setTitle,
    templateId,
    setTemplateId,
    saveStatus,
    lastSaved,
    retrySave,
    errorMessage,
  } = useResume();

  const [showTemplates, setShowTemplates] = useState(false);

  const handlePrint = () => {
    // Sanitize document title for safe PDF file naming when printing
    const safeTitle = (title.trim() || "Resume").replace(/[<>:"/\\|?*]/g, "_");
    const originalTitle = document.title;
    document.title = safeTitle;

    window.print();

    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-text-primary hover:border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          placeholder="Resume Title"
          maxLength={100}
        />
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1 text-text-tertiary">
              <Loader2 className="h-3 w-3 animate-spin text-accent" />
              <span>Saving...</span>
            </span>
          )}
          {saveStatus === "saved" && lastSaved && (
            <span className="flex items-center gap-1 text-success">
              <Check className="h-3 w-3" />
              <span>Saved</span>
            </span>
          )}
          {saveStatus === "offline" && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <CloudOff className="h-3.5 w-3.5" />
              <span>Offline – will sync</span>
            </span>
          )}
          {saveStatus === "error" && (
            <span className="flex items-center gap-1.5 text-danger font-medium">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{errorMessage || "Save failed"}</span>
              <button
                type="button"
                onClick={retrySave}
                className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] underline hover:bg-danger-light"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                Retry
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Template Selector */}
        <div className="relative">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-tertiary"
          >
            <Layout className="h-3.5 w-3.5" />
            {TEMPLATES.find((t) => t.id === templateId)?.name || "Template"}
          </button>
          {showTemplates && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-border bg-surface p-1 shadow-lg">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTemplateId(t.id);
                    setShowTemplates(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                    templateId === t.id
                      ? "bg-brand-50 text-accent font-medium"
                      : "text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-[10px] opacity-60">{t.category}</p>
                  </div>
                  {!t.free && (
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                      PRO
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export PDF Button */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Export PDF
        </button>
      </div>
    </div>
  );
}
