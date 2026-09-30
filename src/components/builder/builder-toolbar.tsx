"use client";

import { useResume } from "./resume-provider";
import { TEMPLATES } from "@/components/templates/registry";
import { Download, Check, Loader2, Layout } from "lucide-react";
import { useState } from "react";

export function BuilderToolbar() {
  const { title, setTitle, templateId, setTemplateId, saving, lastSaved } = useResume();
  const [showTemplates, setShowTemplates] = useState(false);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const previewEl = document.getElementById("resume-preview");
    if (!previewEl) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; padding: 0; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          </style>
        </head>
        <body>${previewEl.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-text-primary hover:border-border focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          placeholder="Resume Title"
        />
        <div className="flex items-center gap-1.5 text-xs text-text-tertiary">
          {saving ? (
            <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
          ) : lastSaved ? (
            <><Check className="h-3 w-3 text-success" /> Saved</>
          ) : null}
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
                  onClick={() => { setTemplateId(t.id); setShowTemplates(false); }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs transition-colors ${
                    templateId === t.id ? "bg-brand-50 text-accent" : "text-text-secondary hover:bg-surface-tertiary"
                  }`}
                >
                  <div>
                    <p className="font-medium">{t.name}</p>
                    <p className="text-[10px] opacity-60">{t.category}</p>
                  </div>
                  {!t.free && (
                    <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold text-accent">PRO</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Download PDF */}
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
        >
          <Download className="h-3.5 w-3.5" />
          PDF
        </button>
      </div>
    </div>
  );
}
