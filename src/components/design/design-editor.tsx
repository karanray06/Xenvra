"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { DesignElement, ElementType } from "./types";
import { A4_PRESET } from "./types";
import { DesignToolbar } from "./design-toolbar";
import { LayerPanel } from "./layer-panel";
import { PropertiesPanel } from "./properties-panel";
import { DesignCanvas } from "./design-canvas";
import { convertResumeToDesignElements } from "./convert-resume";
import { useResume } from "@/components/builder/resume-provider";

interface DesignEditorProps {
  onBackToTemplate: () => void;
  initialDesignJson?: { elements?: DesignElement[] } | null;
}

export function DesignEditor({
  onBackToTemplate,
  initialDesignJson,
}: DesignEditorProps) {
  const { id, title, data } = useResume();

  // Initialize elements from saved design_json, or convert current structured resume data
  const [elements, setElements] = useState<DesignElement[]>(() => {
    if (initialDesignJson?.elements && Array.isArray(initialDesignJson.elements) && initialDesignJson.elements.length > 0) {
      return initialDesignJson.elements;
    }
    return convertResumeToDesignElements(data);
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(0.85); // 85% default fits nicely on desktop screens
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Undo / Redo History Stack
  const [history, setHistory] = useState<DesignElement[][]>([elements]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pushHistory = useCallback(
    (newElements: DesignElement[]) => {
      const sliced = history.slice(0, historyIndex + 1);
      setHistory([...sliced, newElements]);
      setHistoryIndex(sliced.length);

      // Trigger debounced autosave of design_json
      if (id) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
          try {
            await fetch(`/api/resumes/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                design_json: { elements: newElements },
              }),
            });
          } catch {
            // autosave error handled silently
          }
        }, 1500);
      }
    },
    [history, historyIndex, id]
  );

  const updateElement = (elemId: string, updates: Partial<DesignElement>) => {
    const next = elements.map((e) => (e.id === elemId ? { ...e, ...updates } : e));
    setElements(next);
    pushHistory(next);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setElements(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setElements(next);
    }
  };

  // Add new elements
  const addElement = (type: ElementType) => {
    const newId = `${type}_${Date.now()}`;
    let newElement: DesignElement;

    switch (type) {
      case "text":
        newElement = {
          id: newId,
          type: "text",
          name: "Text Block",
          x: 60,
          y: 80,
          width: 320,
          height: 36,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          fill: "transparent",
          text: "Double-click to edit text",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: 14,
          fontWeight: "medium",
          textAlign: "left",
          textColor: "#1A1D20",
        };
        break;
      case "rect":
        newElement = {
          id: newId,
          type: "rect",
          name: "Rectangle",
          x: 60,
          y: 80,
          width: 240,
          height: 80,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          fill: "#5A4032", // Mocha Brown
          borderRadius: 8,
        };
        break;
      case "circle":
        newElement = {
          id: newId,
          type: "circle",
          name: "Circle",
          x: 60,
          y: 80,
          width: 90,
          height: 90,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          fill: "#E6EEF4", // Ice Silver
          stroke: "#5A4032",
          strokeWidth: 2,
        };
        break;
      case "line":
        newElement = {
          id: newId,
          type: "line",
          name: "Divider Line",
          x: 40,
          y: 100,
          width: 714,
          height: 2,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          fill: "#C9CCD1",
        };
        break;
      case "badge":
        newElement = {
          id: newId,
          type: "badge",
          name: "Skill Chip",
          x: 60,
          y: 80,
          width: 110,
          height: 24,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          fill: "#DCD3F2", // Pale Lavender
          borderRadius: 12,
          text: "New Skill",
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: 10,
          fontWeight: "600",
          textAlign: "center",
          textColor: "#1A1D20",
        };
        break;
    }

    const next = [...elements, newElement];
    setElements(next);
    setSelectedId(newId);
    pushHistory(next);
  };

  const deleteElement = (elemId: string) => {
    const next = elements.filter((e) => e.id !== elemId);
    setElements(next);
    if (selectedId === elemId) setSelectedId(null);
    pushHistory(next);
  };

  const duplicateElement = (elemId: string) => {
    const orig = elements.find((e) => e.id === elemId);
    if (!orig) return;

    const copy: DesignElement = {
      ...orig,
      id: `${orig.type}_${Date.now()}`,
      name: `${orig.name} (Copy)`,
      x: Math.min(A4_PRESET.width - orig.width, orig.x + 20),
      y: Math.min(A4_PRESET.height - orig.height, orig.y + 20),
    };

    const next = [...elements, copy];
    setElements(next);
    setSelectedId(copy.id);
    pushHistory(next);
  };

  const convertFromResume = () => {
    if (confirm("Replace artboard canvas with elements converted from your current resume data?")) {
      const converted = convertResumeToDesignElements(data);
      setElements(converted);
      setSelectedId(null);
      pushHistory(converted);
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          deleteElement(selectedId);
        }
      } else if (e.key === "Escape") {
        setSelectedId(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "d") {
        e.preventDefault();
        if (selectedId) duplicateElement(selectedId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Vector Export Handlers
  const exportSvg = () => {
    const svgElem = document.querySelector("svg");
    if (!svgElem) return;

    // Clone and serialize
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElem);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title.trim() || "Resume").replace(/[^a-zA-Z0-9_\-\s]/g, "")}_design.svg`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportPng = () => {
    const svgElem = document.querySelector("svg");
    if (!svgElem) return;

    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElem);
    const img = new Image();
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = A4_PRESET.width * 2; // 2x for sharp print quality
      canvas.height = A4_PRESET.height * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = `${(title.trim() || "Resume").replace(/[^a-zA-Z0-9_\-\s]/g, "")}_design.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const exportPdf = () => {
    window.print();
  };

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  return (
    <div className="flex h-full w-full flex-col bg-surface overflow-hidden">
      {/* Top Toolbar */}
      <DesignToolbar
        onBackToTemplate={onBackToTemplate}
        onAddElement={addElement}
        onConvertFromResume={convertFromResume}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        zoom={zoom}
        onZoomChange={setZoom}
        showGrid={showGrid}
        onToggleGrid={() => {
          setShowGrid(!showGrid);
          setSnapToGrid(!snapToGrid);
        }}
        onExportSvg={exportSvg}
        onExportPng={exportPng}
        onExportPdf={exportPdf}
      />

      {/* Main Studio Viewport */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Layers */}
        <LayerPanel
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onDuplicateElement={duplicateElement}
          onReorderElements={(reordered) => {
            setElements(reordered);
            pushHistory(reordered);
          }}
        />

        {/* Center: A4 Interactive Vector Artboard */}
        <DesignCanvas
          elements={elements}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onUpdateElement={updateElement}
          zoom={zoom}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
        />

        {/* Right: Properties Inspector */}
        <PropertiesPanel
          selectedElement={selectedElement}
          onUpdateElement={updateElement}
        />
      </div>
    </div>
  );
}
