import type { Metadata } from "next";
import Link from "next/link";
import { ALL_STUDIO_TEMPLATES } from "@/lib/templates/manifest";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getAppBaseUrl } from "@/lib/env";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Presentation,
  FileText,
  CreditCard,
  Award,
  Mail,
  HelpCircle,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Free Resume & Presentation Templates (Canva-Grade) — Xenvra Studio",
  description:
    "Explore 36+ professionally engineered templates: 10-slide pitch decks, college vivas, 100% ATS-friendly resumes, LinkedIn banners, and certificates. Vector ATS and PPTX export.",
  alternates: {
    canonical: `${getAppBaseUrl()}/templates`,
  },
  openGraph: {
    title: "Free Resume & Presentation Templates — Xenvra Studio",
    description:
      "Explore 36+ professionally engineered templates: 10-slide pitch decks, college vivas, ATS resumes, and banners.",
    url: `${getAppBaseUrl()}/templates`,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("Free Resume & Presentation Templates")}&kind=Templates&badge=${encodeURIComponent("36+ Canva-Grade Originals")}`,
        width: 1200,
        height: 630,
        alt: "Xenvra Studio Template Library",
      },
    ],
  },
};

const CATEGORIES = [
  { id: "all", label: "All Formats", icon: Sparkles },
  { id: "presentation", label: "Decks (10)", icon: Presentation },
  { id: "resume", label: "Resumes (10)", icon: FileText },
  { id: "banner", label: "LinkedIn Banners (4)", icon: CreditCard },
  { id: "certificate", label: "Certificates (4)", icon: Award },
  { id: "card", label: "Business Cards (4)", icon: CreditCard },
  { id: "cover_letter", label: "Cover Letters (4)", icon: Mail },
];

const FAQS = [
  {
    q: "Are Xenvra resume templates 100% ATS-friendly?",
    a: "Yes. Every resume template in Xenvra is rendered with an uncompressed, selectable vector text layer on export. Recruitment screening software (Workday, Greenhouse, Lever, Taleo) can parse contact details, experience, skills, and dates without OCR distortion.",
  },
  {
    q: "Can I export presentations to editable PowerPoint (PPTX)?",
    a: "Yes. Our presentation decks export natively to .pptx using vector shapes, real text boxes, and positioned image frames. You can open and present them directly in Microsoft PowerPoint, Google Slides, or Keynote.",
  },
  {
    q: "Are these templates free to use?",
    a: "Over 60% of our templates across all categories are 100% free with unlimited exports. Pro templates unlock advanced corporate slide anatomies and watermark-free high-res downloads starting at just ₹29.",
  },
  {
    q: "Can I upload my own photos and logos onto the templates?",
    a: "Yes. Every template features drag-and-drop photo frames (circular, polaroid, arch, and card frames). Drop any PNG or JPG from your computer or phone to auto-crop seamlessly.",
  },
];

export default async function PublicTemplatesPage(props: {
  searchParams: Promise<{ category?: string; filter?: string; q?: string }>;
}) {
  const searchParams = await props.searchParams;
  const activeCategory = searchParams.category || "all";
  const activeFilter = searchParams.filter || "all";
  const query = (searchParams.q || "").toLowerCase();

  const filteredTemplates = ALL_STUDIO_TEMPLATES.filter((t) => {
    // Kind match
    if (activeCategory !== "all") {
      const matchKind = t.kind.toLowerCase() === activeCategory.toLowerCase();
      const matchCat =
        activeCategory === "presentation" && (t.kind === "deck" || t.category.toLowerCase().includes("presentation"));
      if (!matchKind && !matchCat) return false;
    }
    // Filter match
    if (activeFilter === "free" && !t.free) return false;
    if (activeFilter === "ats" && !t.atsSafe) return false;
    // Search query
    if (query) {
      const matchesTitle = t.title.toLowerCase().includes(query);
      const matchesDesc = t.description.toLowerCase().includes(query);
      const matchesTags = t.tags.some((tag) => tag.toLowerCase().includes(query));
      if (!matchesTitle && !matchesDesc && !matchesTags) return false;
    }
    return true;
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: getAppBaseUrl(),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Templates",
            item: `${getAppBaseUrl()}/templates`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.a,
          },
        })),
      },
      {
        "@type": "ItemList",
        name: "Xenvra Studio Templates",
        itemListElement: filteredTemplates.slice(0, 15).map((t, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: t.title,
          description: t.description,
          url: `${getAppBaseUrl()}/templates/${t.kind}/${t.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F9FB] flex flex-col text-[#241915]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-[#C9CCD1] bg-[#E6EEF4] py-16 sm:py-20 relative overflow-hidden">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DCD3F2] px-3.5 py-1 text-xs font-bold text-[#5A4032] mb-5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>36+ Canva-Grade Original Templates</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-[#241915] max-w-4xl mx-auto leading-tight">
              Design Resumes, Decks & Career Assets —{" "}
              <span className="text-[#5A4032]">Ready in Minutes.</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#5E534D] max-w-2xl mx-auto leading-relaxed">
              Investor pitch decks, college viva presentations, ATS-readable resumes, LinkedIn banners, and certificates. Built in the signature 5-colour Xenvra brand system with native vector export.
            </p>

            {/* Quick stats pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#5A4032]">
              <span className="flex items-center gap-1.5 rounded-xl bg-white/90 border border-[#C9CCD1] px-3.5 py-2 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% Vector ATS Resumes
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-white/90 border border-[#C9CCD1] px-3.5 py-2 shadow-2xs">
                <Zap className="h-4 w-4 text-[#5A4032]" /> Native PowerPoint (PPTX) Decks
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-white/90 border border-[#C9CCD1] px-3.5 py-2 shadow-2xs">
                <Sparkles className="h-4 w-4 text-[#5A4032]" /> Drag-and-Drop Photo Frames
              </span>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#C9CCD1] pb-6">
            {/* Format Categories */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                const isActive = activeCategory === c.id;
                return (
                  <Link
                    key={c.id}
                    href={`/templates?category=${c.id}${activeFilter !== "all" ? `&filter=${activeFilter}` : ""}`}
                    className={`whitespace-nowrap flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#5A4032] text-white shadow-xs font-bold"
                        : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4] hover:text-[#241915]"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{c.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href={`/templates?category=${activeCategory}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === "all"
                    ? "bg-[#5A4032] text-white shadow-xs"
                    : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                }`}
              >
                All
              </Link>
              <Link
                href={`/templates?category=${activeCategory}&filter=free`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === "free"
                    ? "bg-[#5A4032] text-white shadow-xs"
                    : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                }`}
              >
                Free Only
              </Link>
              <Link
                href={`/templates?category=${activeCategory}&filter=ats`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1 ${
                  activeFilter === "ats"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                ATS Safe
              </Link>
            </div>
          </div>

          {/* Result Count */}
          <div className="flex items-center justify-between text-xs text-[#5E534D]">
            <span>
              Showing <strong className="text-[#241915] font-bold">{filteredTemplates.length}</strong> original templates
            </span>
            <span className="font-mono text-[11px] text-[#8A8F98]">Xenvra Brand System v2</span>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#C9CCD1] bg-white p-5 shadow-2xs transition-all hover:border-[#5A4032] hover:shadow-md"
              >
                <div>
                  {/* Category + Tier Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="rounded-md bg-[#E6EEF4] px-2.5 py-0.5 text-[10px] font-bold text-[#5A4032] uppercase tracking-wider">
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

                  {/* Graphic Preview Card */}
                  <Link
                    href={`/templates/${t.kind}/${t.slug}`}
                    className="mb-4 flex h-48 flex-col items-center justify-center rounded-xl bg-[#E6EEF4]/50 border border-[#C9CCD1] transition-colors group-hover:bg-[#DCD3F2]/30 relative overflow-hidden block"
                  >
                    <div className="w-16 h-10 rounded-md bg-white border border-[#C9CCD1] shadow-2xs flex items-center justify-center text-[10px] font-bold text-[#5A4032] mb-2 group-hover:scale-105 transition-transform">
                      {t.aspect}
                    </div>
                    <span className="text-xs font-bold text-[#241915] text-center px-4 line-clamp-1">
                      {t.title}
                    </span>
                    <span className="text-[10px] text-[#8A8F98] mt-0.5 font-mono">
                      {t.dimensions.width} × {t.dimensions.height} px
                    </span>
                  </Link>

                  <Link href={`/templates/${t.kind}/${t.slug}`}>
                    <h2 className="font-bold text-[#241915] text-sm group-hover:text-[#5A4032] transition-colors">
                      {t.title}
                    </h2>
                  </Link>
                  <p className="mt-1.5 text-xs text-[#5E534D] leading-relaxed line-clamp-2">
                    {t.description}
                  </p>
                </div>

                {/* Bottom CTA Actions */}
                <div className="mt-5 pt-3.5 border-t border-[#C9CCD1] flex items-center justify-between text-xs">
                  <Link
                    href={`/templates/${t.kind}/${t.slug}`}
                    className="text-[#5E534D] hover:text-[#241915] font-medium"
                  >
                    Details & Specs →
                  </Link>
                  <Link
                    href={`/studio?template=${t.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#5A4032] px-3 py-1.5 font-semibold text-white transition-all hover:bg-[#483328]"
                  >
                    <span>Use Template</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SEO FAQs Section */}
        <section className="border-t border-[#C9CCD1] bg-white py-16">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4032] uppercase tracking-wider bg-[#E6EEF4] px-3 py-1 rounded-full">
                <HelpCircle className="h-3.5 w-3.5" /> Frequently Asked Questions
              </div>
              <h2 className="text-2xl font-extrabold text-[#241915] sm:text-3xl">
                Everything You Need to Know About Xenvra Templates
              </h2>
              <p className="text-xs text-[#5E534D]">
                Common questions about ATS compatibility, PowerPoint PPTX vector exports, and image framing.
              </p>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-[#C9CCD1] bg-[#F5F9FB] p-5 space-y-2 shadow-2xs"
                >
                  <h3 className="text-sm font-bold text-[#241915] flex items-center gap-2">
                    <span className="text-[#5A4032]">Q:</span> {faq.q}
                  </h3>
                  <p className="text-xs text-[#5E534D] leading-relaxed pl-5">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
