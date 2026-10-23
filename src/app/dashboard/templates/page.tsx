import Link from "next/link";
import { TEMPLATES } from "@/components/templates/registry";
import { Layout, Lock, CheckCircle2, Sparkles, Filter } from "lucide-react";

export default async function TemplatesPage(props: {
  searchParams: Promise<{ category?: string; filter?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category || "all";
  const activeFilter = searchParams.filter || "all";

  const categories = [
    { id: "all", label: "All" },
    { id: "trending", label: "Trending" },
    { id: "academic", label: "Academic" },
    { id: "acting", label: "Acting" },
    { id: "college", label: "College" },
    { id: "colorful", label: "Colorful" },
    { id: "corporate", label: "Corporate" },
    { id: "creative", label: "Creative" },
    { id: "infographic", label: "Infographic" },
    { id: "minimalist", label: "Minimalist" },
    { id: "modern", label: "Modern" },
    { id: "photo", label: "Photo" },
    { id: "professional", label: "Professional" },
    { id: "seek", label: "SEEK" },
    { id: "scholarship", label: "Scholarship" },
    { id: "simple", label: "Simple" },
    { id: "graphic-design", label: "Graphic Design" },
    { id: "high-school", label: "High School" },
  ];

  const filteredTemplates = TEMPLATES.filter((t) => {
    if (activeCategory !== "all") {
      const matchesCat = t.category === activeCategory;
      const matchesTag = t.tags && t.tags.includes(activeCategory);
      if (!matchesCat && !matchesTag) return false;
    }
    if (activeFilter === "free" && !t.free) return false;
    if (activeFilter === "ats" && !t.atsSafe) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-accent" />
            Canva-Grade Template Library ({TEMPLATES.length})
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Select an ATS-optimized or creative layout. 100% original, copyright-clean designs tailored for top industries.
          </p>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/templates"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "all"
                ? "bg-accent text-white"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            All
          </Link>
          <Link
            href="/dashboard/templates?filter=ats"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeFilter === "ats"
                ? "bg-success text-white"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            ATS-Safe Only
          </Link>
          <Link
            href="/dashboard/templates?filter=free"
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeFilter === "free"
                ? "bg-brand-500 text-white"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            Free Tier
          </Link>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 border-b border-border">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/templates?category=${c.id}${activeFilter !== "all" ? `&filter=${activeFilter}` : ""}`}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeCategory === c.id
                ? "bg-brand-50 text-accent font-bold"
                : "text-text-secondary hover:bg-surface-secondary hover:text-text-primary"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((t) => (
          <Link
            key={t.id}
            href={`/dashboard/builder?template=${t.id}`}
            className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:border-accent/40 hover:shadow-md"
          >
            <div>
              {/* Badge rail */}
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  {t.category}
                </span>

                <div className="flex items-center gap-1.5">
                  {t.atsSafe && (
                    <span className="flex items-center gap-1 rounded-full bg-success-light px-2 py-0.5 text-[10px] font-semibold text-success">
                      <CheckCircle2 className="h-3 w-3" /> ATS
                    </span>
                  )}
                  {!t.free && (
                    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-accent">
                      <Lock className="h-3 w-3" /> {t.tier?.toUpperCase() || "PRO"}
                    </span>
                  )}
                </div>
              </div>

              {/* Graphic Placeholder Preview */}
              <div className="mb-4 flex h-48 flex-col items-center justify-center rounded-xl bg-surface-tertiary transition-colors group-hover:bg-brand-50/50">
                <Layout className="h-10 w-10 text-text-tertiary transition-transform group-hover:scale-110 group-hover:text-accent mb-2" />
                <span className="text-[11px] font-semibold text-text-tertiary group-hover:text-accent">
                  Use {t.name}
                </span>
              </div>

              <h3 className="font-bold text-text-primary text-sm flex items-center justify-between">
                <span>{t.name}</span>
                {t.industry && (
                  <span className="text-[10px] font-medium text-text-tertiary capitalize">
                    {t.industry}
                  </span>
                )}
              </h3>
              <p className="mt-1 text-xs text-text-secondary leading-relaxed line-clamp-2">
                {t.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-accent group-hover:underline">
              <span>Start with this template →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
