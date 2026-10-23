"use client";

import { useState } from "react";
import {
  Mail,
  Sparkles,
  Building,
  Briefcase,
  User,
  Copy,
  Download,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import type { ResumeData } from "@/lib/schemas/resume";

interface CoverLetter {
  id: string;
  title: string;
  company: string;
  role: string;
  content: string;
  created_at: string;
}

interface ResumeSummary {
  id: string;
  title: string;
  data: ResumeData;
}

interface CoverLetterClientProps {
  initialLetters: CoverLetter[];
  resumes: ResumeSummary[];
}

export function CoverLetterClient({
  initialLetters,
  resumes,
}: CoverLetterClientProps) {
  const [letters, setLetters] = useState<CoverLetter[]>(initialLetters);
  const [selectedLetter, setSelectedLetter] = useState<CoverLetter | null>(
    initialLetters[0] || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [activeContent, setActiveContent] = useState("");

  const handleGenerate = async () => {
    if (!company.trim() || !role.trim()) {
      setError("Please provide both Company Name and Job Title.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          hiringManager,
          resumeId: selectedResumeId || undefined,
          save: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to generate cover letter");
      }

      setActiveContent(json.content);

      // Create new local item
      const newLetter: CoverLetter = {
        id: json.savedId || `temp_${Date.now()}`,
        title: `Cover Letter — ${company} (${role})`,
        company,
        role,
        content: json.content,
        created_at: new Date().toISOString(),
      };

      setLetters([newLetter, ...letters]);
      setSelectedLetter(newLetter);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cover letter?")) return;
    try {
      await fetch(`/api/cover-letter?id=${id}`, { method: "DELETE" });
      const next = letters.filter((l) => l.id !== id);
      setLetters(next);
      if (selectedLetter?.id === id) {
        setSelectedLetter(next[0] || null);
        setActiveContent(next[0]?.content || "");
      }
    } catch {
      // ignore
    }
  };

  const handleCopy = () => {
    const textToCopy = selectedLetter?.content || activeContent;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-xs">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              AI Cover Letter Generator
            </h1>
            <p className="mt-0.5 text-xs text-text-secondary">
              Generate tailored, high-conversion cover letters personalized with your resume highlights.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Generator Form & List */}
        <div className="lg:col-span-5 space-y-6">
          {/* Create New Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              Generate Bespoke Cover Letter
            </h3>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Company Name *
              </label>
              <div className="relative flex items-center">
                <Building className="absolute left-2.5 h-3.5 w-3.5 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="e.g. Acme Corp, Figma, Apple"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary py-2 pl-8 pr-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Target Role / Job Title *
              </label>
              <div className="relative flex items-center">
                <Briefcase className="absolute left-2.5 h-3.5 w-3.5 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="e.g. Lead Product Designer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary py-2 pl-8 pr-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-primary mb-1">
                Hiring Manager Name (Optional)
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-2.5 h-3.5 w-3.5 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="e.g. Jane Doe, VP of Engineering"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary py-2 pl-8 pr-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {resumes.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Reference Resume Profile
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
            )}

            {error && (
              <div className="rounded-xl border border-danger/30 bg-danger-light p-3 text-xs text-danger font-medium">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Drafting Cover Letter...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Cover Letter</span>
                </>
              )}
            </button>
          </div>

          {/* Saved Cover Letters List */}
          {letters.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider px-2 py-1">
                Saved Letters ({letters.length})
              </h4>
              <div className="space-y-1">
                {letters.map((letItem) => {
                  const isSelected = selectedLetter?.id === letItem.id;
                  return (
                    <div
                      key={letItem.id}
                      onClick={() => {
                        setSelectedLetter(letItem);
                        setActiveContent(letItem.content);
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-brand-50 text-accent font-semibold"
                          : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
                      }`}
                    >
                      <div className="truncate">
                        <p className="font-medium truncate">{letItem.company}</p>
                        <p className="text-[10px] text-text-tertiary truncate">
                          {letItem.role} •{" "}
                          {new Date(letItem.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(letItem.id);
                        }}
                        className="rounded p-1 text-text-tertiary hover:text-danger hover:bg-danger-light"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Cover Letter Document Preview & Actions */}
        <div className="lg:col-span-7">
          {selectedLetter || activeContent ? (
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-md space-y-6">
              {/* Toolbar */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-bold text-text-primary text-sm">
                    {selectedLetter?.company
                      ? `${selectedLetter.company} — ${selectedLetter.role}`
                      : "Generated Cover Letter"}
                  </h3>
                  <p className="text-[10px] text-text-tertiary">
                    Formatted letter ready to submit or copy
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary shadow-xs transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-success" />
                        <span className="text-success">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-accent" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white hover:bg-accent-hover shadow-xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Print / PDF</span>
                  </button>
                </div>
              </div>

              {/* Document Text Area */}
              <div className="rounded-xl border border-border bg-[#FCFDFD] p-6 shadow-inner">
                <textarea
                  rows={18}
                  value={activeContent || selectedLetter?.content || ""}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    setActiveContent(nextVal);
                    if (selectedLetter) {
                      setSelectedLetter({ ...selectedLetter, content: nextVal });
                    }
                  }}
                  className="w-full font-serif text-xs leading-relaxed text-[#2B2D31] bg-transparent focus:outline-none resize-y"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <Mail className="h-10 w-10 text-accent/40 mb-3" />
              <h3 className="text-base font-bold text-text-primary">
                Your Cover Letter Preview
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mt-1">
                Fill out the role details on the left to generate an executive, tailored cover letter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
