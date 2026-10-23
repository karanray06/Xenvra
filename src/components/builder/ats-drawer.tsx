"use client";

import { useState } from "react";
import { useResume } from "./resume-provider";
import {
  X,
  Sparkles,
  Target,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Loader2,
  FileText,
} from "lucide-react";
import type { AtsAnalysisResult } from "@/lib/ats";

interface AtsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AtsDrawer({ isOpen, onClose }: AtsDrawerProps) {
  const { data } = useResume();
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/ats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          targetJobDescription: jobDescription,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Analysis failed");
      }
      setResult(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error analyzing resume");
    } finally {
      setIsAnalyzing(false);
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
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">ATS Score & Keyword Scanner</h2>
              <p className="text-xs text-text-tertiary">Real-time parser audit & recruiter alignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-tertiary hover:bg-surface-tertiary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Analyze / Refresh CTA */}
          <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <label className="block text-xs font-semibold text-text-primary mb-1.5">
              Target Job Description (Optional)
            </label>
            <p className="text-[11px] text-text-secondary mb-2">
              Paste the job posting to see keyword match rate and missing requirements.
            </p>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g. Seeking Senior Full-Stack Engineer proficient in TypeScript, React 19, Supabase, Next.js, and CI/CD pipelines..."
              className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
            />
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Scanning Resume...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{result ? "Re-Scan Resume" : "Calculate ATS Score"}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-danger/30 bg-danger-light p-3.5 text-xs text-danger font-medium">
              {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-6">
              {/* Score Gauge Card */}
              <div className="rounded-2xl border border-border bg-gradient-to-br from-surface to-brand-50/50 p-6 shadow-xs text-center">
                <div className="inline-flex h-24 w-24 flex-col items-center justify-center rounded-full border-4 border-accent bg-surface shadow-inner mb-3">
                  <span className="text-3xl font-extrabold text-accent">{result.overallScore}</span>
                  <span className="text-[10px] font-bold text-text-tertiary uppercase">/ 100</span>
                </div>
                <h3 className="text-lg font-bold text-text-primary">{result.rating}</h3>
                <p className="text-xs text-text-secondary mt-1">
                  {result.overallScore >= 80
                    ? "Excellent! Your resume easily sails through enterprise ATS parsers."
                    : result.overallScore >= 60
                    ? "Solid baseline. Implementing the suggestions below will boost recruiter visibility."
                    : "Needs optimization. Address the critical flags below to avoid ATS rejection."}
                </p>

                {/* Metrics Summary Strip */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                  <div>
                    <p className="text-xs font-bold text-text-primary">{result.metrics.wordCount}</p>
                    <p className="text-[10px] text-text-tertiary">Total Words</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">
                      {result.metrics.quantifiedBulletCount}/{result.metrics.bulletCount}
                    </p>
                    <p className="text-[10px] text-text-tertiary">Metrics Bullets</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">{result.metrics.skillsCount}</p>
                    <p className="text-[10px] text-text-tertiary">Skills Listed</p>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Bars */}
              <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Category Breakdown
                </h4>
                {Object.entries(result.categoryScores).map(([key, cat]) => {
                  const pct = Math.round((cat.score / cat.max) * 100);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">{cat.label}</span>
                        <span className="font-bold text-text-primary">
                          {cat.score}/{cat.max} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-surface-tertiary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-accent transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Keywords Match Section (if JD provided) */}
              {jobDescription.trim().length > 20 && (
                <div className="rounded-xl border border-border bg-surface p-4 shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Job Description Keyword Overlap
                  </h4>

                  {result.matchedKeywords.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-success mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Matched Keywords ({result.matchedKeywords.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.matchedKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="rounded-md bg-success-light px-2 py-0.5 text-[11px] font-medium text-success"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.missingKeywords.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-semibold text-danger mb-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Missing High-Frequency Keywords ({result.missingKeywords.length})
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="rounded-md bg-danger-light px-2 py-0.5 text-[11px] font-medium text-danger"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actionable Recommendations */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                  Recommendations ({result.suggestions.length})
                </h4>

                {result.suggestions.length === 0 ? (
                  <div className="rounded-xl border border-success/30 bg-success-light p-4 text-xs text-success text-center font-medium">
                    ✨ No issues found! Your resume passes all fundamental ATS requirements.
                  </div>
                ) : (
                  result.suggestions.map((s) => (
                    <div
                      key={s.id}
                      className={`rounded-xl border p-3.5 text-xs ${
                        s.type === "critical"
                          ? "border-danger/30 bg-danger-light/50 text-danger"
                          : s.type === "warning"
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : "border-border bg-surface text-text-secondary"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {s.type === "critical" ? (
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-danger" />
                        ) : s.type === "warning" ? (
                          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                        ) : (
                          <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-accent" />
                        )}
                        <div>
                          <p className="font-bold text-text-primary">{s.title}</p>
                          <p className="mt-0.5 opacity-90 leading-relaxed">{s.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {!result && !isAnalyzing && (
            <div className="text-center py-12 text-xs text-text-tertiary">
              <FileText className="h-10 w-10 mx-auto mb-2 text-text-tertiary/40" />
              Click <strong>&quot;Calculate ATS Score&quot;</strong> above to scan your current resume
              against recruiter tracking criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
