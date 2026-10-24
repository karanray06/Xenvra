"use client";

import React, { useState } from "react";
import { useStudioStore } from "@/lib/studio/store";
import { ARTBOARD_PRESETS } from "@/lib/schemas/studio";
import {
  exportDocumentToPDF,
  exportDocumentToPPTX,
  exportPageToSVG,
  exportPageToPNG,
} from "@/lib/studio/export";
import {
  Undo2,
  Redo2,
  Play,
  Download,
  Palette,
  Maximize2,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ShieldCheck,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import { StudioATSDrawer } from "./studio-ats-drawer";
import { BulkCertificateModal } from "./bulk-certificate-modal";
import { applyCareerDataBinding } from "@/lib/studio/career-kit";
import { validateStudioDocumentATS } from "@/lib/studio/ats-validator";

interface StudioTopBarProps {
  onStartPresenting: () => void;
  onManualSave?: () => void;
}

export function StudioTopBar({ onStartPresenting, onManualSave }: StudioTopBarProps) {
  const {
    doc,
    activePageIndex,
    designTitle,
    zoom,
    setZoom,
    undo,
    redo,
    undoStack,
    redoStack,
    recolourToBrand,
    magicResize,
    saveStatus,
    isDirty,
    isAnonymous,
  } = useStudioStore();

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isResizeOpen, setIsResizeOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isATSOpen, setIsATSOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const atsScore = React.useMemo(() => {
    return validateStudioDocumentATS(doc).score;
  }, [doc]);

  const handleSyncProfile = () => {
    const { doc: newDoc, boundCount } = applyCareerDataBinding(doc);
    if (boundCount > 0) {
      useStudioStore.setState({ doc: newDoc, isDirty: true });
      setSyncFeedback(`Synced ${boundCount} fields`);
    } else {
      setSyncFeedback("All fields synced");
    }
    setTimeout(() => setSyncFeedback(null), 2500);
  };

  const activePage = doc.pages[activePageIndex] || doc.pages[0];

  const handleDownloadSVG = () => {
    const svg = exportPageToSVG(activePage);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${designTitle.toLowerCase().replace(/\s+/g, "-")}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportOpen(false);
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      await exportDocumentToPDF(doc, `${designTitle}.pdf`, true);
    } finally {
      setIsExporting(false);
      setIsExportOpen(false);
    }
  };

  const handleDownloadPPTX = async () => {
    setIsExporting(true);
    try {
      await exportDocumentToPPTX(doc, `${designTitle}.pptx`);
    } finally {
      setIsExporting(false);
      setIsExportOpen(false);
    }
  };

  const handleDownloadPNG = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await exportPageToPNG(activePage, 2, true);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${designTitle}.png`;
      link.click();
    } finally {
      setIsExporting(false);
      setIsExportOpen(false);
    }
  };

  return (
    <header className="h-14 border-b border-[#C9CCD1] bg-white px-4 flex items-center justify-between gap-4 z-40 select-none">
      {/* Left: Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 pr-3 border-r border-[#C9CCD1]">
          <div className="h-8 w-8 rounded-lg bg-[#5A4032] flex items-center justify-center text-[#E6EEF4] font-bold text-sm shadow-xs">
            X
          </div>
          <div>
            <span className="text-xs font-bold tracking-tight text-[#241915]">
              Xenvra Studio
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-[#5E534D]">
              {saveStatus === "saving" ? (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-blue-600 font-medium">Saving...</span>
                </>
              ) : saveStatus === "error" ? (
                <button
                  type="button"
                  onClick={onManualSave}
                  title="Click to retry saving"
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium underline cursor-pointer"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>Save failed · Retry</span>
                </button>
              ) : isAnonymous ? (
                <a
                  href="/auth"
                  title="Sign in to save design to cloud"
                  className="flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium cursor-pointer"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Local Draft · Sign in</span>
                </a>
              ) : isDirty ? (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Unsaved changes</span>
                </span>
              ) : (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Saved to cloud</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Editable Title */}
        <input
          type="text"
          value={designTitle}
          onChange={(e) =>
            useStudioStore.setState({ designTitle: e.target.value, isDirty: true })
          }
          className="text-sm font-semibold text-[#241915] bg-transparent hover:bg-[#F6F1EE] focus:bg-white px-2 py-1 rounded transition-colors border border-transparent hover:border-[#C9CCD1] focus:border-[#5A4032] outline-none max-w-xs"
        />

        {/* Magic Resize Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsResizeOpen(!isResizeOpen)}
            className="flex items-center gap-1.5 text-xs font-medium text-[#5A4032] bg-[#E6EEF4] hover:bg-[#DCD3F2] px-2.5 py-1.5 rounded-md transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Resize</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {isResizeOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-[#C9CCD1] py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#8A8F98] uppercase tracking-wider border-b border-[#C9CCD1]">
                Magic Resize Canvas
              </div>
              {Object.entries(ARTBOARD_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => {
                    magicResize(key);
                    setIsResizeOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-[#F6F1EE] flex flex-col gap-0.5 transition-colors"
                >
                  <span className="text-xs font-semibold text-[#241915]">{preset.name}</span>
                  <span className="text-[10px] text-[#5E534D]">
                    {preset.width} × {preset.height} px · {preset.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: History & Zoom */}
      <div className="flex items-center gap-1 bg-[#F6F1EE] p-1 rounded-lg border border-[#C9CCD1]">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          title="Undo (Ctrl+Z)"
          className="p-1.5 rounded hover:bg-white disabled:opacity-40 text-[#241915] transition-colors"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          title="Redo (Ctrl+Y)"
          className="p-1.5 rounded hover:bg-white disabled:opacity-40 text-[#241915] transition-colors"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-[#C9CCD1] mx-1" />

        <button
          onClick={() => setZoom(zoom - 0.1)}
          title="Zoom out"
          className="p-1.5 rounded hover:bg-white text-[#241915] transition-colors"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-mono font-medium text-[#241915] w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom + 0.1)}
          title="Zoom in"
          className="p-1.5 rounded hover:bg-white text-[#241915] transition-colors"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right: Actions & Export */}
      <div className="flex items-center gap-2">
        {/* Career Kit Profile Sync */}
        <button
          onClick={handleSyncProfile}
          title="Sync Career Kit data into bound text elements"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5E534D] hover:text-[#241915] bg-[#F6F1EE] hover:bg-[#E6EEF4] border border-[#C9CCD1] px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <RefreshCw className="h-3 w-3 text-[#5A4032]" />
          <span>{syncFeedback || "Career Kit"}</span>
        </button>

        {/* Live ATS Score Indicator */}
        <button
          onClick={() => setIsATSOpen(true)}
          title="Open live ATS score breakdown and vector check"
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>ATS: {atsScore}%</span>
        </button>

        {/* Bulk Certificate / Placard Generator */}
        <button
          onClick={() => setIsBulkOpen(true)}
          title="Generate bulk personalized PDFs from CSV"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5A4032] hover:bg-[#F6F1EE] border border-[#C9CCD1] px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          <span>Bulk</span>
        </button>

        {/* 1-Click Recolour to Brand */}
        <button
          onClick={recolourToBrand}
          title="Map all colours to the 5 official brand shades"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#5A4032] hover:bg-[#F6F1EE] border border-[#5A4032] px-3 py-1.5 rounded-lg transition-colors"
        >
          <Palette className="h-3.5 w-3.5" />
          <span>Brand Kit</span>
        </button>

        {/* Present Mode for presentations */}
        <button
          onClick={onStartPresenting}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#241915] bg-[#DCD3F2] hover:bg-[#c9bcea] px-3 py-1.5 rounded-lg transition-colors shadow-xs"
        >
          <Play className="h-3.5 w-3.5 fill-[#241915]" />
          <span>Present</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#5A4032] hover:bg-[#47322A] px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? "Exporting..." : "Export"}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {isExportOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-2xl border border-[#C9CCD1] py-1.5 z-50">
              <div className="px-3.5 py-2 text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider border-b border-[#C9CCD1]">
                Vector & Slide Formats
              </div>

              <button
                onClick={handleDownloadPDF}
                className="w-full px-3.5 py-2.5 text-left hover:bg-[#F6F1EE] flex items-center justify-between group transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#241915]">PDF Document</p>
                  <p className="text-[10px] text-[#5E534D]">Vector text, ATS-readable</p>
                </div>
                <span className="text-[9px] font-semibold bg-[#E6EEF4] text-[#5A4032] px-1.5 py-0.5 rounded">
                  Best
                </span>
              </button>

              <button
                onClick={handleDownloadPPTX}
                className="w-full px-3.5 py-2.5 text-left hover:bg-[#F6F1EE] flex items-center justify-between group transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#241915]">Microsoft PowerPoint</p>
                  <p className="text-[10px] text-[#5E534D]">.pptx editable slides</p>
                </div>
                <span className="text-[9px] font-semibold bg-[#DCD3F2] text-[#241915] px-1.5 py-0.5 rounded">
                  Slides
                </span>
              </button>

              <button
                onClick={handleDownloadSVG}
                className="w-full px-3.5 py-2.5 text-left hover:bg-[#F6F1EE] flex items-center justify-between group transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-[#241915]">Scalable Vector (SVG)</p>
                  <p className="text-[10px] text-[#5E534D]">Direct AST serialization</p>
                </div>
              </button>

              <button
                onClick={handleDownloadPNG}
                className="w-full px-3.5 py-2.5 text-left hover:bg-[#F6F1EE] flex items-center justify-between group transition-colors border-t border-[#C9CCD1]"
              >
                <div>
                  <p className="text-xs font-bold text-[#241915]">PNG Image (2× High-Res)</p>
                  <p className="text-[10px] text-[#5E534D]">Sharpened for web & social</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over ATS Drawer */}
      <StudioATSDrawer isOpen={isATSOpen} onClose={() => setIsATSOpen(false)} />

      {/* Bulk Certificate Modal */}
      <BulkCertificateModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} />
    </header>
  );
}
