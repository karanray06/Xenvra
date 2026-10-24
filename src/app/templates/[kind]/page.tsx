import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_STUDIO_TEMPLATES } from "@/lib/templates/manifest";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getAppBaseUrl } from "@/lib/env";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface CategoryMeta {
  title: string;
  seoTitle: string;
  seoDescription: string;
  badge: string;
  headline: string;
  subhead: string;
  kindKeys: string[];
  specs: string[];
  faqs: { q: string; a: string }[];
}

const CATEGORY_MAP: Record<string, CategoryMeta> = {
  presentation: {
    title: "Presentations",
    seoTitle: "10-Slide Pitch Decks & Campus Viva Templates",
    seoDescription:
      "Explore 10-slide presentation decks for startup pitches, college vivas, marketing strategies, and hackathon demos. Native PPTX and vector PDF export.",
    badge: "10 Distinct 16:9 Decks",
    headline: "Canva-Grade 10-Slide Presentation Decks",
    subhead:
      "Pitch decks, consulting strategies, college project viva defenses, and product launches. Built with universal 10-slide anatomies, drag-and-drop photo frames, and native PowerPoint (PPTX) vector exports.",
    kindKeys: ["deck", "presentation"],
    specs: ["1920 × 1080 (16:9 widescreen)", "Editable PPTX vector export", "Pre-structured 10-slide anatomy", "Drag-and-drop team photo frames"],
    faqs: [
      {
        q: "How are the 10 slides in each deck structured?",
        a: "Every presentation deck strictly implements the universal 10-slide anatomy: (1) Cover, (2) Problem/Context, (3) Solution/Idea, (4) Market/Research, (5) Product/Business Model, (6) Traction/Key Metrics, (7) Strategy/GTM Plan, (8) Team (with photo frames), (9) Roadmap/Timeline, and (10) Thank You/Contact.",
      },
      {
        q: "Can I download and edit these decks in Microsoft PowerPoint or Google Slides?",
        a: "Yes! Xenvra Studio uses an intelligent vector AST exporter that generates valid .pptx files containing true text boxes, native vector shapes, and embedded image assets without rasterization.",
      },
      {
        q: "Can I change the color scheme to match my company or university?",
        a: "Yes. Every deck supports one-click color theme switching between Mocha Dark, Ice Light, and Lavender Accent, or custom hex codes from the Brand Kit panel.",
      },
    ],
  },
  deck: {
    title: "Presentations",
    seoTitle: "10-Slide Pitch Decks & Campus Viva Templates",
    seoDescription:
      "Explore 10-slide presentation decks for startup pitches, college vivas, marketing strategies, and hackathon demos. Native PPTX and vector PDF export.",
    badge: "10 Distinct 16:9 Decks",
    headline: "Canva-Grade 10-Slide Presentation Decks",
    subhead:
      "Pitch decks, consulting strategies, college project viva defenses, and product launches. Built with universal 10-slide anatomies, drag-and-drop photo frames, and native PowerPoint (PPTX) vector exports.",
    kindKeys: ["deck", "presentation"],
    specs: ["1920 × 1080 (16:9 widescreen)", "Editable PPTX vector export", "Pre-structured 10-slide anatomy", "Drag-and-drop team photo frames"],
    faqs: [
      {
        q: "How are the 10 slides in each deck structured?",
        a: "Every presentation deck strictly implements the universal 10-slide anatomy: (1) Cover, (2) Problem/Context, (3) Solution/Idea, (4) Market/Research, (5) Product/Business Model, (6) Traction/Key Metrics, (7) Strategy/GTM Plan, (8) Team (with photo frames), (9) Roadmap/Timeline, and (10) Thank You/Contact.",
      },
      {
        q: "Can I download and edit these decks in Microsoft PowerPoint or Google Slides?",
        a: "Yes! Xenvra Studio uses an intelligent vector AST exporter that generates valid .pptx files containing true text boxes, native vector shapes, and embedded image assets without rasterization.",
      },
    ],
  },
  resume: {
    title: "Resumes",
    seoTitle: "100% ATS-Friendly Resume Templates (India & Global)",
    seoDescription:
      "ATS-optimized resume templates engineered to pass applicant tracking systems. Vector text extraction, dual-column and single-column layouts in brand palette.",
    badge: "100% ATS-Safe Vector Layers",
    headline: "ATS-Safe Resume Templates for High-Growth Careers",
    subhead:
      "Carefully engineered single and dual-column resume templates designed to pass automated hiring screening at top tech, consulting, and campus recruiters. 100% extractable vector text with live ATS scoring.",
    kindKeys: ["resume"],
    specs: ["A4 Standard (794 × 1123 px)", "100% uncompressed text layer", "Zero tables or text boxes that confuse ATS", "One-click job description keyword tailoring"],
    faqs: [
      {
        q: "Why do Xenvra resumes score higher on ATS filters?",
        a: "Most graphic editors convert text into flattened images or nested invisible shapes, resulting in unreadable gibberish when parsed by Workday or Taleo. Xenvra renders clean vector text streams with semantic hierarchy, ensuring 100% parser accuracy.",
      },
      {
        q: "Can I connect my existing resume data into the studio?",
        a: "Yes! In Xenvra Studio, text nodes can be data-bound directly to your structured career history (e.g. experience[0].bullets), allowing one-click instant updates across all templates.",
      },
    ],
  },
  banner: {
    title: "LinkedIn Banners",
    seoTitle: "Professional LinkedIn Banner Maker & Templates (1584×396)",
    seoDescription:
      "Craft striking LinkedIn banner backgrounds tailored to modern engineering, design, and executive profiles. Calibrated for desktop and mobile safe zones.",
    badge: "1584 × 396 Safe Zone",
    headline: "High-Impact LinkedIn Banner Backgrounds",
    subhead:
      "Stand out on LinkedIn with professionally branded banners. Designed with safe zones so your profile photo never obscures critical contact details or value propositions.",
    kindKeys: ["banner"],
    specs: ["1584 × 396 px (Official LinkedIn ratio)", "Mobile & desktop safe-zone calibrated", "High-contrast brand typography", "High-res 2x PNG / SVG export"],
    faqs: [
      {
        q: "Will my circular profile photo cover the text on mobile?",
        a: "No. All Xenvra LinkedIn banner templates leave the bottom-left area clear of critical typography, keeping your headlines visible on both iOS/Android apps and desktop browsers.",
      },
    ],
  },
  certificate: {
    title: "Certificates",
    seoTitle: "Award & Completion Certificate Templates",
    seoDescription:
      "A4 landscape certificate templates with vector borders, seal badges, and verified signature fields for hackathons, college fests, and workshops.",
    badge: "Print-Ready Vector PDF",
    headline: "Award & Completion Certificate Templates",
    subhead:
      "Celebrate campus hackathons, MUN conferences, academic honors, and corporate bootcamps with distinguished A4 landscape certificates in royal mocha and ice silver.",
    kindKeys: ["certificate"],
    specs: ["A4 Landscape (1123 × 794 px)", "Geometric guilloché vector borders", "Verified signature & seal badges", "Bulk CSV recipient generation ready"],
    faqs: [
      {
        q: "Can I generate certificates in bulk for my college event or hackathon?",
        a: "Yes, our Studio engine supports bulk variable printing: upload a CSV of participant names and download a single ZIP containing personalized high-res PDFs.",
      },
    ],
  },
  card: {
    title: "Business Cards",
    seoTitle: "Minimalist & Executive Business Card Templates",
    seoDescription:
      "Standard 3.5×2 inch business cards with QR code generation, contact details hierarchy, and vector print bleed.",
    badge: "3.5 × 2 Inch Vector",
    headline: "Minimalist & Executive Business Card Templates",
    subhead:
      "Leave a memorable impression at conferences, campus networking nights, and client meetings with double-sided business card templates equipped with live dynamic QR codes.",
    kindKeys: ["card"],
    specs: ["1050 × 600 px (3.5 × 2 inch at 300 DPI)", "Integrated QR code element", "Clean front & back design pairing", "High-res vector print export"],
    faqs: [
      {
        q: "Does the QR code link to my digital portfolio or LinkedIn?",
        a: "Yes! In Xenvra Studio, double-click the QR code element to input any URL (your personal portfolio, LinkedIn profile, or GitHub link), and the SVG QR code generates instantly.",
      },
    ],
  },
  cover_letter: {
    title: "Cover Letters",
    seoTitle: "Professional Cover Letter Templates Matching Your Resume",
    seoDescription:
      "Executive and creative cover letter templates designed to match your resume header, typography, and color tokens for cohesive job applications.",
    badge: "A4 Formal Layouts",
    headline: "Executive & Creative Cover Letter Templates",
    subhead:
      "Pair your ATS resume with a matching, beautifully formatted cover letter. Clean margins, date and address headers, and integrated AI writing assistance.",
    kindKeys: ["cover_letter"],
    specs: ["A4 Standard (794 × 1123 px)", "Matching resume typography tokens", "AI content structuring integration", "Vector PDF export"],
    faqs: [
      {
        q: "Can I generate tailored cover letters for specific job postings?",
        a: "Yes! Our Cover Letter generator extracts requirements from job listings and crafts bespoke, fact-based letters that reference your actual resume accomplishments.",
      },
    ],
  },
};

