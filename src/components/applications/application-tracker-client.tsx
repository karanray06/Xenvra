"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Bookmark,
  BookmarkCheck,
  Download,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { NormalizedJob } from "@/app/api/jobs/search/route";

export type ApplicationStatus = "saved" | "applied" | "interview" | "offer" | "rejected";

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  jd_text?: string;
  status: ApplicationStatus;
  notes?: string;
  salary?: string;
  location?: string;
  job_url?: string;
  source?: string;
  deadline?: string;
  follow_up_date?: string;
  contact_person?: string;
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
  border: string;
  icon: React.ElementType;
}[] = [
  { id: "saved", label: "Wishlist", color: "text-[#5E534D]", bg: "bg-[#F5F9FB]", border: "border-[#C9CCD1]", icon: Clock },
  { id: "applied", label: "Applied", color: "text-[#5A4032]", bg: "bg-[#E6EEF4]/60", border: "border-[#5A4032]/40", icon: Briefcase },
  { id: "interview", label: "Interviewing", color: "text-amber-800", bg: "bg-amber-50/70", border: "border-amber-300", icon: Calendar },
  { id: "offer", label: "Offer Received", color: "text-emerald-800", bg: "bg-emerald-50/80", border: "border-emerald-300", icon: CheckCircle2 },
  { id: "rejected", label: "Archived", color: "text-[#8A8F98]", bg: "bg-[#FAF8F5]", border: "border-[#C9CCD1]", icon: XCircle },
];

