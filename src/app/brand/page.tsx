import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Download, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Brand Identity Guide — Xenvra",
  description: "Official visual guidelines, logos, and color tokens for Xenvra.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BrandPage() {
  const colors = [
    {
      name: "Ice Silver",
      hex: "#E6EEF4",
      rgb: "230, 238, 244",
      role: "Backgrounds, card surfaces, light logo tile, empty states",
      textDark: true,
    },
    {
      name: "Mocha Brown",
      hex: "#5A4032",
      rgb: "90, 64, 50",
      role: "Primary CTA buttons, primary logo tile, key headings",
      textDark: false,
    },
    {
      name: "Platinum Silver",
      hex: "#C9CCD1",
      rgb: "201, 204, 209",
      role: "Borders, structural dividers, subtle taglines, disabled states",
      textDark: true,
    },
    {
      name: "Pale Lavender",
      hex: "#DCD3F2",
      rgb: "220, 211, 242",
      role: "Highlights, PRO badges, selected pill states, focus halo",
      textDark: true,
    },
    {
      name: "Mocha Ink",
      hex: "#241915",
      rgb: "36, 25, 21",
      role: "High-contrast body text and high-hierarchy headlines",
      textDark: false,
    },
  ];

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

        {/* Color Palette */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Color Palette</h2>
          <p className="text-sm text-text-secondary mb-6">
            Four core brand colors with strict WCAG AA contrast rules.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {colors.map((c) => (
              <div
                key={c.hex}
                className="overflow-hidden rounded-xl border border-border bg-surface shadow-xs"
              >
                <div
                  className="h-28 w-full p-4 flex items-end justify-between"
                  style={{ backgroundColor: c.hex }}
                >
                  <span
                    className="font-mono text-sm font-bold"
                    style={{ color: c.textDark ? "#241915" : "#F5F9FB" }}
                  >
                    {c.hex}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-text-primary text-sm">{c.name}</h3>
                  <p className="font-mono text-xs text-text-tertiary mt-0.5">RGB: {c.rgb}</p>
                  <p className="text-xs text-text-secondary mt-2 leading-relaxed">{c.role}</p>
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
