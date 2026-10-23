"use client";

import type { DesignElement } from "./types";
import { A4_PRESET } from "./types";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  Type,
  Sliders,
  Paintbrush,
} from "lucide-react";

interface PropertiesPanelProps {
  selectedElement: DesignElement | null;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
}

const BRAND_PALETTE = [
  { name: "Mocha Brown", color: "#5A4032" },
  { name: "Ice Silver", color: "#E6EEF4" },
  { name: "Platinum Silver", color: "#C9CCD1" },
  { name: "Pale Lavender", color: "#DCD3F2" },
  { name: "Charcoal Dark", color: "#1A1D20" },
  { name: "Slate Grey", color: "#64748B" },
  { name: "Pure White", color: "#FFFFFF" },
  { name: "Emerald", color: "#10B981" },
  { name: "Amber Gold", color: "#F59E0B" },
  { name: "Transparent", color: "transparent" },
];

export function PropertiesPanel({
  selectedElement,
  onUpdateElement,
}: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="flex h-full w-64 flex-col border-l border-border bg-surface p-6 text-center select-none justify-center">
        <Sliders className="h-8 w-8 mx-auto text-text-tertiary/40 mb-2" />
        <h4 className="text-xs font-bold text-text-primary">No Selection</h4>
        <p className="text-[11px] text-text-tertiary mt-1">
          Select an element or layer on the artboard to edit its layout, geometry, color, and typography.
        </p>
      </div>
    );
  }

  const update = (updates: Partial<DesignElement>) => {
    onUpdateElement(selectedElement.id, updates);
  };

  // Alignment handlers
  const align = (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    switch (type) {
      case "left":
        update({ x: 40 });
        break;
      case "center":
        update({ x: Math.round((A4_PRESET.width - selectedElement.width) / 2) });
        break;
      case "right":
        update({ x: A4_PRESET.width - selectedElement.width - 40 });
        break;
      case "top":
        update({ y: 40 });
        break;
      case "middle":
        update({ y: Math.round((A4_PRESET.height - selectedElement.height) / 2) });
        break;
      case "bottom":
        update({ y: A4_PRESET.height - selectedElement.height - 40 });
        break;
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-l border-border bg-surface overflow-y-auto select-none p-4 space-y-5 text-xs text-text-primary">
      {/* Element Title */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <span className="font-bold uppercase tracking-wider text-[11px] text-text-secondary">
          Properties
        </span>
        <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-accent uppercase">
          {selectedElement.type}
        </span>
      </div>

      {/* Alignment Bar */}
      <div>
        <label className="block text-[11px] font-semibold text-text-secondary mb-1.5">
          Artboard Alignment
        </label>
        <div className="grid grid-cols-6 gap-1 rounded-lg border border-border bg-surface-secondary p-1">
          <button
            onClick={() => align("left")}
            title="Align Left"
            className="flex items-center justify-center rounded p-1.5 hover:bg-surface text-text-secondary hover:text-text-primary"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => align("center")}
            title="Align Center Horizontal"
            className="flex items-center justify-center rounded p-1.5 hover:bg-surface text-text-secondary hover:text-text-primary"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => align("right")}
            title="Align Right"
            className="flex items-center justify-center rounded p-1.5 hover:bg-surface text-text-secondary hover:text-text-primary"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => align("top")}
            title="Align Top"
            className="flex items-center justify-center rounded p-1.5 hover:bg-surface text-text-secondary hover:text-text-primary"
          >
            <AlignVerticalJustifyStart className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => align("middle")}
            title="Align Center Vertical"
            className="flex items-center justify-center rounded p-1.5 hover:bg-surface text-text-secondary hover:text-text-primary"
          >
            <AlignVerticalJustifyCenter className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => align("bottom")}
            title="Align Bottom"
            className="flex items-center justify-center rounded p-1.5 hover:bg-surface text-text-secondary hover:text-text-primary"
          >
            <AlignVerticalJustifyEnd className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Geometry / Transform */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-text-secondary">
          Transform & Size
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-text-tertiary">X (px)</span>
            <input
              type="number"
              value={selectedElement.x}
              onChange={(e) => update({ x: Number(e.target.value) })}
              className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary">Y (px)</span>
            <input
              type="number"
              value={selectedElement.y}
              onChange={(e) => update({ y: Number(e.target.value) })}
              className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary">Width (W)</span>
            <input
              type="number"
              value={selectedElement.width}
              onChange={(e) => update({ width: Math.max(10, Number(e.target.value)) })}
              className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary">Height (H)</span>
            <input
              type="number"
              value={selectedElement.height}
              onChange={(e) => update({ height: Math.max(2, Number(e.target.value)) })}
              className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-[10px] text-text-tertiary">Rotation (°)</span>
            <input
              type="number"
              min={0}
              max={360}
              value={selectedElement.rotation || 0}
              onChange={(e) => update({ rotation: Number(e.target.value) % 360 })}
              className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary">
              Opacity ({Math.round((selectedElement.opacity ?? 1) * 100)}%)
            </span>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={selectedElement.opacity ?? 1}
              onChange={(e) => update({ opacity: Number(e.target.value) })}
              className="w-full accent-accent mt-2"
            />
          </div>
        </div>

        {/* Border Radius (for rectangles and badges) */}
        {(selectedElement.type === "rect" || selectedElement.type === "badge") && (
          <div className="pt-1">
            <span className="text-[10px] text-text-tertiary">Corner Radius (px)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={selectedElement.borderRadius || 0}
              onChange={(e) => update({ borderRadius: Number(e.target.value) })}
              className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Fill Color */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
            <Paintbrush className="h-3 w-3 text-accent" />
            Fill Color
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="color"
              value={selectedElement.fill === "transparent" ? "#ffffff" : selectedElement.fill}
              onChange={(e) => update({ fill: e.target.value })}
              className="h-5 w-5 rounded border border-border cursor-pointer"
            />
            <span className="font-mono text-[11px]">{selectedElement.fill}</span>
          </div>
        </div>

        {/* Brand Palette Swatches */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {BRAND_PALETTE.map((swatch) => (
            <button
              key={swatch.name}
              onClick={() => update({ fill: swatch.color })}
              title={swatch.name}
              className={`h-6 w-full rounded border transition-transform hover:scale-105 ${
                selectedElement.fill === swatch.color ? "ring-2 ring-accent" : "border-border"
              }`}
              style={{
                backgroundColor: swatch.color === "transparent" ? "#FFFFFF" : swatch.color,
                backgroundImage:
                  swatch.color === "transparent"
                    ? "linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)"
                    : "none",
                backgroundSize: "8px 8px",
              }}
            />
          ))}
        </div>
      </div>

      {/* Typography Section (if Text or Badge) */}
      {(selectedElement.type === "text" || selectedElement.type === "badge") && (
        <div className="space-y-3 border-t border-border pt-4">
          <label className="text-[11px] font-semibold text-text-secondary flex items-center gap-1.5">
            <Type className="h-3 w-3 text-accent" />
            Typography
          </label>

          {/* Font Family */}
          <div>
            <span className="text-[10px] text-text-tertiary">Font Family</span>
            <select
              value={selectedElement.fontFamily || "Plus Jakarta Sans, sans-serif"}
              onChange={(e) => update({ fontFamily: e.target.value })}
              className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            >
              <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
              <option value="Inter, sans-serif">Inter</option>
              <option value="Roboto, sans-serif">Roboto</option>
              <option value="Georgia, serif">Georgia</option>
              <option value="monospace">Monospace</option>
            </select>
          </div>

          {/* Font Size & Weight */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-text-tertiary">Size (px)</span>
              <input
                type="number"
                min={8}
                max={72}
                value={selectedElement.fontSize || 12}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
                className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <span className="text-[10px] text-text-tertiary">Weight</span>
              <select
                value={selectedElement.fontWeight || "normal"}
                onChange={(e) =>
                  update({ fontWeight: e.target.value as DesignElement["fontWeight"] })
                }
                className="w-full rounded-md border border-border bg-surface-secondary px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="600">SemiBold</option>
                <option value="bold">Bold</option>
                <option value="800">ExtraBold</option>
              </select>
            </div>
          </div>

          {/* Text Alignment */}
          <div>
            <span className="text-[10px] text-text-tertiary">Text Alignment</span>
            <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-surface-secondary p-1 mt-0.5">
              <button
                onClick={() => update({ textAlign: "left" })}
                className={`flex items-center justify-center rounded p-1 ${
                  selectedElement.textAlign === "left"
                    ? "bg-accent text-white font-bold"
                    : "text-text-secondary hover:bg-surface"
                }`}
              >
                <AlignLeft className="h-3 w-3" />
              </button>
              <button
                onClick={() => update({ textAlign: "center" })}
                className={`flex items-center justify-center rounded p-1 ${
                  selectedElement.textAlign === "center"
                    ? "bg-accent text-white font-bold"
                    : "text-text-secondary hover:bg-surface"
                }`}
              >
                <AlignCenter className="h-3 w-3" />
              </button>
              <button
                onClick={() => update({ textAlign: "right" })}
                className={`flex items-center justify-center rounded p-1 ${
                  selectedElement.textAlign === "right"
                    ? "bg-accent text-white font-bold"
                    : "text-text-secondary hover:bg-surface"
                }`}
              >
                <AlignRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Text Color */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-text-tertiary">Text Color</span>
            <div className="flex items-center gap-1.5">
              <input
                type="color"
                value={selectedElement.textColor || "#1A1D20"}
                onChange={(e) => update({ textColor: e.target.value })}
                className="h-5 w-5 rounded border border-border cursor-pointer"
              />
              <span className="font-mono text-[11px]">{selectedElement.textColor || "#1A1D20"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
