"use client";

import React, { useRef, useState } from "react";
import { useStudioStore } from "@/lib/studio/store";
import type { StudioElement } from "@/lib/schemas/studio";
import { Sparkles, Image as ImageIcon, QrCode, BarChart3 } from "lucide-react";
import { computeTextEffectStyles } from "@/lib/studio/text-effects";

export function StudioCanvas() {
  const {
    doc,
    activePageIndex,
    selectedElementIds,
    zoom,
    pan,
    setPan,
    selectElement,
    clearSelection,
    updateElement,
    activeGuides,
    setActiveGuides,
    pushHistory,
  } = useStudioStore();

  const page = doc.pages[activePageIndex] || doc.pages[0];
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging and interaction state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Wheel zoom / pan handling
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const nextZoom = Math.min(Math.max(zoom * zoomFactor, 0.15), 3.0);
      useStudioStore.getState().setZoom(nextZoom);
    } else {
      // Normal two-finger trackpad pan
      setPan({
        x: pan.x - e.deltaX,
        y: pan.y - e.deltaY,
      });
    }
  };

  // Canvas background click (deselect)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).id === "artboard-container") {
      clearSelection();
      setEditingTextId(null);
      if ((e.button === 0 && e.altKey) || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  // Element mouse down (selection & drag start)
  const handleElementMouseDown = (e: React.MouseEvent, el: StudioElement) => {
    e.stopPropagation();
    if (el.locked) return;

    selectElement(el.id, e.shiftKey);
    setDraggedElementId(el.id);
    setDragOffset({
      x: e.clientX / zoom - el.x,
      y: e.clientY / zoom - el.y,
    });
    pushHistory();
  };

  // Mouse move (dragging with smart alignment guides)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggedElementId) {
      const el = page.elements.find((item) => item.id === draggedElementId);
      if (!el) return;

      const rawX = e.clientX / zoom - dragOffset.x;
      const rawY = e.clientY / zoom - dragOffset.y;

      let snappedX = rawX;
      let snappedY = rawY;
      const guides: { type: "vertical" | "horizontal"; position: number }[] = [];
      const threshold = 6;

      // 1. Snap to artboard center
      const centerX = page.width / 2;
      const elCenterX = rawX + el.width / 2;
      if (Math.abs(elCenterX - centerX) < threshold) {
        snappedX = centerX - el.width / 2;
        guides.push({ type: "vertical", position: centerX });
      }

      const centerY = page.height / 2;
      const elCenterY = rawY + el.height / 2;
      if (Math.abs(elCenterY - centerY) < threshold) {
        snappedY = centerY - el.height / 2;
        guides.push({ type: "horizontal", position: centerY });
      }

      // 2. Snap to artboard edges
      if (Math.abs(rawX) < threshold) snappedX = 0;
      if (Math.abs(rawY) < threshold) snappedY = 0;
      if (Math.abs(rawX + el.width - page.width) < threshold) snappedX = page.width - el.width;
      if (Math.abs(rawY + el.height - page.height) < threshold) snappedY = page.height - el.height;

      setActiveGuides(guides);
      updateElement(draggedElementId, {
        x: Math.round(snappedX),
        y: Math.round(snappedY),
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedElementId(null);
    setActiveGuides([]);
  };

  // Double click text to edit inline
  const handleElementDoubleClick = (e: React.MouseEvent, el: StudioElement) => {
    e.stopPropagation();
    if (el.type === "text") {
      setEditingTextId(el.id);
    }
  };

  // Drop image on frame handler
  const handleFrameDrop = (e: React.DragEvent, frameId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const result = uploadEvent.target?.result as string;
          updateElement(frameId, { imageSrc: result });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="artboard-container"
      className="relative flex-1 h-full w-full overflow-hidden select-none bg-[#E6EEF4]/30 cursor-default"
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        backgroundImage: `radial-gradient(#C9CCD1 1px, transparent 1px)`,
        backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoomed & Panned Canvas Viewport */}
      <div
        className="absolute top-1/2 left-1/2 transition-transform duration-75 origin-center will-change-transform"
        style={{
          transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
        }}
      >
        {/* The Artboard */}
        <div
          id="active-artboard"
          className="relative shadow-2xl transition-shadow border"
          style={{
            width: `${page.width}px`,
            height: `${page.height}px`,
            backgroundColor: page.background || "#FFFFFF",
            borderColor: "#C9CCD1",
          }}
        >
          {/* Smart Alignment Guides */}
          {activeGuides.map((guide, idx) => (
            <div
              key={idx}
              className="absolute pointer-events-none z-50 bg-[#7B66B8]"
              style={{
                left: guide.type === "vertical" ? `${guide.position}px` : 0,
                top: guide.type === "horizontal" ? `${guide.position}px` : 0,
                width: guide.type === "vertical" ? "1.5px" : "100%",
                height: guide.type === "horizontal" ? "1.5px" : "100%",
              }}
            />
          ))}

          {/* Page Elements */}
          {page.elements.map((el) => {
            if (el.hidden) return null;
            const isSelected = selectedElementIds.includes(el.id);
            const isEditing = editingTextId === el.id;

            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleElementMouseDown(e, el)}
                onDoubleClick={(e) => handleElementDoubleClick(e, el)}
                className={`absolute group cursor-move ${
                  isSelected ? "ring-2 ring-[#5A4032] ring-offset-1" : "hover:ring-1 hover:ring-[#7B66B8]/50"
                }`}
                style={{
                  left: `${el.x}px`,
                  top: `${el.y}px`,
                  width: `${el.width}px`,
                  height: `${el.height}px`,
                  transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                  opacity: el.opacity,
                  zIndex: el.zIndex || 1,
                }}
              >
                {/* Element Renderers */}
                {el.type === "text" && (
                  <div className="w-full h-full relative">
                    {isEditing ? (
                      <textarea
                        autoFocus
                        value={el.content}
                        onChange={(e) => updateElement(el.id, { content: e.target.value })}
                        onBlur={() => setEditingTextId(null)}
                        className="w-full h-full p-0 m-0 bg-transparent resize-none outline-none border border-dashed border-[#5A4032]"
                        style={{
                          fontSize: `${el.fontSize}px`,
                          fontFamily: el.fontFamily,
                          fontWeight: el.fontWeight,
                          color: el.color,
                          textAlign: el.align,
                          lineHeight: el.lineHeight,
                          letterSpacing: `${el.letterSpacing}px`,
                        }}
                      />
                    ) : el.effectType === "curve" ? (
                      <div className="w-full h-full flex items-center justify-center select-none overflow-visible">
                        <svg
                          viewBox={`0 0 ${el.width} ${el.height}`}
                          className="w-full h-full overflow-visible pointer-events-none"
                        >
                          <defs>
                            <path
                              id={`curve-${el.id}`}
                              d={`M 10,${el.height * 0.75} Q ${el.width / 2},${
                                el.height * 0.75 - ((el.effectOptions?.curveAngle ?? 65) * (el.height / 100))
                              } ${el.width - 10},${el.height * 0.75}`}
                              fill="none"
                            />
                          </defs>
                          <text
                            fill={el.color}
                            fontSize={el.fontSize}
                            fontFamily={el.fontFamily}
                            fontWeight={el.fontWeight}
                            letterSpacing={el.letterSpacing}
                          >
                            <textPath
                              href={`#curve-${el.id}`}
                              startOffset="50%"
                              textAnchor="middle"
                            >
                              {el.content}
                            </textPath>
                          </text>
                        </svg>
                      </div>
                    ) : (
                      <div
                        className="w-full h-full whitespace-pre-wrap select-none"
                        style={{
                          fontSize: `${el.fontSize}px`,
                          fontFamily: el.fontFamily,
                          fontWeight: el.fontWeight,
                          color: el.color,
                          textAlign: el.align,
                          lineHeight: el.lineHeight,
                          letterSpacing: `${el.letterSpacing}px`,
                          textTransform: el.uppercase ? "uppercase" : "none",
                          textDecoration: el.underline ? "underline" : "none",
                          ...computeTextEffectStyles(el),
                        }}
                      >
                        {el.content}
                        {(el.animationType === "typewriter" || el.effectType === "typewriter") && (
                          <span className="inline-block animate-pulse font-normal ml-0.5 text-[#5A4032]">
                            |
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {el.type === "shape" && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: el.fill,
                      border: el.stroke ? `${el.strokeWidth || 1}px solid ${el.stroke}` : undefined,
                      borderRadius:
                        el.shapeType === "ellipse"
                          ? "50%"
                          : `${el.cornerRadius || 0}px`,
                    }}
                  />
                )}

                {el.type === "image" && (
                  <img
                    src={el.src}
                    alt={el.alt || "Uploaded image"}
                    className="w-full h-full object-cover pointer-events-none"
                    style={{
                      borderRadius: `${el.cornerRadius || 0}px`,
                      filter: `brightness(${el.filters?.brightness ?? 100}%) contrast(${el.filters?.contrast ?? 100}%)`,
                    }}
                  />
                )}

                {el.type === "frame" && (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleFrameDrop(e, el.id)}
                    className="w-full h-full overflow-hidden flex items-center justify-center relative border-2 border-dashed transition-colors"
                    style={{
                      borderColor: el.borderColor,
                      borderRadius:
                        el.frameShape === "circle"
                          ? "50%"
                          : el.frameShape === "arch"
                          ? "999px 999px 12px 12px"
                          : "16px",
                      backgroundColor: el.imageSrc ? "transparent" : "#F6F1EE",
                    }}
                  >
                    {el.imageSrc ? (
                      <img
                        src={el.imageSrc}
                        alt="Frame photo"
                        className="w-full h-full object-cover pointer-events-none"
                        style={{
                          transform: `scale(${el.zoom}) translate(${el.cropX}px, ${el.cropY}px)`,
                        }}
                      />
                    ) : (
                      <div className="p-4 text-center space-y-1">
                        <ImageIcon className="h-6 w-6 mx-auto text-[#5A4032]" />
                        <p className="text-[11px] font-semibold text-[#5A4032]">
                          {el.placeholderText}
                        </p>
                        <p className="text-[9px] text-[#8A8F98]">Drag image here</p>
                      </div>
                    )}
                  </div>
                )}

                {el.type === "icon" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles
                      className="w-full h-full"
                      style={{ color: el.color, strokeWidth: el.strokeWidth }}
                    />
                  </div>
                )}

                {el.type === "qr" && (
                  <div
                    className="w-full h-full p-2 flex flex-col items-center justify-center border shadow-xs"
                    style={{
                      backgroundColor: el.backgroundColor,
                      borderColor: el.color,
                    }}
                  >
                    <QrCode className="w-full h-full" style={{ color: el.color }} />
                  </div>
                )}

                {el.type === "chart" && (
                  <div className="w-full h-full p-4 rounded-lg bg-white border border-[#C9CCD1] shadow-xs flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2">
                      <BarChart3 className="h-4 w-4 text-[#5A4032]" />
                      <span className="text-xs font-bold text-[#241915]">{el.title}</span>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-2 pt-2 border-b border-[#C9CCD1]">
                      {el.data.map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <div
                            className="w-full rounded-t transition-all"
                            style={{
                              height: `${(item.value / 150) * 100}%`,
                              backgroundColor: el.colors[i % el.colors.length],
                            }}
                          />
                          <span className="text-[9px] font-semibold text-[#5E534D]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transform Corner Handles when selected */}
                {isSelected && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#5A4032] rounded-xs cursor-nwse-resize z-50" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#5A4032] rounded-xs cursor-nesw-resize z-50" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-[#5A4032] rounded-xs cursor-nesw-resize z-50" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-[#5A4032] rounded-xs cursor-nwse-resize z-50" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
