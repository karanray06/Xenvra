"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Zap,
  Scissors,
  CheckCheck,
  FileText,
  Loader2,
  Check,
} from "lucide-react";

interface AiAssistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onApply: (improvedText: string) => void;
  context?: { role?: string; skills?: string[] };
}

type ActionType = "strengthen" | "shorten" | "fix_grammar" | "generate_summary";

export function AiAssistModal({
  isOpen,
  onClose,
  initialText,
  onApply,
  context,
}: AiAssistModalProps) {
  const [text, setText] = useState(initialText);
  const [selectedAction, setSelectedAction] = useState<ActionType>("strengthen");
  const [suggestedText, setSuggestedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImprove = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: selectedAction,
          text: text.trim() || "Professional experience and key contributions",
          context,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to generate AI improvement");
      }

      setSuggestedText(json.improvedText);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error improving text");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestedText) {
      onApply(suggestedText);
      onClose();
    }
  };

  const actions: { id: ActionType; label: string; desc: string; icon: React.ElementType }[] = [
    {
      id: "strengthen",
      label: "Strengthen Impact",
      desc: "Use high-impact action verbs and quantified metrics",
      icon: Zap,
    },
    {
      id: "shorten",
      label: "Make Concise",
      desc: "Trim fluff & passive voice for executive punchiness",
      icon: Scissors,
    },
    {
      id: "fix_grammar",
      label: "Polish & Grammar",
      desc: "Fix capitalization, active voice, and syntax",
      icon: CheckCheck,
    },
    {
      id: "generate_summary",
      label: "Generate Summary",
      desc: "Draft a 2-3 sentence executive summary",
      icon: FileText,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface-secondary/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">AI Writing Assistant</h2>
              <p className="text-xs text-text-tertiary">Refine bullets, fix tone, and enhance impact</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Action Selector Pills */}
          <div>
            <label className="block text-xs font-semibold text-text-primary mb-2">
              Select Enhancement Mode
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {actions.map((act) => {
                const Icon = act.icon;
                const isSelected = selectedAction === act.id;
                return (
                  <button
                    key={act.id}
                    onClick={() => {
                      setSelectedAction(act.id);
                      setSuggestedText(null);
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition-all ${
                      isSelected
                        ? "border-accent bg-brand-50 text-accent font-semibold shadow-xs"
                        : "border-border bg-surface text-text-secondary hover:border-text-tertiary"
                    }`}
                  >
                    <Icon className="h-4 w-4 mb-1" />
                    <span className="text-[11px]">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-text-primary">Original Content</label>
              <span className="text-[10px] text-text-tertiary">{text.length} / 1200 chars</span>
            </div>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type text you want to enhance..."
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleImprove}
            disabled={isLoading || text.trim().length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Enhancing with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Generate Suggestion</span>
              </>
            )}
          </button>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-light p-3 text-xs text-danger font-medium">
              {error}
            </div>
          )}

          {/* Suggested Output Comparison */}
          {suggestedText && (
            <div className="rounded-xl border border-accent/40 bg-brand-50/50 p-4 animate-slide-down">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-accent flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Suggested Result
                </span>
                <span className="text-[10px] text-text-tertiary">Review and accept</span>
              </div>
              <p className="text-xs text-text-primary leading-relaxed bg-surface rounded-lg p-3 border border-border">
                {suggestedText}
              </p>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => setSuggestedText(null)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface transition-colors"
                >
                  Discard
                </button>
                <button
                  onClick={handleApply}
                  className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover transition-colors shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  Accept & Insert
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
