"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { StudioTopBar } from "./studio-top-bar";
import { StudioPropertiesBar } from "./studio-properties-bar";
import { StudioSidebar } from "./studio-sidebar";
import { StudioCanvas } from "./studio-canvas";
import { StudioPresenter } from "./studio-presenter";
import { useStudioStore } from "@/lib/studio/store";
import { getStudioTemplateById } from "@/lib/templates/manifest";

export function StudioEditor() {
  const [isPresenting, setIsPresenting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const {
    doc,
    isDirty,
    saveStatus,
    undo,
    redo,
    deleteSelectedElements,
    duplicateSelectedElements,
    clearSelection,
    setDoc,
    setDesignMeta,
    setActivePage,
    setIsAnonymous,
  } = useStudioStore();

  const lastSavedJsonRef = useRef<string>("");
  const isSavingRef = useRef<boolean>(false);

  // 1. Load document by ID or template from URL params
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const templateParam = params.get("template");

    if (idParam) {
      useStudioStore.setState({ saveStatus: "saving" });
      fetch(`/api/studio/designs/${encodeURIComponent(idParam)}`)
        .then(async (res) => {
          if (!res.ok) {
            if (res.status === 401) {
              setIsAnonymous(true);
            }
            throw new Error(`Failed to load design (${res.status})`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.design) {
            setDoc(data.design.doc);
            setDesignMeta(
              data.design.id,
              data.design.title,
              data.design.kind,
              data.design.version
            );
            setActivePage(0);
            lastSavedJsonRef.current = JSON.stringify(data.design.doc);
            useStudioStore.setState({ isDirty: false, saveStatus: "saved" });
          }
        })
        .catch((err) => {
          console.error("[Studio] Design load error:", err);
          setLoadError("Could not load cloud design. Opening standard workspace.");
          useStudioStore.setState({ saveStatus: "idle" });
        });
    } else if (templateParam) {
      const tmpl = getStudioTemplateById(templateParam);
      if (tmpl) {
        const docCopy = tmpl.getDoc();
        setDoc(docCopy);
        setDesignMeta(null, tmpl.title, tmpl.kind, 1);
        setActivePage(0);
        lastSavedJsonRef.current = JSON.stringify(docCopy);
        useStudioStore.setState({ isDirty: false, saveStatus: "saved" });
      }
    } else {
      lastSavedJsonRef.current = JSON.stringify(doc);
    }
  }, [setDoc, setDesignMeta, setActivePage, setIsAnonymous]);

  // 2. Race-Safe Autosave execution helper
  const performSave = useCallback(async () => {
    const currentDoc = useStudioStore.getState().doc;
    const currentTitle = useStudioStore.getState().designTitle;
    const currentKind = useStudioStore.getState().kind;
    const currentId = useStudioStore.getState().designId;
    const currentVersion = useStudioStore.getState().version;

    const docJson = JSON.stringify(currentDoc);
    if (docJson === lastSavedJsonRef.current && currentId) {
      useStudioStore.setState({ isDirty: false, saveStatus: "saved" });
      return;
    }

    if (isSavingRef.current) return;
    isSavingRef.current = true;
    useStudioStore.setState({ saveStatus: "saving" });

    try {
      if (!currentId) {
        // Create new cloud design
        const res = await fetch("/api/studio/designs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentTitle,
            kind: currentKind,
            doc: currentDoc,
          }),
        });

        if (res.status === 401) {
          // Logged-out anonymous visitor: keep local draft
          useStudioStore.setState({
            isAnonymous: true,
            isDirty: false,
            saveStatus: "idle",
          });
          lastSavedJsonRef.current = docJson;
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to save new design");
        }

        const data = await res.json();
        if (data.design) {
          useStudioStore.setState({
            designId: data.design.id,
            version: data.design.version,
            isDirty: false,
            saveStatus: "saved",
          });
          lastSavedJsonRef.current = docJson;
          // Update URL without reload to establish persistence anchor
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            url.searchParams.set("id", data.design.id);
            url.searchParams.delete("template");
            window.history.replaceState(null, "", url.toString());
          }
        }
      } else {
        // Update existing cloud design
        const res = await fetch(`/api/studio/designs/${encodeURIComponent(currentId)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: currentTitle,
            doc: currentDoc,
            version: currentVersion,
          }),
        });

        if (res.status === 401) {
          useStudioStore.setState({ isAnonymous: true, saveStatus: "idle" });
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to update cloud design");
        }

        const data = await res.json();
        if (data.design) {
          useStudioStore.setState({
            version: data.design.version,
            isDirty: false,
            saveStatus: "saved",
          });
          lastSavedJsonRef.current = docJson;
        }
      }
    } catch (err) {
      console.error("[Studio] Autosave failure:", err);
      useStudioStore.setState({ saveStatus: "error" });
    } finally {
      isSavingRef.current = false;
    }
  }, []);

  // 3. Debounce autosave on dirty changes
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      performSave();
    }, 1500);

    return () => clearTimeout(timer);
  }, [isDirty, doc, performSave]);

  // 4. Draft safety: Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && saveStatus !== "saved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, saveStatus]);

  // 5. Global keyboard shortcuts with input & contentEditable isolation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Don't intercept when user is typing in inputs, textareas, or contentEditable nodes
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable ||
        target.getAttribute?.("contenteditable") === "true"
      ) {
        return;
      }

      const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (mod && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        undo();
      } else if ((mod && e.shiftKey && e.key.toLowerCase() === "z") || (mod && e.key.toLowerCase() === "y")) {
        e.preventDefault();
        redo();
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        performSave();
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
  }, [undo, redo, performSave, duplicateSelectedElements, deleteSelectedElements, clearSelection]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white select-none">
      {/* Top Action Bar */}
      <StudioTopBar onStartPresenting={() => setIsPresenting(true)} onManualSave={performSave} />

      {/* Load error notice if any */}
      {loadError && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1 text-xs text-amber-800 flex items-center justify-between">
          <span>{loadError}</span>
          <button
            onClick={() => setLoadError(null)}
            className="text-amber-900 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

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

