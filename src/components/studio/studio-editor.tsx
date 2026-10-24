"use client";

import React, { useState, useEffect } from "react";
import { StudioTopBar } from "./studio-top-bar";
import { StudioPropertiesBar } from "./studio-properties-bar";
import { StudioSidebar } from "./studio-sidebar";
import { StudioCanvas } from "./studio-canvas";
import { StudioPresenter } from "./studio-presenter";
import { useStudioStore } from "@/lib/studio/store";

export function StudioEditor() {
  const [isPresenting, setIsPresenting] = useState(false);
  const { undo, redo, deleteSelectedElements, duplicateSelectedElements, clearSelection } =
    useStudioStore();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if ((mod && e.shiftKey && e.key.toLowerCase() === "z") || (mod && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelectedElements();
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        deleteSelectedElements();
      } else if (e.key === "Escape") {
        clearSelection();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, deleteSelectedElements, duplicateSelectedElements, clearSelection]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Action Bar */}
      <StudioTopBar onStartPresenting={() => setIsPresenting(true)} />

      {/* Contextual Properties Bar */}
      <StudioPropertiesBar />

      {/* Studio Workspace: Sidebar + Interactive Canvas */}
      <div className="flex flex-1 overflow-hidden relative">
        <StudioSidebar />
        <StudioCanvas />
      </div>

      {/* Present Mode Overlay */}
      {isPresenting && <StudioPresenter onExit={() => setIsPresenting(false)} />}
    </div>
  );
}
