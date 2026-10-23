"use client";

import { useState } from "react";
import type { ElementType } from "./types";
import {
  Type,
  Square,
  Circle,
  Minus,
  Tag,
  Undo2,
  Redo2,
  Grid,
  ZoomIn,
  ZoomOut,
  Download,
  ArrowLeft,
  Wand2,
  FileCode,
  FileImage,
  Printer,
  ChevronDown,
} from "lucide-react";

interface DesignToolbarProps {
  onBackToTemplate: () => void;
  onAddElement: (type: ElementType) => void;
  onConvertFromResume: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  zoom: number;
  onZoomChange: (newZoom: number) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  onExportSvg: () => void;
  onExportPng: () => void;
  onExportPdf: () => void;
}

export function DesignToolbar({
  onBackToTemplate,
  onAddElement,
  onConvertFromResume,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  zoom,
  onZoomChange,
  showGrid,
  onToggleGrid,
  onExportSvg,
  onExportPng,
  onExportPdf,
}: DesignToolbarProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="flex flex-wrap items-center justify-between border-b border-border bg-surface px-4 py-2 select-none gap-2">
      {/* Left: Mode switcher & conversion */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBackToTemplate}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:bg-surface-secondary hover:text-text-primary transition-colors shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Template Mode</span>
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={onConvertFromResume}
          className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-bold text-accent hover:bg-brand-100 transition-colors shadow-xs"
          title="Convert current structured resume data into vector layout layers on the artboard"
        >
          <Wand2 className="h-3.5 w-3.5" />
          <span>Convert Resume → Design</span>
        </button>
      </div>

      {/* Center: Vector Shape Tools & History */}
      <div className="flex items-center gap-1 bg-surface-secondary/60 border border-border rounded-lg p-1">
        <button
          onClick={() => onAddElement("text")}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          title="Add Text Block"
        >
          <Type className="h-3.5 w-3.5 text-accent" />
          <span>Text</span>
        </button>
        <button
          onClick={() => onAddElement("rect")}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          title="Add Rectangle"
        >
          <Square className="h-3.5 w-3.5 text-blue-600" />
          <span>Rect</span>
        </button>
        <button
          onClick={() => onAddElement("circle")}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          title="Add Circle"
        >
          <Circle className="h-3.5 w-3.5 text-emerald-600" />
          <span>Circle</span>
        </button>
        <button
          onClick={() => onAddElement("line")}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          title="Add Divider Line"
        >
          <Minus className="h-3.5 w-3.5 text-amber-600" />
          <span>Line</span>
        </button>
        <button
          onClick={() => onAddElement("badge")}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
          title="Add Skill Chip / Badge"
        >
          <Tag className="h-3.5 w-3.5 text-purple-600" />
          <span>Badge</span>
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Undo / Redo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded p-1 text-text-secondary hover:bg-surface hover:text-text-primary disabled:opacity-40 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded p-1 text-text-secondary hover:bg-surface hover:text-text-primary disabled:opacity-40 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right: Zoom, Grid & Export */}
      <div className="flex items-center gap-2">
        {/* Grid Toggle */}
        <button
          onClick={onToggleGrid}
          className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-xs transition-colors shadow-xs ${
            showGrid
              ? "border-accent bg-brand-50 text-accent font-semibold"
              : "border-border text-text-secondary hover:bg-surface-secondary"
          }`}
          title="Toggle Grid (10px)"
        >
          <Grid className="h-3.5 w-3.5" />
        </button>

        {/* Zoom Controls */}
        <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 shadow-xs">
          <button
            onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
            className="rounded p-1 text-text-secondary hover:bg-surface-secondary"
            title="Zoom Out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 text-[11px] font-mono font-semibold text-text-primary">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
            className="rounded p-1 text-text-secondary hover:bg-surface-secondary"
            title="Zoom In"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Artboard</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-border bg-surface p-1 shadow-xl">
              <button
                onClick={() => {
                  onExportSvg();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
              >
                <FileCode className="h-3.5 w-3.5 text-accent" />
                <span>Vector SVG</span>
              </button>
              <button
                onClick={() => {
                  onExportPng();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
              >
                <FileImage className="h-3.5 w-3.5 text-emerald-600" />
                <span>High-Res PNG</span>
              </button>
              <button
                onClick={() => {
                  onExportPdf();
                  setShowExportMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs text-text-secondary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-amber-600" />
                <span>Print PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
