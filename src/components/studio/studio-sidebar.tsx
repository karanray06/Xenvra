"use client";

import React, { useState, useRef } from "react";
import { useStudioStore, type StudioPanel } from "@/lib/studio/store";
import { ALL_STUDIO_TEMPLATES } from "@/lib/templates/manifest";
import { ALL_BRAND_PALETTE_CATEGORIES } from "@/lib/studio/brand-palettes";
import {
  ELEMENT_CATEGORIES,
  STUDIO_ELEMENT_LIBRARY,
} from "@/lib/studio/element-library";
import {
  STUDIO_TEXT_EFFECT_PRESETS,
  computeTextEffectStyles,
} from "@/lib/studio/text-effects";
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
  Search,
  UploadCloud,
  Sparkles,
  Info,
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
    setDoc,
    setDesignMeta,
    setSelectedElements,
    selectedElementIds,
  } = useStudioStore();

  const [templateCategory, setTemplateCategory] = useState<string>("All");
  const [templateSearch, setTemplateSearch] = useState<string>("");
  const [brandCategory, setBrandCategory] = useState<string>("all");
  const [elementCategory, setElementCategory] = useState<string>("all");
  const [elementSearch, setElementSearch] = useState<string>("");
  const [textFilterCategory, setTextFilterCategory] = useState<string>("all");
  const [textSearch, setTextSearch] = useState<string>("");
  const [activeHowToId, setActiveHowToId] = useState<string | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePage = doc.pages[activePageIndex] || doc.pages[0];

  const handleApplyColor = (hex: string) => {
    if (selectedElementIds.length > 0) {
      selectedElementIds.forEach((id) => {
        const el = activePage.elements.find((e) => e.id === id);
        if (el?.type === "text") updateElement(id, { color: hex });
        else if (el?.type === "shape") updateElement(id, { fill: hex });
        else if (el?.type === "frame") updateElement(id, { borderColor: hex });
        else if (el?.type === "icon") updateElement(id, { color: hex });
      });
    } else {
      const newPages = [...doc.pages];
      newPages[activePageIndex] = { ...activePage, background: hex };
      setDoc({ ...doc, pages: newPages });
      useStudioStore.setState({ isDirty: true });
    }
  };

  const handleCopyHex = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      setTimeout(() => setCopiedHex(null), 1800);
    }
  };

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const dataUrl = loadEvent.target?.result as string;
      if (!dataUrl) return;

      // Check if a frame is currently selected
      const selectedFrame = activePage.elements.find(
        (el) => selectedElementIds.includes(el.id) && el.type === "frame"
      );

      if (selectedFrame) {
        updateElement(selectedFrame.id, { imageSrc: dataUrl });
      } else {
        const img = new window.Image();
        img.onload = () => {
          const aspect = (img.naturalHeight || 300) / (img.naturalWidth || 400);
          const width = 360;
          const height = Math.round(width * aspect);
          addElement({
            id: `img-${Date.now()}`,
            name: file.name.slice(0, 20),
            type: "image",
            x: 120,
            y: 120,
            width,
            height,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: activePage.elements.length + 1,
            src: dataUrl,
          });
        };
        img.src = dataUrl;
      }
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const categories = [
    "All",
    "Presentations",
    "Resumes",
    "LinkedIn Banners",
    "Certificates",
    "Business Cards",
    "Cover Letters",
  ];

  const filteredTemplates = ALL_STUDIO_TEMPLATES.filter((t) => {
    if (templateCategory !== "All" && t.category !== templateCategory) return false;
    if (templateSearch.trim()) {
      const query = templateSearch.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(query);
      const matchDesc = t.description.toLowerCase().includes(query);
      const matchTag = t.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchTitle && !matchDesc && !matchTag) return false;
    }
    return true;
  });

  const filteredElements = STUDIO_ELEMENT_LIBRARY.filter((item) => {
    if (elementCategory !== "all" && item.category !== elementCategory) return false;
    if (elementSearch.trim()) {
      const query = elementSearch.toLowerCase();
      const matchName = item.name.toLowerCase().includes(query);
      const matchTag = item.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchCat = item.categoryLabel.toLowerCase().includes(query);
      if (!matchName && !matchTag && !matchCat) return false;
    }
    return true;
  });

  const TEXT_EFFECT_CATEGORIES = [
    { id: "all", label: "All (12)" },
    { id: "Built-in", label: "Built-in" },
    { id: "Layering Hack", label: "Layering" },
    { id: "Animation Effect", label: "Animation" },
    { id: "Frame Method", label: "Frame Mask" },
    { id: "AI Texture", label: "AI Texture" },
  ];

  const filteredTextPresets = STUDIO_TEXT_EFFECT_PRESETS.filter((preset) => {
    if (textFilterCategory !== "all" && preset.category !== textFilterCategory) return false;
    if (textSearch.trim()) {
      const q = textSearch.toLowerCase();
      const matchName = preset.name.toLowerCase().includes(q);
      const matchTag = preset.tagline.toLowerCase().includes(q);
      const matchBadge = preset.badge.toLowerCase().includes(q);
      if (!matchName && !matchTag && !matchBadge) return false;
    }
    return true;
  });

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

          {/* Panel: Templates */}
          {activePanel === "templates" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8A8F98]" />
                <input
                  type="text"
                  placeholder="Search 36+ templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#C9CCD1] bg-white placeholder-[#8A8F98] focus:outline-none focus:border-[#5A4032]"
                />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTemplateCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
                      templateCategory === cat
                        ? "bg-[#5A4032] text-white"
                        : "bg-[#F5F9FB] border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Templates List */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider">
                  {filteredTemplates.length} Templates Available
                </p>

                {filteredTemplates.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      const newDoc = t.getDoc();
                      setDoc(newDoc);
                      setDesignMeta(null, t.title, t.kind);
                      setActivePage(0);
                      setSelectedElements([]);
                    }}
                    className="group p-2.5 rounded-xl border border-[#C9CCD1] hover:border-[#5A4032] bg-[#FAF8F5] hover:bg-white cursor-pointer transition-all shadow-xs"
                  >
                    {/* Visual Card Preview */}
                    <div className="relative w-full h-24 mb-2 rounded-lg bg-[#E6EEF4] border border-[#C9CCD1] overflow-hidden flex flex-col items-center justify-center p-2 group-hover:border-[#5A4032]/40">
                      <div className="w-12 h-8 rounded bg-white/80 border border-[#C9CCD1] flex items-center justify-center text-[8px] font-bold text-[#5A4032] shadow-2xs">
                        {t.aspect}
                      </div>
                      <span className="text-[9px] font-medium text-[#5E534D] mt-1 text-center line-clamp-1">
                        {t.title}
                      </span>

                      {/* Tier Badge */}
                      <span
                        className={`absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          t.free
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#DCD3F2] text-[#5A4032]"
                        }`}
                      >
                        {t.free ? "Free" : "Pro"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <p className="text-xs font-bold text-[#241915] group-hover:text-[#5A4032] line-clamp-1">
                          {t.title}
                        </p>
                        <p className="text-[10px] text-[#5E534D] line-clamp-1 mt-0.5">
                          {t.category} · {t.dimensions.width}×{t.dimensions.height}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel: Elements */}
          {activePanel === "elements" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8A8F98]" />
                <input
                  type="text"
                  placeholder="Search 98+ elements (Y2K, Boho, Zine...)"
                  value={elementSearch}
                  onChange={(e) => setElementSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#C9CCD1] bg-white placeholder-[#8A8F98] focus:outline-none focus:border-[#5A4032]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {ELEMENT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setElementCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                      elementCategory === cat.id
                        ? "bg-[#5A4032] text-white shadow-xs"
                        : "bg-[#F5F9FB] border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                    }`}
                    title={cat.description}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name.split(",")[0].replace("Cute, ", "")}</span>
                  </button>
                ))}
              </div>

              {/* Active Category Description & Count */}
              <div className="flex items-center justify-between text-[10px] font-bold text-[#8A8F98] uppercase tracking-wider pt-1">
                <span>{filteredElements.length} Elements</span>
                <span className="text-[#5A4032]">
                  {ELEMENT_CATEGORIES.find((c) => c.id === elementCategory)?.emoji}{" "}
                  {ELEMENT_CATEGORIES.find((c) => c.id === elementCategory)?.name.split(",")[0]}
                </span>
              </div>

              {/* Curated Aesthetic Elements Grid */}
              <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
                {filteredElements.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      const newEl = item.createElement(140, 140, activePage.elements.length + 1);
                      addElement(newEl);
                    }}
                    className="group relative p-2 rounded-xl border border-[#C9CCD1] hover:border-[#5A4032] bg-[#FAF8F5] hover:bg-white cursor-pointer transition-all shadow-2xs hover:shadow-sm flex flex-col items-center"
                    title={`Click to drop: ${item.name}`}
                  >
                    <div
                      className="w-full h-20 bg-white rounded-lg border border-[#E6EEF4] flex items-center justify-center p-2 mb-1.5 overflow-hidden group-hover:scale-105 transition-transform"
                      dangerouslySetInnerHTML={{ __html: item.svgIcon }}
                    />
                    <p className="text-[10px] font-semibold text-[#241915] text-center line-clamp-1 w-full">
                      {item.name}
                    </p>
                    <span className="text-[8px] text-[#8A8F98] truncate w-full text-center">
                      {item.tags[0] || item.category}
                    </span>
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#5A4032] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                      <Plus className="h-3 w-3" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Shapes */}
              <section className="space-y-2 pt-2 border-t border-[#C9CCD1]">
                <p className="text-[11px] font-bold text-[#5E534D]">Quick Shapes</p>
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
                    className="h-10 border border-[#C9CCD1] rounded-lg bg-[#5A4032] hover:opacity-90 transition-opacity"
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
                    className="h-10 border border-[#C9CCD1] rounded-full bg-[#DCD3F2] hover:opacity-90 transition-opacity"
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
                    className="h-10 border border-[#C9CCD1] rounded-lg bg-white flex items-center justify-center p-2"
                    title="Add Divider"
                  >
                    <div className="w-full h-0.5 bg-[#C9CCD1]" />
                  </button>
                  <button
                    onClick={() =>
                      addElement({
                        id: `shape-${Date.now()}`,
                        name: "Pill Badge",
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
                    className="h-10 border border-[#C9CCD1] rounded-full bg-[#E6EEF4]"
                    title="Add Pill Badge"
                  />
                </div>
              </section>

              {/* Photo Frames ("Add Photo" Masks) */}
              <section className="space-y-2">
                <p className="text-[11px] font-bold text-[#5E534D]">Photo Frames</p>
                <div className="grid grid-cols-3 gap-2">
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
                    className="p-2.5 border border-dashed border-[#C9CCD1] rounded-lg bg-[#F6F1EE] hover:bg-[#E6EEF4] flex flex-col items-center gap-1 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full border border-dashed border-[#5A4032] flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-[#5A4032]" />
                    </div>
                    <span className="text-[9px] font-semibold text-[#241915]">Circle</span>
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
                    className="p-2.5 border border-dashed border-[#C9CCD1] rounded-lg bg-[#F6F1EE] hover:bg-[#E6EEF4] flex flex-col items-center gap-1 transition-colors"
                  >
                    <div className="w-10 h-7 rounded border border-dashed border-[#5A4032] flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-[#5A4032]" />
                    </div>
                    <span className="text-[9px] font-semibold text-[#241915]">Card</span>
                  </button>

                  <button
                    onClick={() =>
                      addElement({
                        id: `frame-polaroid-${Date.now()}`,
                        name: "Polaroid Frame",
                        type: "frame",
                        frameShape: "polaroid",
                        x: 150,
                        y: 150,
                        width: 240,
                        height: 300,
                        rotation: 0,
                        opacity: 1,
                        locked: false,
                        hidden: false,
                        zIndex: activePage.elements.length + 1,
                        placeholderText: "Drop Photo",
                        zoom: 1,
                        cropX: 0,
                        cropY: 0,
                        borderColor: "#D1D5DB",
                        borderWidth: 2,
                      })
                    }
                    className="p-2.5 border border-dashed border-[#C9CCD1] rounded-lg bg-[#F6F1EE] hover:bg-[#E6EEF4] flex flex-col items-center gap-1 transition-colors"
                  >
                    <div className="w-8 h-10 rounded border border-dashed border-[#5A4032] flex items-center justify-center">
                      <ImageIcon className="h-3.5 w-3.5 text-[#5A4032]" />
                    </div>
                    <span className="text-[9px] font-semibold text-[#241915]">Polaroid</span>
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
                    className="p-2.5 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] flex flex-col items-center gap-1 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 text-[#5A4032]" />
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
                    className="p-2.5 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] flex flex-col items-center gap-1 transition-colors"
                  >
                    <QrCode className="h-4 w-4 text-[#5A4032]" />
                    <span className="text-[10px] font-semibold text-[#241915]">Contact QR</span>
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* Panel: Text */}
          {activePanel === "text" && (
            <div className="space-y-4">
              {/* Search Bar for Text & Styles */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#8A8F98]" />
                <input
                  type="text"
                  placeholder="Search 12 text effects & styles..."
                  value={textSearch}
                  onChange={(e) => setTextSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#C9CCD1] bg-white placeholder-[#8A8F98] focus:outline-none focus:border-[#5A4032]"
                />
              </div>

              {/* Standard Typography Triggers */}
              <div className="space-y-2">
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
                  className="w-full py-2.5 px-3 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <p className="text-base font-extrabold text-[#241915]">Add Heading</p>
                    <p className="text-[10px] text-[#8A8F98]">48pt · Plus Jakarta Sans</p>
                  </div>
                  <Plus className="h-4 w-4 text-[#8A8F98] group-hover:text-[#5A4032]" />
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
                  className="w-full py-2 px-3 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#5A4032]">Add Subheading</p>
                    <p className="text-[10px] text-[#8A8F98]">24pt · Space Grotesk</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-[#8A8F98] group-hover:text-[#5A4032]" />
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
                  className="w-full py-2 px-3 border border-[#C9CCD1] rounded-lg hover:bg-[#F6F1EE] text-left transition-colors flex items-center justify-between group"
                >
                  <div>
                    <p className="text-xs font-normal text-[#241915]">Add Body Text</p>
                    <p className="text-[9px] text-[#8A8F98]">16pt · Inter</p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-[#8A8F98] group-hover:text-[#5A4032]" />
                </button>
              </div>

              {/* Section: Curated Text Effects & Styles */}
              <div className="pt-2 border-t border-[#C9CCD1] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#5A4032]" />
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#241915]">
                      Text Effects & Styles ({filteredTextPresets.length})
                    </p>
                  </div>
                </div>

                {/* Filter Category Pills */}
                <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {TEXT_EFFECT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setTextFilterCategory(cat.id)}
                      className={`px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap transition-colors ${
                        textFilterCategory === cat.id
                          ? "bg-[#5A4032] text-white"
                          : "bg-[#F5F9FB] border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Preset Cards List */}
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredTextPresets.map((preset) => {
                    const sampleEl = preset.createElement();
                    const effectStyle = computeTextEffectStyles(sampleEl);
                    const isHowToOpen = activeHowToId === preset.id;

                    return (
                      <div
                        key={preset.id}
                        className="p-2.5 rounded-xl border border-[#C9CCD1] hover:border-[#5A4032] bg-[#FAF8F5] hover:bg-white transition-all shadow-2xs group"
                      >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-[#241915]">
                            {preset.number}. {preset.name}
                          </span>
                          <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full bg-[#E6EEF4] text-[#5A4032] uppercase">
                            {preset.badge}
                          </span>
                        </div>

                        {/* Visual Preview Box */}
                        <div
                          onClick={() =>
                            addElement(
                              preset.createElement(
                                preset.sampleText,
                                120,
                                140,
                                activePage.elements.length + 1
                              )
                            )
                          }
                          className="w-full h-16 rounded-lg bg-[#1B1917] border border-[#C9CCD1] flex items-center justify-center p-2 mb-2 cursor-pointer hover:scale-[1.02] transition-transform overflow-hidden relative"
                          title={`Click to drop: ${preset.name}`}
                        >
                          <span
                            style={{
                              fontSize: `${Math.min(20, preset.defaultFontSize * 0.5)}px`,
                              fontFamily: preset.defaultFontFamily,
                              fontWeight: 800,
                              color: preset.defaultColor,
                              textAlign: "center",
                              letterSpacing: "1px",
                              ...effectStyle,
                            }}
                          >
                            {preset.sampleText}
                          </span>

                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-white/90 text-[#241915] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs">
                            <Plus className="h-3 w-3" />
                          </div>
                        </div>

                        {/* Tagline Description */}
                        <p className="text-[9px] text-[#5E534D] leading-relaxed mb-1.5">
                          {preset.tagline}
                        </p>

                        {/* How-to Toggle & Action */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#E6EEF4] text-[9px]">
                          <button
                            onClick={() =>
                              setActiveHowToId(isHowToOpen ? null : preset.id)
                            }
                            className="flex items-center gap-1 text-[#8A8F98] hover:text-[#5A4032] transition-colors"
                          >
                            <Info className="h-3 w-3" />
                            <span>{isHowToOpen ? "Hide guide" : "How to do it"}</span>
                          </button>
                          <button
                            onClick={() =>
                              addElement(
                                preset.createElement(
                                  preset.sampleText,
                                  120,
                                  140,
                                  activePage.elements.length + 1
                                )
                              )
                            }
                            className="font-semibold text-[#5A4032] hover:underline"
                          >
                            Apply to Canvas →
                          </button>
                        </div>

                        {/* Expanded How-To Instructions */}
                        {isHowToOpen && (
                          <div className="mt-2 p-2 bg-[#F5F9FB] rounded-lg border border-[#C9CCD1] text-[9px] text-[#241915] space-y-1">
                            <p className="font-bold text-[#5A4032]">
                              Canva & Studio Workflow:
                            </p>
                            <p className="leading-normal">{preset.howToDo}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Panel: Uploads */}
          {activePanel === "uploads" && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-[#5A4032] rounded-xl bg-[#F6F1EE] hover:bg-[#E6EEF4] flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-white border border-[#C9CCD1] flex items-center justify-center text-[#5A4032] shadow-xs">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-[#241915]">Upload an Image</p>
                  <p className="text-[10px] text-[#5E534D] mt-0.5">
                    PNG, JPG, SVG or WebP up to 5MB
                  </p>
                </div>
              </button>

              <div className="p-3 rounded-lg bg-[#E6EEF4]/60 border border-[#C9CCD1] text-[11px] text-[#5E534D] leading-relaxed">
                <p className="font-bold text-[#241915] mb-1">Photo Frames Tip</p>
                Select any photo frame on your canvas, then upload or drop an image to automatically fill the frame with perfect centering.
              </div>
            </div>
          )}

          {/* Panel: Brand Kit */}
          {activePanel === "brand" && (
            <div className="space-y-4">
              {/* Contextual instruction badge */}
              <div className="p-2.5 rounded-lg bg-[#E6EEF4] border border-[#C9CCD1] text-[11px] text-[#5A4032] flex items-center justify-between">
                <span>
                  {selectedElementIds.length > 0
                    ? `Click swatch to colour selected element (${selectedElementIds.length})`
                    : "Click swatch to set slide background"}
                </span>
                {copiedHex && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded animate-fade-in">
                    Copied {copiedHex}!
                  </span>
                )}
              </div>

              {/* Category Pills Filter */}
              <div className="flex gap-1 overflow-x-auto pb-1.5 no-scrollbar border-b border-[#C9CCD1]">
                {[
                  { id: "all", label: "All Palettes" },
                  { id: "core-identity", label: "Signature" },
                  { id: "desaturated-editorial", label: "Editorial" },
                  { id: "acid-muted-pastels", label: "Pastels" },
                  { id: "botanical-earth", label: "Botanical" },
                  { id: "brutalist-grays", label: "Brutalist" },
                  { id: "warm-solar", label: "Solar" },
                  { id: "deep-cosmic", label: "Cosmic Dark" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBrandCategory(tab.id)}
                    className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      brandCategory === tab.id
                        ? "bg-[#5A4032] text-white"
                        : "bg-[#F6F1EE] text-[#5E534D] hover:bg-[#E6EEF4] hover:text-[#241915]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Palette Categories List */}
              <div className="space-y-5 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
                {ALL_BRAND_PALETTE_CATEGORIES.filter(
                  (cat) => brandCategory === "all" || cat.id === brandCategory
                ).map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#241915]">{cat.name}</h4>
                        <span className="text-[9px] font-mono uppercase bg-[#E6EEF4] text-[#5A4032] px-1.5 py-0.5 rounded">
                          {cat.subtitle}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#5E534D] mt-0.5 leading-tight">
                        {cat.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5">
                      {cat.colors.map((color) => (
                        <div
                          key={color.hex + color.name}
                          onClick={() => handleApplyColor(color.hex)}
                          className="group flex items-center justify-between p-2 rounded-lg border border-[#C9CCD1] hover:border-[#5A4032] hover:bg-[#F6F1EE] cursor-pointer transition-all"
                          title={`${color.name} (${color.hex}) - ${color.description}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-6 h-6 rounded-md border border-black/10 shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#241915] truncate">
                                {color.name}
                              </p>
                              <p className="text-[9.5px] text-[#8A8F98] truncate max-w-[170px]">
                                {color.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 pl-1">
                            <span className="text-[10px] font-mono text-[#5E534D]">
                              {color.hex}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyHex(color.hex, e)}
                              title="Copy hex code"
                              className="p-1 rounded text-[#8A8F98] hover:text-[#241915] hover:bg-white transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
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