export function ApplicationTrackerClient({
  initialApplications,
  resumes,
}: ApplicationTrackerClientProps) {
  const [activeTab, setActiveTab] = useState<"search" | "saved" | "pipeline">("search");
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // New Application Form State
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [salary, setSalary] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || "");

  // Search Tab Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("India");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [experienceLevel, setExperienceLevel] = useState<string>("all");
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [jobs, setJobs] = useState<NormalizedJob[]>([]);
  const [isProUser, setIsProUser] = useState(false);
  const [lockedJobsCount, setLockedJobsCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);

  // Saved / Wishlist local state
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  // Apply Side Sheet State
  const [activeApplyingJob, setActiveApplyingJob] = useState<NormalizedJob | null>(null);
  const [appliedConfirmOpen, setAppliedConfirmOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // DnD sensors for drag-and-drop kanban
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCreate = async () => {
    if (!company.trim() || !role.trim()) {
      showToast("Company name and role are required", "error");
      return;
    }
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
          salary,
          location,
          job_url: jobUrl,
          resume_id: selectedResumeId || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create application");
      }

      const created = await res.json();
      setApplications([created, ...applications]);
      setIsModalOpen(false);
      setCompany("");
      setRole("");
      setSalary("");
      setLocation("");
      setJobUrl("");
      setNotes("");
      showToast(`Added ${role} at ${company} to tracking pipeline!`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create application", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      showToast(`Moved to ${STAGES.find((s) => s.id === newStatus)?.label}`);
    } catch {
      showToast("Failed to update application status", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this application?")) return;
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete application");

      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast("Application removed from tracker");
    } catch {
      showToast("Failed to delete application", "error");
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const appId = String(active.id);
    const targetStage = String(over.id) as ApplicationStatus;

    const app = applications.find((a) => a.id === appId);
    if (app && app.status !== targetStage) {
      handleStatusChange(appId, targetStage);
    }
  };

  // Job Search Caller
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
          remote: remoteOnly,
          experienceLevel,
          resumeId: selectedResumeId || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setIsProUser(data.isPro);
        setLockedJobsCount(data.lockedCount || 0);
      } else {
        showToast("Error searching jobs", "error");
      }
    } catch {
      showToast("Network error searching jobs", "error");
    } finally {
      setIsSearchingJobs(false);
    }
  };

  // Toggle Save / Wishlist
  const toggleSaveJob = async (job: NormalizedJob) => {
    const isSaved = savedJobIds.includes(job.id);
    if (isSaved) {
      setSavedJobIds((prev) => prev.filter((id) => id !== job.id));
      showToast(`Removed ${job.title} from saved listings`);
    } else {
      setSavedJobIds((prev) => [...prev, job.id]);
      // Also add to Wishlist stage in applications
      try {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: job.company,
            role: job.title,
            status: "saved",
            notes: `Saved opportunity from ${job.source}. Match score: ${job.matchScore}%. URL: ${job.url}`,
            salary: job.salary,
            location: job.location,
            job_url: job.url,
            resume_id: selectedResumeId || null,
          }),
        });
        if (res.ok) {
          const created = await res.json();
          setApplications([created, ...applications]);
          showToast(`Saved ${job.title} at ${job.company} to Wishlist!`);
        }
      } catch {
        // ignore
      }
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (applications.length === 0) {
      showToast("No applications to export", "error");
      return;
    }
    const headers = ["Company", "Role", "Status", "Applied Date", "Salary", "Location", "Job URL", "Notes"];
    const rows = applications.map((a) => [
      `"${a.company.replace(/"/g, '""')}"`,
      `"${a.role.replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.applied_at || a.created_at}"`,
      `"${a.salary || ""}"`,
      `"${a.location || ""}"`,
      `"${a.job_url || ""}"`,
      `"${(a.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `xenvra_job_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Downloaded applications CSV");
  };

  // Copy helper
  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Funnel calculations
  const total = applications.length;
  const inReview = applications.filter((a) => a.status === "applied").length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const offers = applications.filter((a) => a.status === "offer").length;
  const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;

  const savedJobsList = useMemo(() => {
    return jobs.filter((j) => savedJobIds.includes(j.id));
  }, [jobs, savedJobIds]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 animate-fade-in">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold shadow-lg text-white ${
            toastType === "success" ? "bg-[#5A4032]" : "bg-red-700"
          }`}
        >
          {toastType === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#C9CCD1] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1 rounded-full bg-[#E6EEF4] px-2.5 py-0.5 text-[11px] font-bold text-[#5A4032]">
              <Briefcase className="h-3 w-3" /> Career Opportunities & Pipeline
            </span>
            <span className="text-xs text-[#8A8F98]">· {total} Applications Tracked</span>
          </div>
          <h1 className="text-2xl font-bold text-[#241915] sm:text-3xl">
            Jobs & Application Tracker
          </h1>
          <p className="mt-1 text-xs text-[#5E534D]">
            Match verified employer listings, launch tailored application kits, and monitor your interview pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[#C9CCD1] bg-white px-3.5 py-2 text-xs font-semibold text-[#241915] hover:bg-[#F6F1EE] transition-colors cursor-pointer shadow-2xs"
            title="Export tracking data to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#5A4032] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2B22] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Stage Funnel Stats Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8F98]">Total Tracked</span>
          <p className="text-xl font-extrabold text-[#241915] mt-0.5">{total}</p>
        </div>
        <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8F98]">In Review</span>
          <p className="text-xl font-extrabold text-[#5A4032] mt-0.5">{inReview}</p>
        </div>
        <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8F98]">Interviewing</span>
          <p className="text-xl font-extrabold text-amber-700 mt-0.5">{interviews}</p>
        </div>
        <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A8F98]">Offers</span>
          <p className="text-xl font-extrabold text-emerald-700 mt-0.5">{offers}</p>
        </div>
        <div className="rounded-xl border border-[#C9CCD1] bg-[#E6EEF4]/60 p-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A4032] flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Response Rate
          </span>
          <p className="text-xl font-extrabold text-[#241915] mt-0.5">{responseRate}%</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#C9CCD1] gap-4">
        <button
          onClick={() => setActiveTab("search")}
          className={`pb-3 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "search"
              ? "border-[#5A4032] text-[#5A4032]"
              : "border-transparent text-[#5E534D] hover:text-[#241915]"
          }`}
        >
          <Search className="h-4 w-4" />
          <span>Search & Match Jobs</span>
        </button>

        <button
          onClick={() => setActiveTab("saved")}
          className={`pb-3 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "saved"
              ? "border-[#5A4032] text-[#5A4032]"
              : "border-transparent text-[#5E534D] hover:text-[#241915]"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          <span>Saved Listings ({savedJobIds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pipeline")}
          className={`pb-3 text-xs font-bold transition-colors flex items-center gap-2 border-b-2 cursor-pointer ${
            activeTab === "pipeline"
              ? "border-[#5A4032] text-[#5A4032]"
              : "border-transparent text-[#5E534D] hover:text-[#241915]"
          }`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Applications Kanban ({total})</span>
        </button>
      </div>

      {/* TAB 1: Search & Match Jobs */}
      {activeTab === "search" && (
        <div className="space-y-6">
          {/* Search Controls */}
          <div className="rounded-2xl border border-[#C9CCD1] bg-white p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#8A8F98]" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company (e.g. Next.js, Swiggy)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchJobs()}
                  className="w-full rounded-xl border border-[#C9CCD1] bg-white pl-9 pr-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                >
                  <option value="India">Pan-India (All Cities)</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Gurugram">Gurugram / NCR</option>
                  <option value="Mumbai">Mumbai / Pune</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Remote">Remote Only</option>
                </select>
              </div>

              <div>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                >
                  <option value="all">All Experience Levels</option>
                  <option value="fresher">Fresher / Intern</option>
                  <option value="junior">Junior (1-3 yrs)</option>
                  <option value="mid">Mid-Level (3-6 yrs)</option>
                  <option value="senior">Senior / Lead (6+ yrs)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#C9CCD1]">
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[#5E534D]">
                  <input
                    type="checkbox"
                    checked={remoteOnly}
                    onChange={(e) => setRemoteOnly(e.target.checked)}
                    className="rounded border-[#C9CCD1] text-[#5A4032]"
                  />
                  <span>Remote Only</span>
                </label>

                {resumes.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-[#5E534D]">
                    <span className="font-semibold text-[#241915]">Match With:</span>
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="rounded-lg border border-[#C9CCD1] bg-white px-2 py-1 text-xs focus:border-[#5A4032] focus:outline-none"
                    >
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={handleSearchJobs}
                disabled={isSearchingJobs}
                className="flex items-center gap-2 rounded-xl bg-[#5A4032] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2B22] transition-colors cursor-pointer"
              >
                {isSearchingJobs ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Find Matches</span>
              </button>
            </div>
          </div>

          {/* Job Listings Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#241915] uppercase tracking-wider">
                {hasSearched ? `Matching Opportunities (${jobs.length})` : "Curated High-Growth Opportunities"}
              </h2>
              <span className="text-[11px] text-[#8A8F98]">Deterministic ATS match scoring enabled</span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {(jobs.length > 0 ? jobs : []).map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                return (
                  <div
                    key={job.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#C9CCD1] bg-white p-5 shadow-xs hover:border-[#5A4032] transition-all"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#5A4032] text-xs uppercase tracking-wider">
                              {job.company}
                            </span>
                            <span className="text-[10px] text-[#8A8F98]">· {job.postedDate}</span>
                          </div>
                          <h3 className="text-base font-extrabold text-[#241915] mt-0.5">
                            {job.title}
                          </h3>
                        </div>

                        {/* Match Score Badge */}
                        <div className="flex flex-col items-end">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 shadow-2xs">
                            <Sparkles className="h-3 w-3" /> {job.matchScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Location & Salary */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#5E534D] mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#8A8F98]" /> {job.location}
                        </span>
                        {job.salary && (
                          <span className="font-semibold text-[#241915] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#C9CCD1]">
                            {job.salary}
                          </span>
                        )}
                        <span className="rounded bg-[#E6EEF4] px-2 py-0.5 text-[10px] font-bold text-[#5A4032]">
                          {job.source}
                        </span>
                      </div>

                      <p className="text-xs text-[#5E534D] leading-relaxed line-clamp-2 mb-3">
                        {job.description}
                      </p>

                      {/* Keyword tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {job.tags.map((tag) => {
                          const isMatched = job.matchedKeywords?.includes(tag);
                          return (
                            <span
                              key={tag}
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                isMatched
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : "bg-[#F6F1EE] text-[#5E534D]"
                              }`}
                            >
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between border-t border-[#C9CCD1] pt-3">
                      <button
                        onClick={() => toggleSaveJob(job)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                          isSaved ? "text-[#5A4032]" : "text-[#8A8F98] hover:text-[#241915]"
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                        <span>{isSaved ? "Saved to Wishlist" : "Save for Later"}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveApplyingJob(job);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#5A4032] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2B22] transition-colors cursor-pointer"
                      >
                        <span>Apply with Kit</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pro Gate Banner if Free */}
            {!isProUser && lockedJobsCount > 0 && (
              <div className="rounded-2xl border border-[#5A4032]/30 bg-[#FAF8F5] p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#E6EEF4] text-[#5A4032] flex items-center justify-center mx-auto">
                  <Lock className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-[#241915]">
                  Unlock {lockedJobsCount} More Matched Opportunities
                </h3>
                <p className="text-xs text-[#5E534D] max-w-md mx-auto">
                  Pro members receive unlimited job feed searches, full keyword match breakdowns, and 1-click tailored application kits.
                </p>
                <Link
                  href="/dashboard/settings#billing"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5A4032] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#3D2B22]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Upgrade to Pro (₹49)</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Saved Listings */}
      {activeTab === "saved" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#241915] uppercase tracking-wider">
              Saved Jobs Wishlist ({savedJobsList.length})
            </h2>
          </div>

          {savedJobsList.length === 0 ? (
            <div className="rounded-2xl border border-[#C9CCD1] bg-white p-12 text-center text-xs text-[#8A8F98] space-y-2">
              <Bookmark className="mx-auto h-8 w-8 opacity-40 text-[#5A4032]" />
              <p className="font-bold text-[#241915]">No saved jobs yet</p>
              <p>Bookmark opportunities in the Search tab to build your application target list.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {savedJobsList.map((job) => (
                <div key={job.id} className="rounded-2xl border border-[#C9CCD1] bg-white p-5 shadow-xs">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-[#5A4032]">{job.company}</span>
                      <h3 className="text-base font-bold text-[#241915]">{job.title}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                      {job.matchScore}% Match
                    </span>
                  </div>
                  <p className="text-xs text-[#5E534D] mb-4">{job.description}</p>
                  <div className="flex justify-between items-center border-t border-[#C9CCD1] pt-3">
                    <button
                      onClick={() => toggleSaveJob(job)}
                      className="text-xs text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => setActiveApplyingJob(job)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#5A4032] hover:underline cursor-pointer"
                    >
                      <span>Prepare Application Kit →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Applications Kanban */}
      {activeTab === "pipeline" && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 items-start">
            {STAGES.map((stage) => {
              const stageApps = applications.filter((a) => a.status === stage.id);
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  id={stage.id}
                  className={`flex flex-col rounded-2xl border ${stage.border} ${stage.bg} p-3.5 min-h-[460px] space-y-3`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#C9CCD1]/60">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`h-4 w-4 ${stage.color}`} />
                      <span className="text-xs font-bold text-[#241915]">{stage.label}</span>
                    </div>
                    <span className="rounded-full bg-white border border-[#C9CCD1] px-2 py-0.5 text-[10px] font-bold text-[#5A4032]">
                      {stageApps.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5 flex-1">
                    {stageApps.length === 0 ? (
                      <div className="py-8 text-center text-[11px] text-[#8A8F98] italic">
                        No applications in {stage.label.toLowerCase()}
                      </div>
                    ) : (
                      stageApps.map((app) => (
                        <div
                          key={app.id}
                          id={app.id}
                          className="group relative rounded-xl border border-[#C9CCD1] bg-white p-3.5 shadow-2xs hover:border-[#5A4032] transition-all space-y-2 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A4032]">
                                {app.company}
                              </p>
                              <h4 className="text-xs font-bold text-[#241915] leading-snug">
                                {app.role}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="p-1 text-[#8A8F98] hover:text-red-600 transition-colors"
                                title="Delete application"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {app.location && (
                            <p className="text-[10px] text-[#5E534D] flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5 text-[#8A8F98]" /> {app.location}
                            </p>
                          )}

                          {app.salary && (
                            <span className="inline-block rounded bg-[#FAF8F5] border border-[#C9CCD1] px-1.5 py-0.5 text-[9px] font-semibold text-[#241915]">
                              {app.salary}
                            </span>
                          )}

                          {app.resumes?.title && (
                            <div className="text-[10px] text-[#5A4032] font-medium flex items-center gap-1 pt-1 border-t border-[#C9CCD1]/50">
                              <span>Resume:</span>
                              <span className="truncate max-w-[120px]">{app.resumes.title}</span>
                            </div>
                          )}

                          {/* Quick Stage Mover Selector */}
                          <div className="pt-1.5 border-t border-[#C9CCD1]/40 flex items-center justify-between text-[10px]">
                            <span className="text-[#8A8F98]">Move to:</span>
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                              className="rounded border border-[#C9CCD1] bg-[#FAF8F5] px-1.5 py-0.5 text-[10px] font-semibold text-[#241915] focus:outline-none"
                            >
                              {STAGES.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DndContext>
      )}

      {/* Manual Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#C9CCD1] bg-white p-6 shadow-2xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-[#C9CCD1] pb-3">
              <h3 className="text-base font-bold text-[#241915]">Add Job Application</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8A8F98] hover:text-[#241915]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#5E534D]">Company Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Swiggy, Google"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#5E534D]">Role Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#5E534D]">Location / Remote</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#5E534D]">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹25L - ₹35L"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#5E534D]">Pipeline Stage</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                  className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                >
                  {STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#5E534D]">Resume Linked</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
                >
                  <option value="">None / Standalone</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5E534D]">Job URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#5E534D]">Notes & Key Contacts</label>
              <textarea
                placeholder="Referral name, recruiter contact, interview round topics..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full mt-1 rounded-xl border border-[#C9CCD1] bg-white px-3 py-2 text-xs focus:border-[#5A4032] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#C9CCD1]">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-[#C9CCD1] px-4 py-2 text-xs font-semibold text-[#241915]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-xl bg-[#5A4032] px-4 py-2 text-xs font-bold text-white hover:bg-[#3D2B22]"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save to Pipeline</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Kit Side Sheet */}
      {activeApplyingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs select-none">
          <div className="h-full w-full max-w-md bg-white border-l border-[#C9CCD1] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#C9CCD1] pb-3">
                <div>
                  <span className="text-[10px] font-bold text-[#5A4032] uppercase tracking-wider">Application Kit</span>
                  <h3 className="text-base font-extrabold text-[#241915]">{activeApplyingJob.company}</h3>
                  <p className="text-xs text-[#5E534D]">{activeApplyingJob.title}</p>
                </div>
                <button
                  onClick={() => setActiveApplyingJob(null)}
                  className="rounded-lg p-1 text-[#8A8F98] hover:text-[#241915]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step 1: Resume */}
              <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-[#8A8F98] uppercase">Step 1: Application Resume</span>
                <div className="flex items-center justify-between">
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="rounded-lg border border-[#C9CCD1] bg-white px-2 py-1 text-xs text-[#241915] font-semibold"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.title}
                      </option>
                    ))}
                  </select>

                  <Link
                    href={`/dashboard/tailor?job=${activeApplyingJob.id}`}
                    className="text-[11px] font-bold text-[#5A4032] hover:underline flex items-center gap-1"
                  >
                    <span>Tailor for this JD →</span>
                  </Link>
                </div>
              </div>

              {/* Step 2: Cover Letter */}
              <div className="rounded-xl border border-[#C9CCD1] bg-[#FAF8F5] p-3.5 space-y-2">
                <span className="text-[10px] font-bold text-[#8A8F98] uppercase">Step 2: Cover Letter</span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#5E534D]">AI-Crafted for {activeApplyingJob.company}</span>
                  <Link
                    href={`/dashboard/cover-letters?company=${encodeURIComponent(activeApplyingJob.company)}&role=${encodeURIComponent(activeApplyingJob.title)}`}
                    className="text-[11px] font-bold text-[#5A4032] hover:underline"
                  >
                    Generate Cover Letter →
                  </Link>
                </div>
              </div>

              {/* Step 3: Copy-Ready Quick Answers */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-[#8A8F98] uppercase">Step 3: Copy-Ready Answers</span>
                <div className="space-y-1.5">
                  {[
                    { label: "Portfolio URL", text: "https://xenvra.com/p/portfolio" },
                    { label: "Work Eligibility", text: "Authorized to work in India and globally for remote roles." },
                    { label: "Notice Period", text: "Immediate to 30 days." },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-2 rounded-lg border border-[#C9CCD1] bg-white text-xs"
                    >
                      <div>
                        <p className="text-[10px] text-[#8A8F98] font-bold">{item.label}</p>
                        <p className="text-[11px] text-[#241915] line-clamp-1">{item.text}</p>
                      </div>
                      <button
                        onClick={() => handleCopyText(item.label, item.text)}
                        className="p-1 text-[#5A4032] hover:bg-[#E6EEF4] rounded transition"
                      >
                        {copiedKey === item.label ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 4: Open Employer Page via Safe Redirect */}
              <div className="pt-2">
                <a
                  href={`/go/${activeApplyingJob.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setAppliedConfirmOpen(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5A4032] py-3 text-xs font-bold text-white shadow-xs hover:bg-[#3D2B22] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open {activeApplyingJob.company} Apply Page</span>
                </a>
                <p className="text-[10px] text-[#8A8F98] text-center mt-1.5">
                  Opens official verified career page in a new secure tab.
                </p>
              </div>
            </div>

            {/* Prompt on Return */}
            {appliedConfirmOpen && (
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Did you complete your application?</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Move {activeApplyingJob.title} at {activeApplyingJob.company} to your Applied tracking column!
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch("/api/applications", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            company: activeApplyingJob.company,
                            role: activeApplyingJob.title,
                            status: "applied",
                            applied_at: new Date().toISOString(),
                            notes: `Applied on ${new Date().toLocaleDateString("en-IN")}. Match score: ${activeApplyingJob.matchScore}%.`,
                            salary: activeApplyingJob.salary,
                            location: activeApplyingJob.location,
                            job_url: activeApplyingJob.url,
                            resume_id: selectedResumeId || null,
                          }),
                        });
                        if (res.ok) {
                          const created = await res.json();
                          setApplications([created, ...applications]);
                          showToast(`Recorded application to ${activeApplyingJob.company}!`);
                        }
                      } finally {
                        setAppliedConfirmOpen(false);
                        setActiveApplyingJob(null);
                        setActiveTab("pipeline");
                      }
                    }}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                  >
                    Yes, Move to Applied
                  </button>
                  <button
                    onClick={() => {
                      setAppliedConfirmOpen(false);
                      setActiveApplyingJob(null);
                    }}
                    className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                  >
                    Not Yet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
