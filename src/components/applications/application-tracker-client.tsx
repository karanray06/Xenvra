"use client";

import { useState } from "react";
import {
  Briefcase,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  XCircle,
  Trash2,
  X,
  Loader2,
  Search,
  Sparkles,
  MapPin,
  Lock,
  ArrowUpRight,
} from "lucide-react";
import type { NormalizedJob } from "@/app/api/jobs/search/route";

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  jd_text?: string;
  status: ApplicationStatus;
  notes?: string;
  resume_id?: string | null;
  applied_at?: string | null;
  created_at: string;
  resumes?: { title: string } | null;
}

interface ApplicationTrackerClientProps {
  initialApplications: JobApplication[];
  resumes: { id: string; title: string }[];
}

const STAGES: {
  id: ApplicationStatus;
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
}[] = [
  { id: "saved", label: "Wishlist", color: "text-text-secondary", bg: "bg-surface-secondary", icon: Clock },
  { id: "applied", label: "Applied", color: "text-accent", bg: "bg-brand-50", icon: Briefcase },
  { id: "interview", label: "Interviewing", color: "text-amber-600", bg: "bg-amber-50", icon: Calendar },
  { id: "offer", label: "Offer Received", color: "text-success", bg: "bg-success-light", icon: CheckCircle2 },
  { id: "rejected", label: "Archived", color: "text-text-tertiary", bg: "bg-surface-tertiary", icon: XCircle },
];

