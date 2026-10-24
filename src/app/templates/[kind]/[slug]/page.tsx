import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_STUDIO_TEMPLATES, getStudioTemplateById } from "@/lib/templates/manifest";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getAppBaseUrl } from "@/lib/env";
import {
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Maximize2,
  FileCheck,
  Sliders,
  Palette,
} from "lucide-react";

export async function generateStaticParams() {
  return ALL_STUDIO_TEMPLATES.map((t) => ({
    kind: t.kind,
    slug: t.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ kind: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const template = getStudioTemplateById(slug);
  if (!template) return { title: "Template — Xenvra Studio" };

  const baseUrl = getAppBaseUrl();
  const title = `${template.title} Template — Xenvra Studio`;
  const description =
    template.seoDescription.length > 155
      ? `${template.seoDescription.slice(0, 152)}...`
      : template.seoDescription;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/templates/${template.kind}/${template.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/templates/${template.kind}/${template.slug}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(template.title)}&kind=${encodeURIComponent(template.category)}&badge=${encodeURIComponent(template.aspect)}`,
          width: 1200,
          height: 630,
          alt: template.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `/api/og?title=${encodeURIComponent(template.title)}&kind=${encodeURIComponent(template.category)}&badge=${encodeURIComponent(template.aspect)}`,
      ],
    },
  };
}

export default async function TemplateDetailPage(props: {
  params: Promise<{ kind: string; slug: string }>;
}) {
  const { kind, slug } = await props.params;
  const template = getStudioTemplateById(slug);
  if (!template) notFound();

  // Related templates in the same category
  const related = ALL_STUDIO_TEMPLATES.filter(
    (t) => t.category === template.category && t.id !== template.id
  ).slice(0, 3);

  const baseUrl = getAppBaseUrl();
  const canonicalUrl = `${baseUrl}/templates/${kind}/${slug}`;

  // Structured Data (CreativeWork + BreadcrumbList)
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
            name: template.category,
            item: `${baseUrl}/templates/${kind}`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: template.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "CreativeWork",
        name: template.title,
        description: template.seoDescription,
        url: canonicalUrl,
        keywords: template.tags.join(", "),
        genre: template.category,
        author: {
          "@type": "Organization",
          name: "Xenvra Studio",
          url: baseUrl,
        },
        offers: {
          "@type": "Offer",
          price: template.free ? "0" : "29",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        },
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
        {/* Breadcrumb row */}
        <div className="border-b border-[#C9CCD1] bg-[#E6EEF4]/60 py-3">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-[#5E534D]">
            <Link href="/templates" className="hover:text-[#241915]">
              Templates
            </Link>
            <span>/</span>
            <Link href={`/templates/${kind}`} className="hover:text-[#241915]">
              {template.category}
            </Link>
            <span>/</span>
            <span className="font-bold text-[#5A4032] truncate">{template.title}</span>
          </div>
        </div>

        {/* Template Detail Hero */}
        <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Visual Canvas Preview Mockup (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-[#C9CCD1] bg-white p-6 sm:p-10 shadow-sm flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden group">
                {/* Background decorative grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#E6EEF4_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

                {/* Aspect Preview Frame */}
                <div
                  className={`relative z-10 rounded-xl bg-[#E6EEF4] border border-[#C9CCD1] shadow-md p-6 flex flex-col justify-between transition-transform group-hover:scale-[1.02] ${
                    template.aspect === "16:9"
                      ? "w-full aspect-[16/9]"
                      : template.aspect === "A4"
                        ? "w-72 aspect-[1/1.414]"
                        : "w-full max-w-md aspect-[1584/396]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#5A4032] bg-white px-2 py-0.5 rounded shadow-2xs font-mono">
                      {template.aspect}
                    </span>
                    <span className="text-[10px] font-bold text-[#5A4032] bg-[#DCD3F2] px-2 py-0.5 rounded">
                      {template.tier.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-center py-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-[#241915]">
                      {template.title}
                    </h3>
                    <p className="text-xs text-[#5E534D] mt-1 font-mono">
                      {template.dimensions.width} × {template.dimensions.height} px
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#8A8F98] pt-2 border-t border-[#C9CCD1]">
                    <span>Xenvra Vector Engine</span>
                    <span>Brand Palette v2</span>
                  </div>
                </div>

                {/* Bottom preview pill */}
                <div className="mt-6 flex items-center gap-3 text-xs text-[#5E534D] relative z-10">
                  <span className="flex items-center gap-1 font-semibold text-[#5A4032]">
                    <Sparkles className="h-3.5 w-3.5" /> High-Fidelity Vector Canvas
                  </span>
                  <span>·</span>
                  <span>No Raster Compression</span>
                </div>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-[#8A8F98] mr-1">Tags:</span>
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-white border border-[#C9CCD1] px-2.5 py-1 text-xs text-[#5E534D]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar Specifications & CTA (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-[#C9CCD1] bg-white p-6 sm:p-8 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-md bg-[#E6EEF4] px-2.5 py-0.5 text-xs font-bold text-[#5A4032]">
                      {template.category}
                    </span>
                    {template.atsSafe && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> ATS Guaranteed
                      </span>
                    )}
                    {!template.free && (
                      <span className="flex items-center gap-1 rounded-full bg-[#DCD3F2] px-2 py-0.5 text-[10px] font-bold text-[#5A4032]">
                        <Lock className="h-3 w-3" /> PRO
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#241915]">
                    {template.title}
                  </h1>
                  <p className="mt-3 text-xs sm:text-sm text-[#5E534D] leading-relaxed">
                    {template.seoDescription}
                  </p>
                </div>

                {/* Primary CTA */}
                <div className="space-y-3">
                  <Link
                    href={`/studio?template=${template.id}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#5A4032] py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#483328] hover:shadow-lg"
                  >
                    <Sparkles className="h-4 w-4 text-[#DCD3F2]" />
                    <span>Use This Template in Studio</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <p className="text-center text-[11px] text-[#8A8F98]">
                    Instant browser canvas · No credit card required · Free export
                  </p>
                </div>

                {/* Technical Specifications Table */}
                <div className="border-t border-[#C9CCD1] pt-5 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#241915]">
                    Design Specifications
                  </h4>

                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-[#F5F9FB] border border-[#C9CCD1] p-3">
                      <dt className="text-[#8A8F98] flex items-center gap-1 mb-1">
                        <Maximize2 className="h-3 w-3" /> Dimensions
                      </dt>
                      <dd className="font-bold text-[#241915]">
                        {template.dimensions.width} × {template.dimensions.height} px
                      </dd>
                    </div>

                    <div className="rounded-lg bg-[#F5F9FB] border border-[#C9CCD1] p-3">
                      <dt className="text-[#8A8F98] flex items-center gap-1 mb-1">
                        <Sliders className="h-3 w-3" /> Aspect Ratio
                      </dt>
                      <dd className="font-bold text-[#241915]">{template.aspect}</dd>
                    </div>

                    <div className="rounded-lg bg-[#F5F9FB] border border-[#C9CCD1] p-3">
                      <dt className="text-[#8A8F98] flex items-center gap-1 mb-1">
                        <FileCheck className="h-3 w-3" /> Export Formats
                      </dt>
                      <dd className="font-bold text-[#241915]">
                        {template.kind === "deck" ? "PPTX, PDF, PNG" : "Vector PDF, PNG, SVG"}
                      </dd>
                    </div>

                    <div className="rounded-lg bg-[#F5F9FB] border border-[#C9CCD1] p-3">
                      <dt className="text-[#8A8F98] flex items-center gap-1 mb-1">
                        <Palette className="h-3 w-3" /> Palette
                      </dt>
                      <dd className="font-bold text-[#241915]">5 Brand Colours</dd>
                    </div>
                  </dl>
                </div>

                {/* Features Checklist */}
                <div className="border-t border-[#C9CCD1] pt-5 space-y-2 text-xs text-[#5E534D]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#241915] mb-2">
                    Template Capabilities
                  </h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Drag-and-drop auto-crop photo frames</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>100% extractable vector ATS text layer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>One-click recolour to Mocha, Ice, or Lavender</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span>Automatic cloud autosave & conflict resolution</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Templates in Same Category */}
        {related.length > 0 && (
          <section className="border-t border-[#C9CCD1] bg-white py-14">
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#241915]">
                    More {template.category} Templates
                  </h3>
                  <p className="text-xs text-[#5E534D] mt-1">
                    Explore matching designs built with identical design tokens.
                  </p>
                </div>
                <Link
                  href={`/templates/${kind}`}
                  className="text-xs font-semibold text-[#5A4032] hover:underline"
                >
                  View all {template.category} →
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {related.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/templates/${rel.kind}/${rel.slug}`}
                    className="group rounded-2xl border border-[#C9CCD1] bg-[#F5F9FB] p-5 transition-all hover:border-[#5A4032] hover:shadow-xs block"
                  >
                    <div className="flex items-center justify-between mb-3 text-[10px] font-bold text-[#5A4032]">
                      <span className="bg-[#E6EEF4] px-2 py-0.5 rounded uppercase">
                        {rel.aspect}
                      </span>
                      <span>{rel.tier.toUpperCase()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#241915] group-hover:text-[#5A4032] transition-colors">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-[#5E534D] mt-1 line-clamp-2">
                      {rel.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
