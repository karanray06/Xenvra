import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Download, ArrowLeft, Palette } from "lucide-react";
import { ALL_BRAND_PALETTE_CATEGORIES } from "@/lib/studio/brand-palettes";

export const metadata: Metadata = {
  title: "Brand Identity Guide — Xenvra",
  description: "Official visual guidelines, logos, and color tokens for Xenvra.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BrandPage() {

  return (
    <div className="min-h-screen bg-surface-secondary py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Xenvra
        </Link>

        {/* Header */}
        <div className="mb-12 border-b border-border pb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-lav-200 px-3 py-1 text-xs font-bold text-text-primary mb-4">
            Official Brand Spec
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
            Xenvra Brand Assets & Guidelines
          </h1>
          <p className="mt-3 text-lg text-text-secondary leading-relaxed">
            Positioning: calm, premium, quietly confident.{" "}
            <strong className="text-text-primary">&ldquo;Resumes, refined.&rdquo;</strong>
          </p>
        </div>

        {/* Logos Section */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-text-primary mb-6">Logo Marks</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Primary Mark */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col items-center justify-between text-center">
              <div className="my-6 flex h-24 items-center justify-center">
                <Image
                  src="/logos/xenvra-icon.svg"
                  alt="Xenvra Mark"
                  width={64}
                  height={64}
                  className="rounded-xl shadow-xs"
                />
              </div>
              <div className="w-full border-t border-border pt-4">
                <h3 className="font-semibold text-text-primary text-sm">Primary Icon Mark</h3>
                <p className="text-xs text-text-tertiary mt-1">xenvra-icon.svg</p>
                <a
                  href="/logos/xenvra-icon.svg"
                  download
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary w-full transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download SVG
                </a>
              </div>
            </div>

            {/* Wordmark */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col items-center justify-between text-center">
              <div className="my-6 flex h-24 items-center justify-center px-4">
                <Image
                  src="/logos/xenvra-wordmark.svg"
                  alt="Xenvra Wordmark"
                  width={140}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="w-full border-t border-border pt-4">
                <h3 className="font-semibold text-text-primary text-sm">Wordmark</h3>
                <p className="text-xs text-text-tertiary mt-1">xenvra-wordmark.svg</p>
                <a
                  href="/logos/xenvra-wordmark.svg"
                  download
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary w-full transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download SVG
                </a>
              </div>
            </div>

            {/* Full Lockup */}
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col items-center justify-between text-center">
              <div className="my-6 flex h-24 items-center justify-center px-2">
                <Image
                  src="/logos/xenvra-full.svg"
                  alt="Xenvra Full Lockup"
                  width={160}
                  height={44}
                  className="object-contain"
                />
              </div>
              <div className="w-full border-t border-border pt-4">
                <h3 className="font-semibold text-text-primary text-sm">Full Lockup</h3>
                <p className="text-xs text-text-tertiary mt-1">xenvra-full.svg</p>
                <a
                  href="/logos/xenvra-full.svg"
                  download
                  className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-secondary w-full transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download SVG
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Palettes & Color System */}
        <section className="mb-14 space-y-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1 rounded-full bg-[#E6EEF4] px-2.5 py-0.5 text-xs font-bold text-[#5A4032]">
                <Palette className="h-3 w-3" /> Full Studio Color System
              </span>
              <span className="text-xs text-text-tertiary">59 Curated Editorial Hues</span>
            </div>
            <h2 className="text-2xl font-bold text-text-primary">Curated Color Palettes</h2>
            <p className="text-sm text-text-secondary mt-1">
              Low-chroma editorial neutrals, uncommon accents, natural earth slates, brutalist grays, warm solar pigments, and luxury cosmic dark tones.
            </p>
          </div>

          <div className="space-y-12">
            {ALL_BRAND_PALETTE_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="border-b border-border/80 pb-3 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">{category.name}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{category.description}</p>
                  </div>
                  <span className="text-xs font-mono text-accent font-semibold uppercase shrink-0">
                    {category.subtitle}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {category.colors.map((c) => (
                    <div
                      key={c.hex + c.name}
                      className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs transition-transform hover:-translate-y-0.5"
                    >
                      <div
                        className="h-24 w-full p-4 flex items-end justify-between border-b border-black/5"
                        style={{ backgroundColor: c.hex }}
                      >
                        <span
                          className="font-mono text-xs font-bold px-2 py-0.5 rounded shadow-2xs backdrop-blur-xs"
                          style={{
                            color: c.textDark ? "#241915" : "#FFFFFF",
                            backgroundColor: c.textDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.45)",
                          }}
                        >
                          {c.hex}
                        </span>
                      </div>
                      <div className="p-3.5">
                        <h4 className="font-bold text-text-primary text-sm">{c.name}</h4>
                        <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-14 rounded-2xl border border-border bg-surface p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Typography</h2>
          <p className="text-sm text-text-secondary mb-6">
            Primary display & UI typeface is <strong>Plus Jakarta Sans</strong>, paired with Geist Mono for numbers and IDs.
          </p>
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <p className="text-xs text-text-tertiary font-mono">Display / 48px Bold</p>
              <p className="text-4xl font-extrabold text-text-primary mt-1 tracking-tight">
                Your best story, formatted.
              </p>
            </div>
            <div className="border-b border-border pb-3">
              <p className="text-xs text-text-tertiary font-mono">Headings / 24px Bold</p>
              <p className="text-2xl font-bold text-text-primary mt-1">
                ATS-Optimized Resumes Made Simple
              </p>
            </div>
            <div>
              <p className="text-xs text-text-tertiary font-mono">Body / 16px Regular</p>
              <p className="text-base text-text-secondary mt-1 leading-relaxed">
                Build clean, executive-ready resumes in minutes. Export to PDF without hassle.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
