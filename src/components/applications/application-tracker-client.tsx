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
  FileText,
  X,
  Loader2,
} from "lucide-react";

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
  { id: "saved", label: "Saved", color: "text-text-secondary", bg: "bg-surface-secondary", icon: Clock },
  { id: "applied", label: "Applied", color: "text-accent", bg: "bg-brand-50", icon: Briefcase },
  { id: "interview", label: "Interviewing", color: "text-amber-600", bg: "bg-amber-50", icon: Calendar },
  { id: "offer", label: "Offer Received", color: "text-success", bg: "bg-success-light", icon: CheckCircle2 },
  { id: "rejected", label: "Archived", color: "text-text-tertiary", bg: "bg-surface-tertiary", icon: XCircle },
];

export function ApplicationTrackerClient({
  initialApplications,
  resumes,
}: ApplicationTrackerClientProps) {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("applied");
  const [notes, setNotes] = useState("");
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || "");

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

  const total = applications.length;
  const inPipeline = applications.filter((a) => a.status === "applied" || a.status === "interview").length;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const offers = applications.filter((a) => a.status === "offer").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Job Application Tracker
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary">
            Keep your search organized across every application, interview, and offer stage.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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
                {stageApps.length === 0 ? (
                  <div className="text-center py-10 text-[11px] text-text-tertiary">
                    Empty stage
                  </div>
                ) : (
                  stageApps.map((app) => (
                    <div
                      key={app.id}
                      className="rounded-xl border border-border bg-surface p-3.5 shadow-xs transition-shadow hover:shadow-md space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="truncate">
                          <h4 className="font-bold text-text-primary text-xs truncate">
                            {app.company}
                          </h4>
                          <p className="text-[11px] text-text-secondary truncate">{app.role}</p>
                        </div>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="rounded p-1 text-text-tertiary hover:text-danger hover:bg-danger-light"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>

                      {app.resumes?.title && (
                        <div className="flex items-center gap-1 text-[10px] text-text-tertiary truncate">
                          <FileText className="h-3 w-3" />
                          <span className="truncate">{app.resumes.title}</span>
                        </div>
                      )}

                      {app.notes && (
                        <p className="text-[10px] text-text-secondary line-clamp-2 bg-surface-secondary rounded p-1.5">
                          {app.notes}
                        </p>
                      )}

                      {/* Stage Move Dropdown */}
                      <div className="pt-1 flex items-center justify-between border-t border-border">
                        <select
                          value={app.status}
                          onChange={(e) =>
                            handleStatusChange(app.id, e.target.value as ApplicationStatus)
                          }
                          className="rounded border border-border bg-surface-secondary px-2 py-0.5 text-[10px] text-text-secondary focus:outline-none"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              Move to: {s.label}
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

      {/* Add Application Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-text-primary">Track New Job Application</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-text-tertiary hover:bg-surface-secondary"
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
                  placeholder="e.g. OpenAI, Stripe, Linear"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Role Title *
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
                  placeholder="e.g. Referred by Alex, $160k base target, interview on Friday..."
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