export function ApplicationTrackerClient({
  initialApplications,
  resumes,
}: ApplicationTrackerClientProps) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "jobs">("pipeline");
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [notes, setNotes] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || "");

  // Job Search State
  const [searchQuery, setSearchQuery] = useState("all");
  const [searchLocation, setSearchLocation] = useState("India");
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [jobs, setJobs] = useState<NormalizedJob[]>([]);
  const [isProUser, setIsProUser] = useState(false);
  const [lockedJobsCount, setLockedJobsCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Apply Modal State
  const [activeApplyingJob, setActiveApplyingJob] = useState<NormalizedJob | null>(null);
  const [appliedConfirmOpen, setAppliedConfirmOpen] = useState(false);

  const handleCreate = async () => {
    if (!company.trim() || !role.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          status,
          notes,
          resume_id: selectedResumeId || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create application");
      const created = await res.json();
      setApplications([created, ...applications]);
      setIsModalOpen(false);
      setCompany("");
      setRole("");
      setNotes("");
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;
    try {
      await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
    }
  };

  // -------------------------------------------------------------------------
  // Search Jobs API Caller
  // -------------------------------------------------------------------------
  const handleSearchJobs = async () => {
    setIsSearchingJobs(true);
    setHasSearched(true);
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery || "all",
          location: searchLocation,
          resumeId: selectedResumeId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setIsProUser(data.isPro);
        setLockedJobsCount(data.lockedCount || 0);
      }
    } catch {
      // fallback
    } finally {
      setIsSearchingJobs(false);
    }
  };

  // 1-Click Save from Job Search to Pipeline
  const handleSaveJobToTracker = async (job: NormalizedJob) => {
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: job.company,
          role: job.title,
          status: "saved",
          notes: `Saved from Direct Apply. Source: ${job.source}. Match Score: ${job.matchScore}%. URL: ${job.url}`,
          resume_id: selectedResumeId || null,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setApplications([created, ...applications]);
        alert(`Saved ${job.title} at ${job.company} to your Wishlist column!`);
      }
    } catch {
      // ignore
    }
  };

  // 1-Click Apply Flow
  const handleOpenJobApplication = (job: NormalizedJob) => {
    // Open employer URL in safe new tab (https only, validated, rel="noopener noreferrer")
    window.open(job.url, "_blank", "noopener,noreferrer");
    setAppliedConfirmOpen(true);
  };

  const handleConfirmApplied = async () => {
    if (!activeApplyingJob) return;

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: activeApplyingJob.company,
          role: activeApplyingJob.title,
          status: "applied",
          applied_at: new Date().toISOString(),
          notes: `Direct application submitted on ${new Date().toLocaleDateString("en-IN")}. Match score: ${activeApplyingJob.matchScore}%.`,
          resume_id: selectedResumeId || null,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setApplications([created, ...applications]);
      }
    } catch {
      // ignore
    } finally {
      setAppliedConfirmOpen(false);
      setActiveApplyingJob(null);
      setActiveTab("pipeline");
    }
  };

  const total = applications.length;
  const inPipeline = applications.filter((a) => a.status === "applied" || a.status === "interview").length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const offers = applications.filter((a) => a.status === "offer").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Job Tracker &amp; Aggregator
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary">
            Search live direct-employer openings, track pipeline stages, and manage interview schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex rounded-xl border border-border bg-surface p-1 shadow-xs">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "pipeline" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Pipeline ({applications.length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("jobs");
                if (!hasSearched) handleSearchJobs();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === "jobs" ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Find Jobs</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Card</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: KANBAN PIPELINE */}
      {/* ===================================================================== */}
      {activeTab === "pipeline" && (
        <>
          {/* Metrics Banner */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
              <p className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                Total Tracked
              </p>
              <p className="mt-1 text-2xl font-extrabold text-text-primary">{total}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
              <p className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                Active Pipeline
              </p>
              <p className="mt-1 text-2xl font-extrabold text-accent">{inPipeline}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
              <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">
                Interviews
              </p>
              <p className="mt-1 text-2xl font-extrabold text-amber-600">{interviews}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
              <p className="text-[11px] font-semibold text-success uppercase tracking-wider">
                Offers Received
              </p>
              <p className="mt-1 text-2xl font-extrabold text-success">{offers}</p>
            </div>
          </div>

          {/* Kanban Board Columns */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {STAGES.map((stage) => {
              const StageIcon = stage.icon;
              const stageApps = applications.filter((a) => a.status === stage.id);

              return (
                <div
                  key={stage.id}
                  className="flex flex-col rounded-2xl border border-border bg-surface-secondary/40 p-3 min-h-[450px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-border">
                    <div className="flex items-center gap-1.5">
                      <StageIcon className={`h-4 w-4 ${stage.color}`} />
                      <span className="text-xs font-bold text-text-primary">{stage.label}</span>
                    </div>
                    <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold text-text-secondary border border-border">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-border bg-surface p-3.5 shadow-xs transition-all hover:border-accent/40 hover:shadow-sm"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-text-primary leading-snug">
                              {app.role}
                            </h4>
                            <button
                              onClick={() => handleDelete(app.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-text-tertiary hover:text-danger transition-opacity"
                              title="Delete card"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-[11px] font-medium text-text-secondary mt-0.5">
                            {app.company}
                          </p>

                          {app.notes && (
                            <p className="mt-2 text-[10px] text-text-tertiary line-clamp-2 bg-surface-secondary/60 p-1.5 rounded-lg">
                              {app.notes}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[10px]">
                          {/* Stage Transition Selector */}
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                            className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-secondary focus:border-accent focus:outline-none"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                → {s.label}
                              </option>
                            ))}
                          </select>

                          <span className="text-text-tertiary font-mono">
                            {new Date(app.created_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}

                    {stageApps.length === 0 && (
                      <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border/80 text-center p-3">
                        <p className="text-[11px] text-text-tertiary">No applications</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: FIND JOBS (LIVE AGGREGATOR) */}
      {/* ===================================================================== */}
      {activeTab === "jobs" && (
        <div className="space-y-6">
          {/* Search Controls */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Job title, skill, or company (e.g. Product Designer, React, Swiggy)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-secondary py-2 pl-9 pr-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div className="relative sm:w-48">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Location (India / Remote)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface-secondary py-2 pl-9 pr-3 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              {resumes.length > 0 && (
                <div className="sm:w-56">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        Match vs: {r.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={handleSearchJobs}
                disabled={isSearchingJobs}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60"
              >
                {isSearchingJobs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                <span>Find Jobs</span>
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
                Direct-Employer Openings ({jobs.length})
              </h3>
              {!isProUser && lockedJobsCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                  <Lock className="h-3 w-3" />
                  Showing 3 free previews ({lockedJobsCount} locked for Pro)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-accent/40 hover:shadow-sm"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-[10px] font-semibold text-text-secondary">
                        {job.source}
                      </span>
                      <span className="flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-bold text-success">
                        <Sparkles className="h-3 w-3" /> {job.matchScore}% Match
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-text-primary">{job.title}</h4>
                    <p className="text-xs font-semibold text-accent mt-0.5">{job.company}</p>

                    <div className="flex items-center gap-3 text-[11px] text-text-tertiary mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {job.location}
                      </span>
                      {job.salary && <span className="font-semibold text-text-primary">{job.salary}</span>}
                    </div>

                    <p className="mt-3 text-xs text-text-secondary leading-relaxed line-clamp-3">
                      {job.description}
                    </p>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSaveJobToTracker(job)}
                      className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary shadow-xs transition-colors"
                    >
                      Save to Wishlist
                    </button>

                    <button
                      onClick={() => {
                        setActiveApplyingJob(job);
                        handleOpenJobApplication(job);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors"
                    >
                      <span>Direct Apply</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {jobs.length === 0 && !isSearchingJobs && (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
                <Search className="h-10 w-10 text-accent/40 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-text-primary">No jobs found</h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
                  Try searching for keywords like &apos;React&apos;, &apos;Product Designer&apos;, &apos;Engineer&apos;, or location &apos;India&apos;.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal After Opening External Employer Site */}
      {appliedConfirmOpen && activeApplyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                Did you submit your application?
              </h3>
              <button
                onClick={() => setAppliedConfirmOpen(false)}
                className="rounded p-1 text-text-tertiary hover:bg-surface-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              We opened the official job portal for <strong>{activeApplyingJob.title}</strong> at <strong>{activeApplyingJob.company}</strong> in a new tab. Would you like to move this position to your <strong>Applied</strong> column with today&apos;s timestamp?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setAppliedConfirmOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-secondary"
              >
                Not yet
              </button>
              <button
                onClick={handleConfirmApplied}
                className="flex items-center gap-1.5 rounded-lg bg-success px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-success/90"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Yes, Move to Applied</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-text-primary text-sm">Track New Job Opportunity</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded p-1 text-text-tertiary hover:bg-surface-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Google, Figma, Razorpay"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Target Role / Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Initial Stage
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {resumes.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Resume Version Used
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

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Notes / Compensation / Referral
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Referred by Alex, ₹30L base target, interview on Friday..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary p-2.5 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting || !company.trim() || !role.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                <span>Add Application</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
