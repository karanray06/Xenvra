import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Palette,
  Sparkles,
  Layers,
  Layout,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Eye,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Vector Studio — Xenvra",
  description: "Penpot-style vector design artboard for custom visual resumes and assets.",
};

const STUDIO_PRESETS = [
  {
    id: "preset-blank",
    title: "Blank A4 Vector Artboard",
    desc: "Clean 794x1123 canvas with millimeter grid snapping, text blocks, and vector shapes.",
    badge: "Freeform",
    bg: "bg-surface-secondary",
  },
  {
    id: "preset-executive",
    title: "Executive Slate Artboard",
    desc: "Navy/Charcoal geometry with pre-aligned header band and typographic hierarchy.",
    badge: "Executive",
    bg: "bg-brand-50/40",
  },
  {
    id: "preset-split",
    title: "Modern Dual Column",
    desc: "Divided vector layout with accent sidebar cards and progress indicator nodes.",
    badge: "Modern",
    bg: "bg-emerald-50/30",
  },
  {
    id: "preset-creative",
    title: "Creative Grid Portfolio",
    desc: "High-contrast layout designed for designers and art directors with project spotlights.",
    badge: "Creative",
    bg: "bg-purple-50/30",
  },
];

export default async function StudioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch recent resumes with vector design_json
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, template_id, design_json, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(8);

  const designResumes = (resumes || []).filter(
    (r) => r.design_json && typeof r.design_json === "object"
  );

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-accent">
              <Palette className="h-3 w-3" /> Penpot-Grade Vector Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Vector Design Studio
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Drag-and-drop vector artboard for unrestricted visual resumes, badges, dividers, and graphics.
          </p>
        </div>

        <Link
          href="/dashboard/builder"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Launch Vector Studio</span>
        </Link>
      </div>

      {/* Preset Templates */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          Studio Artboard Presets
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDIO_PRESETS.map((p) => (
            <Link
              key={p.id}
              href="/dashboard/builder"
              className={`group flex flex-col justify-between rounded-2xl border border-border ${p.bg} p-5 transition-all hover:border-accent hover:shadow-md`}
            >
              <div>
                <span className="rounded-md bg-white border border-border px-2 py-0.5 text-[10px] font-bold text-text-primary uppercase">
                  {p.badge}
                </span>
                <h3 className="text-sm font-bold text-text-primary mt-3 group-hover:text-accent transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                  {p.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-accent">
                <span>Open Canvas</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Your Vector Designs */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <FileCode className="h-4 w-4 text-accent" />
          Saved Vector Artboards ({resumes?.length || 0})
        </h2>

        {resumes && resumes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-accent/40 hover:shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-text-tertiary">
                      {new Date(r.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {r.design_json ? (
                      <span className="rounded-full bg-success-light px-2 py-0.5 text-[10px] font-bold text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Vector Artboard
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                        Standard Doc
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-text-primary text-sm">{r.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Template: {r.template_id}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/dashboard/builder?id=${r.id}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
                  >
                    <span>Open in Studio →</span>
                  </Link>
                  <Link
                    href={`/print/${r.id}`}
                    target="_blank"
                    className="flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-primary"
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <Palette className="h-10 w-10 text-accent/40 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">No designs yet</h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto mt-1">
              Start with any of the presets above or convert an existing resume into a freeform vector canvas.
            </p>
          </div>
        )}
      </div>

      {/* Security & Feature Matrix Callout */}
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">DOMPurify SVG Sanitization</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              All imported graphics are stripped of scripts, external references, and malicious handlers before rendering.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Layers className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">Penpot Layer Hierarchy</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Reorder, lock, hide, group, and align text and vector nodes with millimeter precision.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileCode className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">Vector Export Suite</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Download clean native SVG, high-resolution 2x PNG, or print-ready A4 PDF directly from the editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
