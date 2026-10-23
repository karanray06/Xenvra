"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Target,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  FileText,
  Copy,
  Save,
  Loader2,
  Briefcase,
  Building,
} from "lucide-react";
import type { ResumeData } from "@/lib/schemas/resume";

interface ResumeSummary {
  id: string;
  title: string;
  data: ResumeData;
  updated_at: string;
}

interface TailorClientProps {
  resumes: ResumeSummary[];
}

export function TailorClient({ resumes }: TailorClientProps) {
  const router = useRouter();
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    resumes[0]?.id || ""
  );
  const [company, setCompany] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isTailoring, setIsTailoring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  interface TailorResult {
    tailoredSummary: string;
    tailoredData: ResumeData;
    scoreBefore: number;
    scoreAfter: number;
    injectedKeywords: string[];
  }

  const [result, setResult] = useState<TailorResult | null>(null);

  const activeResume = resumes.find((r) => r.id === selectedResumeId);

  const handleTailor = async () => {
    if (!activeResume) return;
    if (jobDescription.trim().length < 30) {
      setError("Please paste a more complete job description (at least 30 characters).");
      return;
    }

    setIsTailoring(true);
    setError(null);

    try {
      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: activeResume.data,
          jobDescription,
          targetRole,
          company,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Tailoring failed");
      }

      setResult(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Tailoring error");
    } finally {
      setIsTailoring(false);
    }
  };

  const handleSaveAsNew = async () => {
    if (!result || !activeResume) return;
    setIsSaving(true);
    try {
      const newTitle = `${activeResume.title} — ${company || targetRole || "Tailored"}`;
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          template_id: "modern-1",
          data: result.tailoredData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save tailored resume");
      }

      const json = await res.json();
      router.push(`/dashboard/builder?id=${json.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Job Description Tailoring
            </h1>
            <p className="mt-0.5 text-xs text-text-secondary">
              Automatically adapt your resume bullets, keywords, and summary to match any job opening.
            </p>
          </div>
        </div>
      </div>

      {resumes.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center shadow-xs">
          <FileText className="h-10 w-10 mx-auto text-text-tertiary mb-3" />
          <h3 className="text-base font-bold text-text-primary">No Resumes Found</h3>
          <p className="text-xs text-text-secondary mt-1 mb-4">
            Create your first baseline resume in the Builder before tailoring for job openings.
          </p>
          <button
            onClick={() => router.push("/dashboard/builder")}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover"
          >
            Create Resume
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: Input Form */}
          <div className="lg:col-span-5 space-y-5">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Select Base Resume
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1">
                    <Building className="h-3 w-3 text-text-tertiary" />
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stripe, Google"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-primary mb-1.5 flex items-center gap-1">
                    <Briefcase className="h-3 w-3 text-text-tertiary" />
                    Target Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-text-primary">
                    Target Job Description (JD)
                  </label>
                  <span className="text-[10px] text-text-tertiary">
                    {jobDescription.length} characters
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder="Paste the full job posting, required qualifications, and responsibilities..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary p-3 text-xs text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-danger/30 bg-danger-light p-3 text-xs text-danger font-medium">
                  {error}
                </div>
              )}

              <button
                onClick={handleTailor}
                disabled={isTailoring}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60"
              >
                {isTailoring ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Analyzing & Tailoring Resume...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Tailor Resume for this Role</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: Tailored Results */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-6 animate-slide-down">
                {/* Score Comparison Banner */}
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-surface-secondary to-brand-50 p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success text-white">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text-primary">
                        ATS Match Score Boost
                      </h4>
                      <p className="text-[11px] text-text-secondary">
                        Enhanced keyword alignment for this specific posting
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-extrabold">
                    <span className="text-text-tertiary line-through">{result.scoreBefore}%</span>
                    <ArrowRight className="h-4 w-4 text-accent" />
                    <span className="text-xl text-success">{result.scoreAfter}%</span>
                  </div>
                </div>

                {/* Injected Keywords Pill Strip */}
                <div>
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">
                    Injected High-Priority Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.injectedKeywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-md bg-lav-200 px-2.5 py-1 text-xs font-semibold text-text-primary shadow-xs"
                      >
                        <CheckCircle2 className="h-3 w-3 text-accent" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tailored Summary */}
                <div className="rounded-xl border border-border bg-surface-secondary/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-text-primary">
                      Tailored Professional Summary
                    </h4>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(result.tailoredSummary);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "Copied!" : "Copy Text"}
                    </button>
                  </div>
                  <p className="text-xs text-text-primary leading-relaxed bg-surface rounded-lg p-3 border border-border">
                    {result.tailoredSummary}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-border">
                  <button
                    onClick={handleSaveAsNew}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )}
                    <span>Save as New Tailored Resume & Open Builder</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <Sparkles className="h-10 w-10 text-accent/40 mb-3" />
                <h3 className="text-base font-bold text-text-primary">
                  Ready to Optimize
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mt-1">
                  Paste the target job description on the left and click &quot;Tailor Resume&quot; to
                  generate instant role alignment.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
