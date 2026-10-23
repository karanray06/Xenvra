"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import type { DesignElement } from "./types";
import { A4_PRESET } from "./types";

interface DesignCanvasProps {
  elements: DesignElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DesignElement>) => void;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize?: number;
}

type DragMode =
  | { type: "move"; startX: number; startY: number; origElemX: number; origElemY: number }
  | {
      type: "resize";
      handle: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
      startX: number;
      startY: number;
      origX: number;
      origY: number;
      origW: number;
      origH: number;
    }
  | {
      type: "rotate";
      centerX: number;
      centerY: number;
      startAngle: number;
      origRotation: number;
    }
  | null;

export function DesignCanvas({
  elements,
  selectedId,
  onSelect,
  onUpdateElement,
  zoom,
  showGrid,
  snapToGrid,
  gridSize = 10,
}: DesignCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  const selectedElement = elements.find((e) => e.id === selectedId);

  // Helper to get SVG coordinates from mouse event
  const getSvgPoint = (e: React.MouseEvent | MouseEvent): { x: number; y: number } => {
    if (!svgRef.current) return { x: e.clientX, y: e.clientY };
    const rect = svgRef.current.getBoundingClientRect();
    const scale = A4_PRESET.width / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const snap = useCallback(
    (val: number) => {
      if (!snapToGrid) return val;
      return Math.round(val / gridSize) * gridSize;
    },
    [snapToGrid, gridSize]
  );

  // Drag listeners
  useEffect(() => {
    if (!dragMode) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (!selectedId || !selectedElement) return;
      const pt = getSvgPoint(e);

      if (dragMode.type === "move") {
        const dx = pt.x - dragMode.startX;
        const dy = pt.y - dragMode.startY;
        const newX = snap(Math.max(0, Math.min(A4_PRESET.width - selectedElement.width, dragMode.origElemX + dx)));
        const newY = snap(Math.max(0, Math.min(A4_PRESET.height - selectedElement.height, dragMode.origElemY + dy)));
        onUpdateElement(selectedId, { x: newX, y: newY });
      } else if (dragMode.type === "resize") {
        const dx = pt.x - dragMode.startX;
        const dy = pt.y - dragMode.startY;
        let newX = dragMode.origX;
        let newY = dragMode.origY;
        let newW = dragMode.origW;
        let newH = dragMode.origH;

        if (dragMode.handle.includes("e")) newW = Math.max(20, dragMode.origW + dx);
        if (dragMode.handle.includes("s")) newH = Math.max(10, dragMode.origH + dy);
        if (dragMode.handle.includes("w")) {
          const possibleW = Math.max(20, dragMode.origW - dx);
          newX = dragMode.origX + (dragMode.origW - possibleW);
          newW = possibleW;
        }
        if (dragMode.handle.includes("n")) {
          const possibleH = Math.max(10, dragMode.origH - dy);
          newY = dragMode.origY + (dragMode.origH - possibleH);
          newH = possibleH;
        }

        onUpdateElement(selectedId, {
          x: snap(newX),
          y: snap(newY),
          width: snap(newW),
          height: snap(newH),
        });
      } else if (dragMode.type === "rotate") {
        const radians = Math.atan2(pt.y - dragMode.centerY, pt.x - dragMode.centerX);
        const degrees = (radians * 180) / Math.PI;
        const diff = degrees - dragMode.startAngle;
        let finalDeg = Math.round((dragMode.origRotation + diff) % 360);
        if (finalDeg < 0) finalDeg += 360;
        onUpdateElement(selectedId, { rotation: finalDeg });
      }
    };

    const handlePointerUp = () => {
      setDragMode(null);
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
    };
  }, [dragMode, selectedId, selectedElement, onUpdateElement, snap]);

  const handleElementMouseDown = (e: React.MouseEvent, elem: DesignElement) => {
    e.stopPropagation();
    if (elem.locked) return;

    onSelect(elem.id);
    const pt = getSvgPoint(e);
    setDragMode({
      type: "move",
      startX: pt.x,
      startY: pt.y,
      origElemX: elem.x,
      origElemY: elem.y,
    });
  };

  const handleResizeHandleMouseDown = (
    e: React.MouseEvent,
    handle: "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w"
  ) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;
    const pt = getSvgPoint(e);
    setDragMode({
      type: "resize",
      handle,
      startX: pt.x,
      startY: pt.y,
      origX: selectedElement.x,
      origY: selectedElement.y,
      origW: selectedElement.width,
      origH: selectedElement.height,
    });
  };

  const handleRotateHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedElement || selectedElement.locked) return;
    const pt = getSvgPoint(e);
    const centerX = selectedElement.x + selectedElement.width / 2;
    const centerY = selectedElement.y + selectedElement.height / 2;
    const radians = Math.atan2(pt.y - centerY, pt.x - centerX);
    const degrees = (radians * 180) / Math.PI;

    setDragMode({
      type: "rotate",
      centerX,
      centerY,
      startAngle: degrees,
      origRotation: selectedElement.rotation || 0,
    });
  };

  return (
    <div
      className="relative flex flex-1 items-start justify-center overflow-auto bg-[#EBECEF] p-8 select-none"
      onClick={() => onSelect(null)}
    >
      <div
        className="relative transition-transform duration-75 shadow-2xl"
        style={{
          width: `${A4_PRESET.width * zoom}px`,
          height: `${A4_PRESET.height * zoom}px`,
        }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${A4_PRESET.width} ${A4_PRESET.height}`}
          className="h-full w-full bg-white rounded-xs"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Optional Snapping Grid Pattern */}
          {showGrid && (
            <defs>
              <pattern id="penpot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E4E8" strokeWidth="0.75" />
              </pattern>
            </defs>
          )}
          {showGrid && (
            <rect width={A4_PRESET.width} height={A4_PRESET.height} fill="url(#penpot-grid)" />
          )}

          {/* Render Vector Elements */}
          {elements.map((elem) => {
            if (elem.hidden) return null;
            const isSelected = elem.id === selectedId;
            const transform = elem.rotation
              ? `rotate(${elem.rotation} ${elem.x + elem.width / 2} ${elem.y + elem.height / 2})`
              : undefined;

            return (
              <g
                key={elem.id}
                id={`elem-${elem.id}`}
                transform={transform}
                opacity={elem.opacity}
                onMouseDown={(e) => handleElementMouseDown(e, elem)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (elem.type === "text" || elem.type === "badge") {
                    setEditingTextId(elem.id);
                  }
                }}
                className={`cursor-pointer transition-opacity ${
                  elem.locked ? "cursor-not-allowed" : ""
                }`}
              >
                {/* 1. Rectangle */}
                {elem.type === "rect" && (
                  <rect
                    x={elem.x}
                    y={elem.y}
                    width={elem.width}
                    height={elem.height}
                    rx={elem.borderRadius || 0}
                    ry={elem.borderRadius || 0}
                    fill={elem.fill}
                    stroke={elem.stroke || "none"}
                    strokeWidth={elem.strokeWidth || 0}
                    strokeDasharray={elem.strokeDasharray}
                  />
                )}

                {/* 2. Circle / Ellipse */}
                {elem.type === "circle" && (
                  <ellipse
                    cx={elem.x + elem.width / 2}
                    cy={elem.y + elem.height / 2}
                    rx={elem.width / 2}
                    ry={elem.height / 2}
                    fill={elem.fill}
                    stroke={elem.stroke || "none"}
                    strokeWidth={elem.strokeWidth || 0}
                  />
                )}

                {/* 3. Divider Line */}
                {elem.type === "line" && (
                  <line
                    x1={elem.x}
                    y1={elem.y + elem.height / 2}
                    x2={elem.x + elem.width}
                    y2={elem.y + elem.height / 2}
                    stroke={elem.fill || "#C9CCD1"}
                    strokeWidth={elem.strokeWidth || elem.height || 2}
                    strokeDasharray={elem.strokeDasharray}
                  />
                )}

                {/* 4. Text Element */}
                {elem.type === "text" && (
                  <foreignObject
                    x={elem.x}
                    y={elem.y}
                    width={elem.width}
                    height={elem.height}
                    className="overflow-hidden"
                  >
                    <div
                      style={{
                        fontFamily: elem.fontFamily || "Plus Jakarta Sans, sans-serif",
                        fontSize: `${elem.fontSize || 12}px`,
                        fontWeight: elem.fontWeight || "normal",
                        color: elem.textColor || "#1A1D20",
                        textAlign: elem.textAlign || "left",
                        lineHeight: elem.lineHeight || 1.3,
                        textTransform: elem.textTransform || "none",
                        letterSpacing: elem.letterSpacing ? `${elem.letterSpacing}px` : undefined,
                        width: "100%",
                        height: "100%",
                        wordBreak: "break-word",
                      }}
                    >
                      {elem.text}
                    </div>
                  </foreignObject>
                )}

                {/* 5. Badge / Chip Element */}
                {elem.type === "badge" && (
                  <>
                    <rect
                      x={elem.x}
                      y={elem.y}
                      width={elem.width}
                      height={elem.height}
                      rx={elem.borderRadius || elem.height / 2}
                      ry={elem.borderRadius || elem.height / 2}
                      fill={elem.fill}
                      stroke={elem.stroke || "none"}
                      strokeWidth={elem.strokeWidth || 0}
                    />
                    <text
                      x={elem.x + elem.width / 2}
                      y={elem.y + elem.height / 2 + (elem.fontSize || 10) * 0.35}
                      textAnchor="middle"
                      fill={elem.textColor || "#1A1D20"}
                      fontFamily={elem.fontFamily || "Plus Jakarta Sans, sans-serif"}
                      fontSize={elem.fontSize || 10}
                      fontWeight={elem.fontWeight || "600"}
                    >
                      {elem.text}
                    </text>
                  </>
                )}

                {/* Selection Bounding Box & 8 Handles */}
                {isSelected && !elem.locked && (
                  <g>
                    {/* Outer Bounding Stroke */}
                    <rect
                      x={elem.x - 2}
                      y={elem.y - 2}
                      width={elem.width + 4}
                      height={elem.height + 4}
                      fill="none"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />

                    {/* Rotation Stalk & Handle */}
                    <line
                      x1={elem.x + elem.width / 2}
                      y1={elem.y - 2}
                      x2={elem.x + elem.width / 2}
                      y2={elem.y - 18}
                      stroke="#5A4032"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={elem.x + elem.width / 2}
                      cy={elem.y - 18}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-grab active:cursor-grabbing"
                      onMouseDown={handleRotateHandleMouseDown}
                    />

                    {/* 8 Resize Points */}
                    {/* Top-Left */}
                    <rect
                      x={elem.x - 5}
                      y={elem.y - 5}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-nwse-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "nw")}
                    />
                    {/* Top-Center */}
                    <rect
                      x={elem.x + elem.width / 2 - 3.5}
                      y={elem.y - 5}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-ns-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "n")}
                    />
                    {/* Top-Right */}
                    <rect
                      x={elem.x + elem.width - 2}
                      y={elem.y - 5}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-nesw-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "ne")}
                    />
                    {/* Right-Center */}
                    <rect
                      x={elem.x + elem.width - 2}
                      y={elem.y + elem.height / 2 - 3.5}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-ew-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "e")}
                    />
                    {/* Bottom-Right */}
                    <rect
                      x={elem.x + elem.width - 2}
                      y={elem.y + elem.height - 2}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-nwse-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "se")}
                    />
                    {/* Bottom-Center */}
                    <rect
                      x={elem.x + elem.width / 2 - 3.5}
                      y={elem.y + elem.height - 2}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-ns-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "s")}
                    />
                    {/* Bottom-Left */}
                    <rect
                      x={elem.x - 5}
                      y={elem.y + elem.height - 2}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-nesw-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "sw")}
                    />
                    {/* Left-Center */}
                    <rect
                      x={elem.x - 5}
                      y={elem.y + elem.height / 2 - 3.5}
                      width="7"
                      height="7"
                      fill="#FFFFFF"
                      stroke="#5A4032"
                      strokeWidth="1.5"
                      className="cursor-ew-resize"
                      onMouseDown={(e) => handleResizeHandleMouseDown(e, "w")}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Inline Text Editor Dialog */}
        {editingTextId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs"
            onClick={() => setEditingTextId(null)}
          >
            <div
              className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-xs font-bold text-text-primary mb-2">Edit Text Content</h4>
              <textarea
                rows={4}
                autoFocus
                value={elements.find((e) => e.id === editingTextId)?.text || ""}
                onChange={(e) => onUpdateElement(editingTextId, { text: e.target.value })}
                className="w-full rounded-lg border border-border bg-surface-secondary p-3 text-xs text-text-primary focus:border-accent focus:outline-none"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => setEditingTextId(null)}
                  className="rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
