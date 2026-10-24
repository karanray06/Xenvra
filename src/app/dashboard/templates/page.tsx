import Link from "next/link";
import { ALL_STUDIO_TEMPLATES } from "@/lib/templates/manifest";
import {
  Layout,
  Lock,
  CheckCircle2,
  Sparkles,
  Presentation,
  FileText,
  CreditCard,
  Award,
  Mail,
} from "lucide-react";

export default async function TemplatesPage(props: {
  searchParams: Promise<{ category?: string; filter?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category || "all";
  const activeFilter = searchParams.filter || "all";

  const categories = [
    { id: "all", label: "All Formats", icon: Layout },
    { id: "presentations", label: "Presentations (10)", icon: Presentation },
    { id: "resumes", label: "Resumes (10)", icon: FileText },
    { id: "linkedin-banners", label: "LinkedIn Banners (4)", icon: CreditCard },
    { id: "certificates", label: "Certificates (4)", icon: Award },
    { id: "business-cards", label: "Business Cards (4)", icon: CreditCard },
    { id: "cover-letters", label: "Cover Letters (4)", icon: Mail },
  ];

  const filteredTemplates = ALL_STUDIO_TEMPLATES.filter((t) => {
    if (activeCategory !== "all") {
      const slugCat = t.category.toLowerCase().replace(/\s+/g, "-");
      const matchCat = slugCat === activeCategory;
      const matchKind = t.kind.toLowerCase() === activeCategory;
      if (!matchCat && !matchKind) return false;
    }
    if (activeFilter === "free" && !t.free) return false;
    if (activeFilter === "ats" && !t.atsSafe) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#C9CCD1] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex items-center gap-1 rounded-full bg-[#E6EEF4] px-2.5 py-0.5 text-[11px] font-bold text-[#5A4032]">
              <Sparkles className="h-3 w-3" /> Studio Originals
            </span>
            <span className="text-xs font-semibold text-[#8A8F98]">
              · {ALL_STUDIO_TEMPLATES.length} Total Templates
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#241915] sm:text-3xl">
            Template Library
          </h1>
          <p className="mt-1 text-xs text-[#5E534D]">
            Investor decks, college vivas, ATS resumes, LinkedIn banners, certificates, and cards — all crafted in Xenvra&apos;s signature brand palette.
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/templates"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "all"
                ? "bg-[#5A4032] text-white shadow-xs"
                : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:text-[#241915] hover:bg-[#F6F1EE]"
            }`}
          >
            All Tiers
          </Link>
          <Link
            href={`/dashboard/templates?${activeCategory !== "all" ? `category=${activeCategory}&` : ""}filter=ats`}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === "ats"
                ? "bg-emerald-700 text-white shadow-xs"
                : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:text-[#241915] hover:bg-[#F6F1EE]"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            ATS-Safe Only
          </Link>
          <Link
            href={`/dashboard/templates?${activeCategory !== "all" ? `category=${activeCategory}&` : ""}filter=free`}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "free"
                ? "bg-[#5A4032] text-white shadow-xs"
                : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:text-[#241915] hover:bg-[#F6F1EE]"
            }`}
          >
            Free Only
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[#C9CCD1] scrollbar-none">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = activeCategory === c.id;
          return (
            <Link
              key={c.id}
              href={`/dashboard/templates?category=${c.id}${activeFilter !== "all" ? `&filter=${activeFilter}` : ""}`}
              className={`whitespace-nowrap flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#5A4032] text-white shadow-xs font-bold"
                  : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:bg-[#F6F1EE] hover:text-[#241915]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{c.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((t) => (
          <Link
            key={t.id}
            href={`/studio?template=${t.id}`}
            className="group relative flex flex-col justify-between rounded-2xl border border-[#C9CCD1] bg-white p-5 shadow-xs transition-all hover:border-[#5A4032] hover:shadow-md"
          >
            <div>
              {/* Badge rail */}
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-md bg-[#F6F1EE] px-2 py-0.5 text-[10px] font-bold text-[#5A4032] uppercase tracking-wider">
                  {t.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {t.atsSafe && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> ATS
                    </span>
                  )}
                  {!t.free && (
                    <span className="flex items-center gap-1 rounded-full bg-[#DCD3F2] px-2 py-0.5 text-[10px] font-bold text-[#5A4032]">
                      <Lock className="h-3 w-3" /> PRO
                    </span>
                  )}
                </div>
              </div>

              {/* Graphic Placeholder Preview */}
              <div className="mb-4 flex h-48 flex-col items-center justify-center rounded-xl bg-[#F6F1EE] border border-[#C9CCD1] transition-colors group-hover:bg-[#E6EEF4]/60 relative overflow-hidden">
                <div className="w-16 h-10 rounded-md bg-white border border-[#C9CCD1] shadow-2xs flex items-center justify-center text-[10px] font-bold text-[#5A4032] mb-2 group-hover:scale-105 transition-transform">
                  {t.aspect}
                </div>
                <span className="text-[11px] font-bold text-[#241915] text-center px-4 line-clamp-1">
                  {t.title}
                </span>
                <span className="text-[10px] text-[#8A8F98] mt-0.5">
                  {t.dimensions.width} × {t.dimensions.height} px
                </span>
              </div>

              <h3 className="font-bold text-[#241915] text-sm flex items-center justify-between group-hover:text-[#5A4032] transition-colors">
                <span>{t.title}</span>
              </h3>
              <p className="mt-1 text-xs text-[#5E534D] leading-relaxed line-clamp-2">
                {t.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#C9CCD1] flex items-center justify-between text-xs font-semibold text-[#5A4032] group-hover:underline">
              <span>Open in Studio →</span>
              <span className="text-[10px] text-[#8A8F98] font-mono">AST Vector</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
