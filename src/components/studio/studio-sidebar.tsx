"use client";

import React from "react";
import { useStudioStore, type StudioPanel } from "@/lib/studio/store";
import {
  LayoutTemplate,
  Shapes,
  Type,
  Upload,
  Palette,
  Layers,
  FileStack,
  CheckCircle2,
  Plus,
  Trash2,
  Copy,
  Lock,
  Eye,
  EyeOff,
  QrCode,
  BarChart3,
  Image as ImageIcon,
} from "lucide-react";

export function StudioSidebar() {
  const {
    doc,
    activePanel,
    setActivePanel,
    addElement,
    activePageIndex,
    setActivePage,
    addPage,
    duplicatePage,
    deletePage,
    updateElement,
  } = useStudioStore();

  const activePage = doc.pages[activePageIndex] || doc.pages[0];

  const NAV_ITEMS: { id: StudioPanel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "templates", label: "Templates", icon: LayoutTemplate },
    { id: "elements", label: "Elements", icon: Shapes },
    { id: "text", label: "Text", icon: Type },
    { id: "uploads", label: "Uploads", icon: Upload },
    { id: "brand", label: "Brand Kit", icon: Palette },
    { id: "layers", label: "Layers", icon: Layers },
    { id: "pages", label: "Pages", icon: FileStack },
    { id: "ats", label: "ATS Score", icon: CheckCircle2 },
  ];

  return (
    <aside className="flex h-full border-r border-[#C9CCD1] bg-white z-30 select-none">
      {/* 1. Primary Icon Rail */}
      <div className="w-16 border-r border-[#C9CCD1] flex flex-col items-center py-3 gap-1 bg-[#F5F9FB]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePanel(isActive ? null : item.id)}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? "bg-[#5A4032] text-white shadow-xs"
                  : "text-[#5E534D] hover:bg-[#E6EEF4] hover:text-[#241915]"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Flyout Drawer Panel */}
      {activePanel && (
        <div className="w-72 bg-white flex flex-col h-full overflow-y-auto border-r border-[#C9CCD1] p-4 shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#C9CCD1] mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#241915]">
              {NAV_ITEMS.find((n) => n.id === activePanel)?.label}
            </h2>
            <button
              onClick={() => setActivePanel(null)}
              className="text-xs text-[#8A8F98] hover:text-[#241915]"
            >
              Close
            </button>
          </div>

          {/* Panel: Elements */}
          {activePanel === "elements" && (
            <div className="space-y-5">
              {/* Shapes */}
              <section className="space-y-2">
                <p className="text-[11px] font-bold text-[#5E534D]">Basic Shapes</p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() =>
                      addElement({
                        id: `shape-${Date.now()}`,
                        name: "Rectangle",
                        type: "shape",
                        shapeType: "rect",
                        x: 100,
                        y: 100,
                        width: 160,
                        height: 100,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        fill: "#5A4032",
                        cornerRadius: 8,
                      })
                    }
                    className="h-12 border border-[#C9CCD1] rounded-lg bg-[#5A4032] hover:opacity-90 transition-opacity"
                    title="Add Rectangle"
                  />
                  <button
                    onClick={() =>
                      addElement({
                        id: `shape-${Date.now()}`,
                        name: "Circle",
                        type: "shape",
                        shapeType: "ellipse",
                        x: 100,
                        y: 100,
                        width: 120,
                        height: 120,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        fill: "#DCD3F2",
                        cornerRadius: 0,
                      })
                    }
                    className="h-12 border border-[#C9CCD1] rounded-full bg-[#DCD3F2] hover:opacity-90 transition-opacity"
                    title="Add Circle"
                  />
                  <button
                    onClick={() =>
                      addElement({
                        id: `shape-${Date.now()}`,
                        name: "Divider",
                        type: "shape",
                        shapeType: "rect",
                        x: 100,
                        y: 100,
                        width: 400,
                        height: 2,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        fill: "#C9CCD1",
                        cornerRadius: 0,
                      })
                    }
                    className="h-12 border border-[#C9CCD1] rounded-lg bg-white flex items-center justify-center p-2"
                    title="Add Divider"
                  >
                    <div className="w-full h-0.5 bg-[#C9CCD1]" />
                  </button>
                  <button
                    onClick={() =>
                      addElement({
                        id: `shape-${Date.now()}`,
                        name: "Ice Badge",
                        type: "shape",
                        shapeType: "rect",
                        x: 100,
                        y: 100,
                        width: 140,
                        height: 40,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        fill: "#E6EEF4",
                        cornerRadius: 20,
                      })
                    }
                    className="h-12 border border-[#C9CCD1] rounded-full bg-[#E6EEF4]"
                    title="Add Pill Badge"
                  />
                </div>
              </section>

              {/* Photo Frames ("Add Photo" Masks) */}
              <section className="space-y-2">
                <p className="text-[11px] font-bold text-[#5E534D]">Photo Frames</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      addElement({
                        id: `frame-${Date.now()}`,
                        name: "Circular Frame",
                        type: "frame",
                        frameShape: "circle",
                        x: 150,
                        y: 150,
                        width: 240,
                        height: 240,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        placeholderText: "Add Photo",
                        zoom: 1,
                        cropX: 0,
                        cropY: 0,
                        borderColor: "#C9CCD1",
                        borderWidth: 2,
                      })
                    }
                    className="p-3 border border-dashed border-[#C9CCD1] rounded-lg bg-[#F6F1EE] hover:bg-[#E6EEF4] flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full border border-dashed border-[#5A4032] flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-[#5A4032]" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#241915]">Circle Frame</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        id: `frame-${Date.now()}`,
                        name: "Rounded Frame",
                        type: "frame",
                        frameShape: "rounded",
                        x: 150,
                        y: 150,
                        width: 300,
                        height: 200,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        placeholderText: "Add Photo",
                        zoom: 1,
                        cropX: 0,
                        cropY: 0,
                        borderColor: "#C9CCD1",
                        borderWidth: 2,
                      })
                    }
                    className="p-3 border border-dashed border-[#C9CCD1] rounded-lg bg-[#F6F1EE] hover:bg-[#E6EEF4] flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <div className="w-12 h-8 rounded-lg border border-dashed border-[#5A4032] flex items-center justify-center">
                      <ImageIcon className="h-4 w-4 text-[#5A4032]" />
                    </div>
                    <span className="text-[10px] font-semibold text-[#241915]">Rounded Card</span>
                  </button>
                </div>
              </section>

              {/* Data & Interactive Elements */}
              <section className="space-y-2">
                <p className="text-[11px] font-bold text-[#5E534D]">Interactive Widgets</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      addElement({
                        id: `chart-${Date.now()}`,
                        name: "Metrics Chart",
                        type: "chart",
                        chartType: "bar",
                        title: "Growth Metrics",
                        x: 100,
                        y: 100,
                        width: 320,
                        height: 200,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        data: [
                          { label: "Q1", value: 40 },
                          { label: "Q2", value: 75 },
                          { label: "Q3", value: 110 },
                          { label: "Q4", value: 145 },
                        ],
                        colors: ["#5A4032", "#7B66B8", "#DCD3F2", "#C9CCD1"],
                      })
                    }
                    className="p-3 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <BarChart3 className="h-5 w-5 text-[#5A4032]" />
                    <span className="text-[10px] font-semibold text-[#241915]">Bar Chart</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        id: `qr-${Date.now()}`,
                        name: "QR Code",
                        type: "qr",
                        value: "https://xenvraresume.vercel.app",
                        x: 100,
                        y: 100,
                        width: 140,
                        height: 140,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        color: "#241915",
                        backgroundColor: "#FFFFFF",
                      })
                    }
                    className="p-3 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] flex flex-col items-center gap-1.5 transition-colors"
                  >
                    <QrCode className="h-5 w-5 text-[#5A4032]" />
                    <span className="text-[10px] font-semibold text-[#241915]">Contact QR</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Panel: Text */}
          {activePanel === "text" && (
            <div className="space-y-4">
              <button
                onClick={() =>
                  addElement({
                    id: `text-${Date.now()}`,
                    name: "Title Heading",
                    type: "text",
                    content: "Add a Big Heading",
                    x: 100,
                    y: 100,
                    width: 600,
                    height: 80,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    hidden: false,
                    zIndex: activePage.elements.length + 1,
                    fontSize: 48,
                    fontFamily: "Plus Jakarta Sans",
                    fontWeight: 800,
                    fontStyle: "normal",
                    color: "#241915",
                    align: "left",
                    lineHeight: 1.2,
                    letterSpacing: -0.5,
                    underline: false,
                    uppercase: false,
                  })
                }
                className="w-full py-3 px-4 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] text-left transition-colors"
              >
                <p className="text-xl font-extrabold text-[#241915]">Add Heading</p>
                <p className="text-[10px] text-[#8A8F98]">48pt · Plus Jakarta Sans</p>
              </button>

              <button
                onClick={() =>
                  addElement({
                    id: `text-${Date.now()}`,
                    name: "Subheading",
                    type: "text",
                    content: "Add a Subtitle or Section Lead",
                    x: 100,
                    y: 100,
                    width: 500,
                    height: 50,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    hidden: false,
                    zIndex: activePage.elements.length + 1,
                    fontSize: 24,
                    fontFamily: "Space Grotesk",
                    fontWeight: 600,
                    fontStyle: "normal",
                    color: "#5A4032",
                    align: "left",
                    lineHeight: 1.3,
                    letterSpacing: 0,
                    underline: false,
                    uppercase: false,
                  })
                }
                className="w-full py-3 px-4 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] text-left transition-colors"
              >
                <p className="text-base font-semibold text-[#5A4032]">Add Subheading</p>
                <p className="text-[10px] text-[#8A8F98]">24pt · Space Grotesk</p>
              </button>

              <button
                onClick={() =>
                  addElement({
                    id: `text-${Date.now()}`,
                    name: "Paragraph Body",
                    type: "text",
                    content:
                      "Include rich descriptive paragraphs, bullet metrics, and highlights here.",
                    x: 100,
                    y: 100,
                    width: 480,
                    height: 80,
                    rotation: 0,
                    opacity: 1,
                    locked: false,
                    hidden: false,
                    zIndex: activePage.elements.length + 1,
                    fontSize: 16,
                    fontFamily: "Inter",
                    fontWeight: 400,
                    fontStyle: "normal",
                    color: "#241915",
                    align: "left",
                    lineHeight: 1.5,
                    letterSpacing: 0,
                    underline: false,
                    uppercase: false,
                  })
                }
                className="w-full py-3 px-4 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] text-left transition-colors"
              >
                <p className="text-sm font-normal text-[#241915]">Add Body Text</p>
                <p className="text-[10px] text-[#8A8F98]">16pt · Inter</p>
              </button>
            </div>
          )}

          {/* Panel: Brand Kit */}
          {activePanel === "brand" && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#241915] mb-2">Core 5 Brand Colours</p>
                <div className="space-y-2">
                  {[
                    { name: "Ice Silver", hex: "#E6EEF4" },
                    { name: "Mocha Brown", hex: "#5A4032" },
                    { name: "Platinum Silver", hex: "#C9CCD1" },
                    { name: "Pale Lavender", hex: "#DCD3F2" },
                    { name: "Charcoal Ink", hex: "#241915" },
                  ].map((color) => (
                    <div
                      key={color.hex}
                      className="flex items-center justify-between p-2 rounded-lg border border-[#C9CCD1]"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded-md border border-[#C9CCD1]"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-semibold text-[#241915]">
                          {color.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#5E534D]">
                        {color.hex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Panel: Layers */}
          {activePanel === "layers" && (
            <div className="space-y-1.5">
              {activePage.elements.length === 0 ? (
                <p className="text-xs text-[#8A8F98] italic text-center py-6">
                  No elements on this slide.
                </p>
              ) : (
                activePage.elements
                  .slice()
                  .reverse()
                  .map((el) => (
                    <div
                      key={el.id}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg border border-[#C9CCD1] hover:bg-[#F6F1EE] text-xs transition-colors"
                    >
                      <span className="font-medium text-[#241915] truncate max-w-[140px]">
                        {el.name}
                      </span>
                      <div className="flex items-center gap-1 text-[#8A8F98]">
                        <button
                          onClick={() => updateElement(el.id, { hidden: !el.hidden })}
                          className="p-1 hover:text-[#241915]"
                          title={el.hidden ? "Unhide" : "Hide"}
                        >
                          {el.hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => updateElement(el.id, { locked: !el.locked })}
                          className={`p-1 hover:text-[#241915] ${el.locked ? "text-[#5A4032]" : ""}`}
                          title={el.locked ? "Unlock" : "Lock"}
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Panel: Pages Strip */}
          {activePanel === "pages" && (
            <div className="space-y-3">
              <button
                onClick={() => addPage()}
                className="w-full py-2.5 border-2 border-dashed border-[#5A4032] rounded-lg text-xs font-bold text-[#5A4032] hover:bg-[#F6F1EE] flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add New Slide</span>
              </button>

              <div className="space-y-2 pt-2">
                {doc.pages.map((p, idx) => (
                  <div
                    key={p.id}
                    onClick={() => setActivePage(idx)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      idx === activePageIndex
                        ? "border-[#5A4032] bg-[#F6F1EE] ring-1 ring-[#5A4032]"
                        : "border-[#C9CCD1] hover:border-[#8A8F98] bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#241915]">
                        {idx + 1}. {p.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicatePage(idx);
                          }}
                          title="Duplicate slide"
                          className="p-1 text-[#8A8F98] hover:text-[#241915]"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                        {doc.pages.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deletePage(idx);
                            }}
                            title="Delete slide"
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="h-16 rounded bg-white border border-[#C9CCD1] flex items-center justify-center text-[10px] text-[#8A8F98]">
                      {p.elements.length} elements
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel: ATS Score (Realtime check) */}
          {activePanel === "ats" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#F6F1EE] border border-[#C9CCD1] text-center">
                <span className="text-3xl font-extrabold text-[#5A4032]">94</span>
                <span className="text-xs font-semibold text-[#8A8F98]"> / 100</span>
                <p className="text-xs font-bold text-[#241915] mt-1">High ATS Pass Rate</p>
                <p className="text-[10px] text-[#5E534D] mt-0.5">
                  100% extractable vector text layer detected.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-bold text-[#241915]">ATS Checklist</p>
                <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Standard contact info present</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Chronological experience section</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>No rasterized text or scanned bitmaps</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
