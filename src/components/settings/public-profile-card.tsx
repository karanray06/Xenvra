"use client";

import { useState } from "react";
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface PublicProfileCardProps {
  initialProfile: {
    slug: string;
    visibility: string;
    resume_id: string | null;
  } | null;
  viewsCount: number;
  resumes: { id: string; title: string }[];
}

export function PublicProfileCard({
  initialProfile,
  viewsCount,
  resumes,
}: PublicProfileCardProps) {
  const [slug, setSlug] = useState(initialProfile?.slug || "");
  const [visibility, setVisibility] = useState(
    initialProfile?.visibility || "public"
  );
  const [selectedResumeId, setSelectedResumeId] = useState(
    initialProfile?.resume_id || resumes[0]?.id || ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isPublic = visibility === "public";
  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${slug}`
    : `/p/${slug}`;

  const handleSave = async () => {
    if (!slug.trim()) return;
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase(),
          visibility,
          resume_id: selectedResumeId || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update public profile");
      }

      setMessage("Public profile settings saved successfully!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-xl border border-border bg-surface p-6 space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-accent" />
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Public Profile & Portfolio Link
            </h2>
            <p className="text-xs text-text-secondary">
              Publish an interactive web portfolio with live view tracking.
            </p>
          </div>
        </div>

        {/* Views Count Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-brand-50 px-3.5 py-1.5 border border-brand-100">
          <Eye className="h-4 w-4 text-accent" />
          <span className="text-xs font-bold text-accent">
            {viewsCount} {viewsCount === 1 ? "View" : "Views"}
          </span>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-success/30 bg-success-light p-3 text-xs font-semibold text-success flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* Visibility Toggle */}
        <div className="flex items-center justify-between rounded-lg bg-surface-secondary p-3">
          <div>
            <p className="text-xs font-bold text-text-primary">Profile Visibility</p>
            <p className="text-[11px] text-text-secondary">
              Allow anyone with your link to view your online resume.
            </p>
          </div>
          <button
            onClick={() => setVisibility(isPublic ? "private" : "public")}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isPublic ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isPublic ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Custom Slug Input */}
        <div>
          <label className="block text-xs font-bold text-text-primary mb-1">
            Custom URL Slug
          </label>
          <div className="flex rounded-lg border border-border bg-surface-secondary overflow-hidden">
            <span className="inline-flex items-center px-3 text-xs text-text-tertiary bg-surface-tertiary border-r border-border font-mono">
              /p/
            </span>
            <input
              type="text"
              placeholder="yourname"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 bg-transparent px-3 py-2 text-xs text-text-primary font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Select Resume to Showcase */}
        {resumes.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-text-primary mb-1">
              Select Resume to Feature
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

        {/* Public URL Box */}
        {isPublic && slug && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-accent/20 bg-brand-50/40 p-3.5">
            <div className="truncate">
              <p className="text-[10px] font-semibold text-text-tertiary uppercase">
                Your Live Link
              </p>
              <p className="text-xs font-mono font-bold text-accent truncate">
                {publicUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text-secondary hover:text-text-primary"
              >
                {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <a
                href={`/p/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 text-xs font-semibold text-white hover:bg-accent-hover"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Open</span>
              </a>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving || !slug.trim()}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors disabled:opacity-60"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            <span>Save Public Profile</span>
          </button>
        </div>
      </div>
    </section>
  );
}
