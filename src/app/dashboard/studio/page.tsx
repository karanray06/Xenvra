import { createClient, getUserContext } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Palette,
  Layers,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Eye,
  CheckCircle2,
  Presentation,
  FileText,
  CreditCard,
} from "lucide-react";

export const metadata = {
  title: "Xenvra Studio — Design Resumes, Decks & Career Assets",
  description: "Next-gen design studio for career and campus work: resumes, presentation decks, LinkedIn banners, and visual assets.",
};

const STUDIO_PRESETS = [
  {
    id: "preset-pitch-deck",
    title: "Startup Pitch Deck (16:9)",
    desc: "1920x1080 10-slide anatomy: Problem, Solution, Market, Traction, Team & Roadmap.",
    badge: "Presentation",
    icon: Presentation,
    bg: "bg-[#E6EEF4]/60",
  },
  {
    id: "preset-resume-ats",
    title: "ATS-Safe Executive Resume",
    desc: "Clean A4 format with verified vector text embedding, typographic hierarchy, and photo frame.",
    badge: "Resume",
    icon: FileText,
    bg: "bg-[#DCD3F2]/30",
  },
  {
    id: "preset-college-viva",
    title: "College Project / Viva Deck",
    desc: "Structured project defense slides with architecture diagrams, results, and team credits.",
    badge: "Campus",
    icon: Presentation,
    bg: "bg-[#C9CCD1]/30",
  },
  {
    id: "preset-linkedin-banner",
    title: "LinkedIn Profile Banner",
    desc: "1584x396 pixel-perfect canvas tailored to professional branding and contact callouts.",
    badge: "Social",
    icon: CreditCard,
    bg: "bg-surface-secondary",
  },
];

export default async function StudioPage() {
  const context = await getUserContext();
  if (!context?.user) redirect("/login");

  const { user } = context;
  const supabase = await createClient();

  // Fetch recent documents & designs
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, template_id, design_json, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(8);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-accent">
              <Palette className="h-3 w-3" /> Xenvra Studio Flagship
            </span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            Xenvra Studio
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Design resumes, presentation decks, project vivas, and career assets — in minutes.
          </p>
        </div>

        <Link
          href="/studio"
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Studio Canvas</span>
        </Link>
      </div>

      {/* Preset Document Formats */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <Layers className="h-4 w-4 text-accent" />
          Ready-Made Presets & Formats
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STUDIO_PRESETS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                href="/studio"
                className={`group flex flex-col justify-between rounded-2xl border border-border ${p.bg} p-5 transition-all hover:border-accent hover:shadow-md`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-surface border border-border px-2 py-0.5 text-[10px] font-bold text-text-primary uppercase">
                      {p.badge}
                    </span>
                    <Icon className="h-4 w-4 text-text-tertiary group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-sm font-bold text-text-primary mt-3 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-accent">
                  <span>Open Studio</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Your Saved Documents */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
          <FileCode className="h-4 w-4 text-accent" />
          Saved Studio Documents ({resumes?.length || 0})
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
                      {new Date(r.updated_at).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {r.design_json ? (
                      <span className="rounded-full bg-success-light px-2 py-0.5 text-[10px] font-bold text-success flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Studio Doc
                      </span>
                    ) : (
                      <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary">
                        Document
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-text-primary text-sm">{r.title}</h3>
                  <p className="text-xs text-text-secondary mt-0.5">Template: {r.template_id}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                  <Link
                    href={`/studio?id=${r.id}`}
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
              Start with any of the presets above or design a custom visual resume or pitch deck.
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
              All imported graphics and SVGs are stripped of scripts, external references, and malicious handlers before rendering.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Layers className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">Layer Hierarchy & Guides</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Reorder, lock, hide, group, and snap text and graphic nodes with smart magnetic snapping and alignment guides.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileCode className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">Multi-Format Vector Export</h4>
            <p className="text-[11px] text-text-secondary mt-0.5">
              Export native ATS-readable vector PDF, scalable SVG, high-resolution PNG, and native PPTX presentation slides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
