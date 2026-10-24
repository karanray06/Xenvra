"use client";

import React, { useState, useEffect } from "react";
import { useStudioStore } from "@/lib/studio/store";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { computeTextEffectStyles } from "@/lib/studio/text-effects";

interface StudioPresenterProps {
  onExit: () => void;
}

export function StudioPresenter({ onExit }: StudioPresenterProps) {
  const { doc, activePageIndex, setActivePage } = useStudioStore();
  const [currentIndex, setCurrentIndex] = useState(activePageIndex);

  const totalPages = doc.pages.length;
  const currentSlide = doc.pages[currentIndex] || doc.pages[0];

  // Arrow key navigation & ESC to exit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Space") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(prev + 1, totalPages - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Escape") {
        e.preventDefault();
        onExit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages, onExit]);

  // Sync back to store active page when exiting
  useEffect(() => {
    setActivePage(currentIndex);
  }, [currentIndex, setActivePage]);

  return (
    <div className="fixed inset-0 z-50 bg-[#150E0C] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
        <span className="text-xs font-mono font-medium text-[#C9CCD1] bg-[#241915]/80 px-3 py-1.5 rounded-full border border-[#5A4032]/40">
          Slide {currentIndex + 1} of {totalPages}
        </span>
        <button
          onClick={onExit}
          className="p-2 rounded-full bg-[#241915]/80 text-[#E6EEF4] hover:bg-[#5A4032] transition-colors border border-[#5A4032]/40"
          title="Exit Presentation (ESC)"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Slide Display Scaled to Viewport */}
      <div className="relative max-w-[95vw] max-h-[90vh] aspect-video shadow-2xl flex items-center justify-center">
        <div
          className="relative overflow-hidden rounded-lg shadow-2xl origin-center"
          style={{
            width: `${currentSlide.width}px`,
            height: `${currentSlide.height}px`,
            backgroundColor: currentSlide.background || "#FFFFFF",
            transform: `scale(${Math.min(
              (window.innerWidth * 0.92) / currentSlide.width,
              (window.innerHeight * 0.88) / currentSlide.height
            )})`,
          }}
        >
          {currentSlide.elements.map((el) => {
            if (el.hidden) return null;

            return (
              <div
                key={el.id}
                className="absolute"
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
                {el.type === "text" && (
                  el.effectType === "curve" ? (
                    <div className="w-full h-full flex items-center justify-center select-none overflow-visible">
                      <svg
                        viewBox={`0 0 ${el.width} ${el.height}`}
                        className="w-full h-full overflow-visible pointer-events-none"
                      >
                        <defs>
                          <path
                            id={`presenter-curve-${el.id}`}
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
                            href={`#presenter-curve-${el.id}`}
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
                      className="w-full h-full whitespace-pre-wrap"
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
                    </div>
                  )
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
                    alt={el.alt || "Presentation visual"}
                    className="w-full h-full object-cover"
                    style={{ borderRadius: `${el.cornerRadius || 0}px` }}
                  />
                )}

                {el.type === "frame" && el.imageSrc && (
                  <img
                    src={el.imageSrc}
                    alt="Frame photo"
                    className="w-full h-full object-cover"
                    style={{
                      borderRadius:
                        el.frameShape === "circle"
                          ? "50%"
                          : el.frameShape === "arch"
                          ? "999px 999px 12px 12px"
                          : "16px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bottom Nav Controls */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#241915]/90 px-4 py-2 rounded-full border border-[#5A4032]/40 backdrop-blur-md shadow-xl">
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
          className="p-1.5 rounded-full text-white hover:bg-[#5A4032] disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="text-xs font-mono text-[#E6EEF4]">
          {currentIndex + 1} / {totalPages}
        </span>

        <button
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, totalPages - 1))}
          disabled={currentIndex === totalPages - 1}
          className="p-1.5 rounded-full text-white hover:bg-[#5A4032] disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