export async function generateStaticParams() {
  return [
    { kind: "presentation" },
    { kind: "deck" },
    { kind: "resume" },
    { kind: "banner" },
    { kind: "certificate" },
    { kind: "card" },
    { kind: "cover_letter" },
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ kind: string }>;
}): Promise<Metadata> {
  const { kind } = await props.params;
  const meta = CATEGORY_MAP[kind];
  if (!meta) return { title: "Templates — Xenvra Studio" };

  const baseUrl = getAppBaseUrl();
  return {
    title: `${meta.seoTitle} — Xenvra Studio`,
    description: meta.seoDescription,
    alternates: {
      canonical: `${baseUrl}/templates/${kind}`,
    },
    openGraph: {
      title: `${meta.seoTitle} — Xenvra Studio`,
      description: meta.seoDescription,
      url: `${baseUrl}/templates/${kind}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(meta.seoTitle)}&kind=${encodeURIComponent(meta.title)}&badge=${encodeURIComponent(meta.badge)}`,
          width: 1200,
          height: 630,
          alt: meta.seoTitle,
        },
      ],
    },
  };
}

export default async function CategoryTemplatesPage(props: {
  params: Promise<{ kind: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { kind } = await props.params;
  const meta = CATEGORY_MAP[kind];
  if (!meta) notFound();

  const searchParams = await props.searchParams;
  const activeFilter = searchParams.filter || "all";

  const templates = ALL_STUDIO_TEMPLATES.filter((t) => {
    const matchesKind = meta.kindKeys.includes(t.kind);
    if (!matchesKind) return false;
    if (activeFilter === "free" && !t.free) return false;
    if (activeFilter === "ats" && !t.atsSafe) return false;
    return true;
  });

  const baseUrl = getAppBaseUrl();
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
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Templates",
            item: `${baseUrl}/templates`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: meta.title,
            item: `${baseUrl}/templates/${kind}`,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: meta.faqs.map((faq) => ({
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
        name: meta.seoTitle,
        itemListElement: templates.map((t, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: t.title,
          description: t.description,
          url: `${baseUrl}/templates/${t.kind}/${t.slug}`,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F9FB] flex flex-col text-[#241915]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1">
        {/* Category Hero */}
        <section className="border-b border-[#C9CCD1] bg-[#E6EEF4] py-16 sm:py-20 relative overflow-hidden">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Breadcrumb row */}
            <div className="flex items-center justify-center gap-2 text-xs text-[#5E534D] mb-4">
              <Link href="/templates" className="hover:text-[#241915]">
                Templates
              </Link>
              <span>/</span>
              <span className="font-bold text-[#5A4032]">{meta.title}</span>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-[#DCD3F2] px-3.5 py-1 text-xs font-bold text-[#5A4032] mb-5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{meta.badge}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-[#241915] max-w-4xl mx-auto leading-tight">
              {meta.headline}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#5E534D] max-w-2xl mx-auto leading-relaxed">
              {meta.subhead}
            </p>

            {/* Specifications bar */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#5A4032]">
              {meta.specs.map((spec, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 rounded-xl bg-white/95 border border-[#C9CCD1] px-3.5 py-2 shadow-2xs"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> {spec}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Templates Listing */}
        <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
          {/* Filter Bar */}
          <div className="flex items-center justify-between border-b border-[#C9CCD1] pb-4">
            <span className="text-xs text-[#5E534D]">
              Showing <strong className="text-[#241915] font-bold">{templates.length}</strong> {meta.title.toLowerCase()}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/templates/${kind}`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === "all"
                    ? "bg-[#5A4032] text-white shadow-xs"
                    : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                }`}
              >
                All
              </Link>
              <Link
                href={`/templates/${kind}?filter=free`}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === "free"
                    ? "bg-[#5A4032] text-white shadow-xs"
                    : "bg-white border border-[#C9CCD1] text-[#5E534D] hover:bg-[#E6EEF4]"
                }`}
              >
                Free Only
              </Link>
              <Link
                href="/templates"
                className="text-xs font-semibold text-[#5A4032] hover:underline ml-4"
              >
                ← View All Formats
              </Link>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <div
                key={t.id}
                className="group flex flex-col justify-between rounded-2xl border border-[#C9CCD1] bg-white p-5 shadow-2xs transition-all hover:border-[#5A4032] hover:shadow-md"
              >
                <div>
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

        {/* FAQs */}
        <section className="border-t border-[#C9CCD1] bg-white py-16">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 space-y-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4032] uppercase tracking-wider bg-[#E6EEF4] px-3 py-1 rounded-full">
                <HelpCircle className="h-3.5 w-3.5" /> Expert Guidance
              </div>
              <h2 className="text-2xl font-extrabold text-[#241915]">
                {meta.title} Design & Technical Questions
              </h2>
            </div>

            <div className="space-y-4">
              {meta.faqs.map((faq, i) => (
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
