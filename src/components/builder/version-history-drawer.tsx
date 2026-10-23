"use client";

import { useState, useEffect } from "react";
import { useResume } from "./resume-provider";
import {
  X,
  History,
  RotateCcw,
  Clock,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import type { ResumeData } from "@/lib/schemas/resume";

interface VersionItem {
  id: string;
  version_number: number;
  created_at: string;
  data: ResumeData;
  summary: string;
  wordCount: number;
}

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VersionHistoryDrawer({
  isOpen,
  onClose,
}: VersionHistoryDrawerProps) {
  const { id, updateData } = useResume();
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [restoredToast, setRestoredToast] = useState(false);

  useEffect(() => {
    if (!isOpen || !id) return;

    let isMounted = true;
    async function loadVersions() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/resumes/${id}/versions`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            setVersions(json);
            if (json.length > 0) setSelectedVersion(json[0]);
          }
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadVersions();
    return () => {
      isMounted = false;
    };
  }, [isOpen, id]);

  const handleRestore = (item: VersionItem) => {
    if (confirm(`Restore resume to Version ${item.version_number}? Current changes will be overwritten.`)) {
      updateData(() => item.data);
      setRestoredToast(true);
      setTimeout(() => {
        setRestoredToast(false);
        onClose();
      }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="relative flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl border-l border-border animate-slide-left overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-secondary/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-xs">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Version History</h2>
              <p className="text-xs text-text-tertiary">Review and restore past snapshots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {restoredToast && (
          <div className="m-4 rounded-xl border border-success/30 bg-success-light p-3 text-xs font-semibold text-success flex items-center gap-2 animate-slide-down">
            <CheckCircle2 className="h-4 w-4" />
            <span>Version restored successfully! Autosaving update...</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (
            <div className="flex h-64 flex-col items-center justify-center text-xs text-text-tertiary">
              <Loader2 className="h-6 w-6 animate-spin text-accent mb-2" />
              <span>Loading saved versions...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-16 text-xs text-text-tertiary">
              <Clock className="h-10 w-10 mx-auto mb-2 text-text-tertiary/40" />
              No previous version snapshots recorded yet. Versions are created automatically whenever you edit and save.
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((item) => {
                const isSelected = selectedVersion?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedVersion(item)}
                    className={`rounded-xl border p-4 transition-all cursor-pointer ${
                      isSelected
                        ? "border-accent bg-brand-50/50 shadow-xs"
                        : "border-border bg-surface hover:border-text-tertiary"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-surface-tertiary px-2 py-0.5 text-[10px] font-bold text-text-primary">
                          v{item.version_number}
                        </span>
                        <span className="text-xs font-bold text-text-primary">
                          {new Date(item.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestore(item);
                        }}
                        className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-text-secondary line-clamp-2 mt-1">
                      {item.summary}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-[10px] text-text-tertiary">
                      <span>{item.data.experience?.length || 0} jobs</span>
                      <span>•</span>
                      <span>{item.data.skills?.length || 0} skills</span>
                      <span>•</span>
                      <span>{item.wordCount} words</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
