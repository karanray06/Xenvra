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
  Smartphone,
  AlertTriangle,
  Target,
  Sparkles,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AtsDrawer } from "./ats-drawer";
import { AiAssistModal } from "./ai-assist-modal";

export function BuilderToolbar() {
  const router = useRouter();
  const {
    id,
    title,
    setTitle,
    templateId,
    setTemplateId,
    data,
    updateField,
    saveStatus,
    lastSaved,
    retrySave,
    errorMessage,
    alsoOpenInOtherDevice,
    conflictRemote,
    resolveConflictReload,
    resolveConflictKeepMine,
  } = useResume();

  const [showTemplates, setShowTemplates] = useState(false);
  const [isAtsOpen, setIsAtsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

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

  const handleDocxExport = async () => {
    if (!id) {
      alert("Please wait a moment for the resume to finish initial save before exporting.");
      return;
    }

    setIsExportingDocx(true);

    try {
      const res = await fetch(`/api/resumes/${id}/docx`);
      if (!res.ok) {
        const json = await res.json();
        if (res.status === 403) {
          if (confirm("DOCX export is available on Beginner and Pro plans. Would you like to view plans on the Billing page?")) {
            router.push("/dashboard/billing");
          }
          return;
        }
        throw new Error(json.error || "DOCX generation failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(title.trim() || "Resume").replace(/[^a-zA-Z0-9_\-\s]/g, "")}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Export failed";
      alert(msg);
    } finally {
      setIsExportingDocx(false);
    }
  };

  return (
    <>
      {/* Real-time Conflict Bar (Non-blocking) */}
      {conflictRemote && (
        <div className="flex items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 animate-slide-down">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              <strong>Remote update:</strong> This resume was edited in another tab or device.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resolveConflictReload}
              className="rounded bg-white border border-amber-300 px-2.5 py-1 font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-xs"
            >
              Reload Remote
            </button>
            <button
              onClick={resolveConflictKeepMine}
              className="rounded bg-amber-700 px-2.5 py-1 font-semibold text-white hover:bg-amber-800 transition-colors shadow-xs"
            >
              Keep Mine
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-4 py-2.5">
        <div className="flex items-center gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-text-primary hover:border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
            placeholder="Resume Title"
            maxLength={100}
          />
          <div className="flex items-center gap-2 text-xs text-text-tertiary">
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

            {/* Presence Chip (Pale Lavender) */}
            {alsoOpenInOtherDevice && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lav-200 px-2.5 py-0.5 text-[11px] font-semibold text-[#241915] shadow-xs">
                <Smartphone className="h-3 w-3 text-brand-600" />
                <span>Also open in another device</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ATS Score Button */}
          <button
            onClick={() => setIsAtsOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent shadow-xs"
          >
            <Target className="h-3.5 w-3.5 text-accent" />
            <span>ATS Score</span>
          </button>

          {/* AI Assist Button */}
          <button
            onClick={() => setIsAiOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>AI Assist</span>
          </button>

          {/* Template Selector */}
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-tertiary shadow-xs"
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

          {/* Export DOCX Button */}
          <button
            onClick={handleDocxExport}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-surface-secondary shadow-xs disabled:opacity-60"
            title="Download formatted Microsoft Word document (.docx)"
          >
            {isExportingDocx ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-accent" />
            )}
            <span>Export DOCX</span>
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* ATS Analysis Drawer */}
      <AtsDrawer isOpen={isAtsOpen} onClose={() => setIsAtsOpen(false)} />

      {/* AI Writing Assistant Modal */}
      <AiAssistModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialText={data.summary || ""}
        context={{
          role: data.contact?.title,
          skills: data.skills,
        }}
        onApply={(improved) => {
          updateField("summary", improved);
        }}
      />
    </>
  );
}
