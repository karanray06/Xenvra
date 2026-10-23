"use client";

import { useState } from "react";
import type { DesignElement } from "./types";
import {
  Type,
  Square,
  Circle,
  Minus,
  Tag,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Layers,
  Search,
} from "lucide-react";

interface LayerPanelProps {
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElements: (newElements: DesignElement[]) => void;
}

export function LayerPanel({
  elements,
  selectedId,
  onSelect,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElements,
}: LayerPanelProps) {
  const [search, setSearch] = useState("");

  const filteredElements = [...elements]
    .reverse() // Display top layers at the top of the panel like Penpot
    .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  const getIcon = (type: DesignElement["type"]) => {
    switch (type) {
      case "text":
        return <Type className="h-3.5 w-3.5 text-accent" />;
      case "rect":
        return <Square className="h-3.5 w-3.5 text-blue-600" />;
      case "circle":
        return <Circle className="h-3.5 w-3.5 text-emerald-600" />;
      case "line":
        return <Minus className="h-3.5 w-3.5 text-amber-600" />;
      case "badge":
        return <Tag className="h-3.5 w-3.5 text-purple-600" />;
    }
  };

  const moveLayer = (id: string, direction: "up" | "down") => {
    const idx = elements.findIndex((e) => e.id === id);
    if (idx === -1) return;

    const newElems = [...elements];
    if (direction === "up" && idx < elements.length - 1) {
      const temp = newElems[idx];
      newElems[idx] = newElems[idx + 1];
      newElems[idx + 1] = temp;
      onReorderElements(newElems);
    } else if (direction === "down" && idx > 0) {
      const temp = newElems[idx];
      newElems[idx] = newElems[idx - 1];
      newElems[idx - 1] = temp;
      onReorderElements(newElems);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3.5 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Layers ({elements.length})
          </h3>
        </div>
      </div>

      {/* Layer Search */}
      <div className="border-b border-border px-2.5 py-2">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search layers..."
            className="w-full rounded-md border border-border bg-surface-secondary py-1 pl-8 pr-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filteredElements.length === 0 ? (
          <div className="text-center py-8 text-[11px] text-text-tertiary">
            No layers found
          </div>
        ) : (
          filteredElements.map((elem) => {
            const isSelected = elem.id === selectedId;

            return (
              <div
                key={elem.id}
                onClick={() => onSelect(elem.id)}
                className={`group flex items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-brand-50 text-accent font-semibold"
                    : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {getIcon(elem.type)}
                  <span className="truncate max-w-[100px]">{elem.name}</span>
                </div>

                <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100">
                  {/* Move Up/Down */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(elem.id, "up");
                    }}
                    title="Move Layer Forward"
                    className="rounded p-0.5 hover:bg-surface-secondary"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveLayer(elem.id, "down");
                    }}
                    title="Move Layer Backward"
                    className="rounded p-0.5 hover:bg-surface-secondary"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(elem.id, { locked: !elem.locked });
                    }}
                    title={elem.locked ? "Unlock Layer" : "Lock Layer"}
                    className="rounded p-0.5 hover:bg-surface-secondary"
                  >
                    {elem.locked ? (
                      <Lock className="h-3 w-3 text-amber-600" />
                    ) : (
                      <Unlock className="h-3 w-3" />
                    )}
                  </button>

                  {/* Hide/Show Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(elem.id, { hidden: !elem.hidden });
                    }}
                    title={elem.hidden ? "Show Layer" : "Hide Layer"}
                    className="rounded p-0.5 hover:bg-surface-secondary"
                  >
                    {elem.hidden ? (
                      <EyeOff className="h-3 w-3 text-text-tertiary" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateElement(elem.id);
                    }}
                    title="Duplicate Layer (Ctrl+D)"
                    className="rounded p-0.5 hover:bg-surface-secondary"
                  >
                    <Copy className="h-3 w-3" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(elem.id);
                    }}
                    title="Delete Layer"
                    className="rounded p-0.5 text-danger hover:bg-danger-light"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
