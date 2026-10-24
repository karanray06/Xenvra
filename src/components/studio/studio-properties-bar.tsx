"use client";

import React, { useState } from "react";
import { useStudioStore } from "@/lib/studio/store";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Copy,
  Lock,
  Unlock,
  BringToFront,
  SendToBack,
  ChevronDown,
} from "lucide-react";

import { ALL_BRAND_PALETTE_CATEGORIES } from "@/lib/studio/brand-palettes";

const FONTS = [
  "Plus Jakarta Sans",
  "Inter",
  "Space Grotesk",
  "DM Serif Display",
  "Playfair Display",
  "Poppins",
  "Montserrat",
  "Lora",
  "Oswald",
  "Bebas Neue",
  "JetBrains Mono",
  "Noto Sans Devanagari",
  "Noto Sans Bengali",
];

export function StudioPropertiesBar() {
  const {
    doc,
    activePageIndex,
    selectedElementIds,
    updateSelectedElements,
    deleteSelectedElements,
    duplicateSelectedElements,
    alignSelectedElements,
    reorderElementZ,
  } = useStudioStore();

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [paletteTab, setPaletteTab] = useState<string>("all");

  const activePage = doc.pages[activePageIndex] || doc.pages[0];
  const selected = activePage.elements.find((el) => selectedElementIds.includes(el.id));

  if (!selected) {
    return (
      <div className="h-10 border-b border-[#C9CCD1] bg-[#F5F9FB] px-4 flex items-center justify-between text-xs text-[#5E534D] select-none">
        <span>Click any element or drag to select and edit properties</span>
        <span className="font-mono text-[10px]">Canvas: {activePage.width} × {activePage.height} px</span>
      </div>
    );
  }

  const isText = selected.type === "text";
  const isShape = selected.type === "shape";

  return (
    <div className="h-11 border-b border-[#C9CCD1] bg-white px-4 flex items-center justify-between gap-3 select-none z-30">
      {/* Left: Typography or Geometry Controls */}
      <div className="flex items-center gap-2">
        {/* Font Family (for text) */}
        {isText && (
          <>
            <select
              value={selected.fontFamily}
              onChange={(e) => updateSelectedElements({ fontFamily: e.target.value })}
              className="text-xs font-medium text-[#241915] bg-[#F6F1EE] border border-[#C9CCD1] rounded-md px-2 py-1 outline-none max-w-[140px]"
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            {/* Font Size */}
            <div className="flex items-center border border-[#C9CCD1] rounded-md bg-[#F6F1EE] overflow-hidden">
              <button
                onClick={() =>
                  updateSelectedElements({ fontSize: Math.max(8, selected.fontSize - 2) })
                }
                className="px-2 py-0.5 text-xs hover:bg-white text-[#241915]"
              >
                -
              </button>
              <input
                type="number"
                value={selected.fontSize}
                onChange={(e) =>
                  updateSelectedElements({ fontSize: Number(e.target.value) || 12 })
                }
                className="w-10 text-center text-xs font-semibold bg-transparent outline-none text-[#241915]"
              />
              <button
                onClick={() =>
                  updateSelectedElements({ fontSize: Math.min(200, selected.fontSize + 2) })
                }
                className="px-2 py-0.5 text-xs hover:bg-white text-[#241915]"
              >
                +
              </button>
            </div>

            {/* Text Styling */}
            <div className="flex items-center gap-0.5 border border-[#C9CCD1] rounded-md p-0.5 bg-[#F6F1EE]">
              <button
                onClick={() =>
                  updateSelectedElements({
                    fontWeight: selected.fontWeight === 700 ? 400 : 700,
                  })
                }
                className={`p-1 rounded text-xs ${
                  selected.fontWeight === 700 ? "bg-white text-[#5A4032] shadow-xs" : "text-[#241915]"
                }`}
              >
                <Bold className="h-3 w-3" />
              </button>
              <button
                onClick={() =>
                  updateSelectedElements({
                    fontStyle: selected.fontStyle === "italic" ? "normal" : "italic",
                  })
                }
                className={`p-1 rounded text-xs ${
                  selected.fontStyle === "italic"
                    ? "bg-white text-[#5A4032] shadow-xs"
                    : "text-[#241915]"
                }`}
              >
                <Italic className="h-3 w-3" />
              </button>
              <button
                onClick={() =>
                  updateSelectedElements({ underline: !selected.underline })
                }
                className={`p-1 rounded text-xs ${
                  selected.underline ? "bg-white text-[#5A4032] shadow-xs" : "text-[#241915]"
                }`}
              >
                <Underline className="h-3 w-3" />
              </button>
            </div>

            {/* Text Align */}
            <div className="flex items-center gap-0.5 border border-[#C9CCD1] rounded-md p-0.5 bg-[#F6F1EE]">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateSelectedElements({ align })}
                  className={`p-1 rounded text-xs capitalize ${
                    selected.align === align
                      ? "bg-white text-[#5A4032] shadow-xs"
                      : "text-[#241915]"
                  }`}
                >
                  {align === "left" && <AlignLeft className="h-3 w-3" />}
                  {align === "center" && <AlignCenter className="h-3 w-3" />}
                  {align === "right" && <AlignRight className="h-3 w-3" />}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Shape Corner Radius */}
        {isShape && (
          <div className="flex items-center gap-1.5 text-xs text-[#5E534D]">
            <span>Radius:</span>
            <input
              type="number"
              min="0"
              max="100"
              value={selected.cornerRadius || 0}
              onChange={(e) =>
                updateSelectedElements({ cornerRadius: Number(e.target.value) || 0 })
              }
              className="w-12 text-center py-0.5 border border-[#C9CCD1] rounded bg-[#F6F1EE] text-[#241915] text-xs font-semibold outline-none"
            />
          </div>
        )}

        {/* Color Swatch Trigger */}
        <div className="relative">
          <button
            onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
            className="flex items-center gap-1.5 px-2 py-1 border border-[#C9CCD1] rounded-md bg-[#F6F1EE] hover:bg-white transition-colors"
          >
            <div
              className="w-4 h-4 rounded border border-[#C9CCD1]"
              style={{
                backgroundColor: isText
                  ? selected.color
                  : isShape
                  ? selected.fill
                  : "#5A4032",
              }}
            />
            <span className="text-xs font-mono font-medium text-[#241915]">
              {isText ? selected.color : isShape ? selected.fill : "#5A4032"}
            </span>
            <ChevronDown className="h-3 w-3 text-[#8A8F98]" />
          </button>

          {/* Brand Palette Swatches Popup */}
          {isColorPickerOpen && (
            <div className="absolute top-full left-0 mt-1 p-2.5 bg-white rounded-xl shadow-2xl border border-[#C9CCD1] z-50 w-72 space-y-2">
              <div className="flex items-center justify-between border-b border-[#C9CCD1] pb-1.5">
                <span className="text-[11px] font-bold text-[#241915]">Brand Palette</span>
                <span className="text-[10px] text-[#8A8F98]">59 Curated Tones</span>
              </div>

              {/* Category selector pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                {[
                  { id: "all", label: "All" },
                  { id: "core-identity", label: "Core" },
                  { id: "desaturated-editorial", label: "Editorial" },
                  { id: "acid-muted-pastels", label: "Pastels" },
                  { id: "botanical-earth", label: "Botanical" },
                  { id: "brutalist-grays", label: "Brutalist" },
                  { id: "warm-solar", label: "Solar" },
                  { id: "deep-cosmic", label: "Cosmic" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPaletteTab(tab.id)}
                    className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition-colors ${
                      paletteTab === tab.id
                        ? "bg-[#5A4032] text-white"
                        : "bg-[#F6F1EE] text-[#5E534D] hover:bg-[#E6EEF4]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Swatches view */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {ALL_BRAND_PALETTE_CATEGORIES.filter(
                  (cat) => paletteTab === "all" || cat.id === paletteTab
                ).map((cat) => (
                  <div key={cat.id}>
                    <p className="text-[10px] font-semibold text-[#8A8F98] mb-1">
                      {cat.name}
                    </p>
                    <div className="grid grid-cols-9 gap-1">
                      {cat.colors.map((swatch) => (
                        <button
                          key={swatch.hex + swatch.name}
                          onClick={() => {
                            if (isText) updateSelectedElements({ color: swatch.hex });
                            if (isShape) updateSelectedElements({ fill: swatch.hex });
                            setIsColorPickerOpen(false);
                          }}
                          title={`${swatch.name} (${swatch.hex})\n${swatch.description}`}
                          className="w-6 h-6 rounded border border-black/15 hover:scale-125 hover:z-10 transition-transform shadow-2xs"
                          style={{ backgroundColor: swatch.hex }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Hex Picker Input */}
              <div className="pt-2 border-t border-[#C9CCD1] flex items-center justify-between gap-2">
                <span className="text-[10px] text-[#5E534D]">Custom Hex:</span>
                <input
                  type="text"
                  value={isText ? selected.color : isShape ? selected.fill : "#5A4032"}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (isText) updateSelectedElements({ color: val });
                    if (isShape) updateSelectedElements({ fill: val });
                  }}
                  className="font-mono text-[11px] px-2 py-0.5 rounded border border-[#C9CCD1] w-24 text-center focus:border-[#5A4032] outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Alignments, Duplicate, Delete, Layer order */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => alignSelectedElements("left")}
          title="Align Left"
          className="p-1.5 rounded hover:bg-[#F6F1EE] text-[#241915] transition-colors"
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => alignSelectedElements("center")}
          title="Align Center"
          className="p-1.5 rounded hover:bg-[#F6F1EE] text-[#241915] transition-colors"
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => alignSelectedElements("right")}
          title="Align Right"
          className="p-1.5 rounded hover:bg-[#F6F1EE] text-[#241915] transition-colors"
        >
          <AlignRight className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-[#C9CCD1] mx-1" />

        <button
          onClick={() => reorderElementZ(selected.id, "forward")}
          title="Bring Forward"
          className="p-1.5 rounded hover:bg-[#F6F1EE] text-[#241915] transition-colors"
        >
          <BringToFront className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => reorderElementZ(selected.id, "backward")}
          title="Send Backward"
          className="p-1.5 rounded hover:bg-[#F6F1EE] text-[#241915] transition-colors"
        >
          <SendToBack className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-[#C9CCD1] mx-1" />

        <button
          onClick={duplicateSelectedElements}
          title="Duplicate Element (Ctrl+D)"
          className="p-1.5 rounded hover:bg-[#F6F1EE] text-[#241915] transition-colors"
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => updateSelectedElements({ locked: !selected.locked })}
          title={selected.locked ? "Unlock" : "Lock"}
          className={`p-1.5 rounded hover:bg-[#F6F1EE] transition-colors ${
            selected.locked ? "text-[#5A4032]" : "text-[#241915]"
          }`}
        >
          {selected.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={deleteSelectedElements}
          title="Delete (Backspace)"
          className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
