"use client";

import React from "react";
import {
  Presentation,
  FileText,
  ShieldCheck,
  Download,
  Palette,
  Sparkles,
  Layers,
  QrCode,
  GraduationCap,
} from "lucide-react";

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
}

const XENVRA_FEATURES: FeatureCard[] = [
  {
    icon: Presentation,
    title: "10-Slide Presentation Decks",
    badge: "16:9 HD",
    description:
      "Ready-made slide decks for startup investor pitches, college viva defense, hackathon demos, and strategic roadmaps.",
  },
  {
    icon: FileText,
    title: "ATS-Formatted Resumes",
    badge: "A4 Vector",
    description:
      "Single-column and two-column layouts built with selectable vector text layers for clean parsing by recruitment applicant tracking systems.",
  },
  {
    icon: Download,
    title: "Vector PDF & Editable PPTX Export",
    badge: "Native Files",
    description:
      "Export presentations directly to editable PowerPoint (.pptx) slides and documents to vector PDF, SVG, and high-resolution PNG.",
  },
  {
    icon: ShieldCheck,
    title: "Live ATS Score Meter & Drawer",
    badge: "Real-Time",
    description:
      "Interactive audit drawer inspecting section headings, contact information, font hierarchy, and vector text extractability.",
  },
  {
    icon: Palette,
    title: "Curated Brand Palette Kit",
    badge: "5 Tones",
    description:
      "Harmonious design tokens featuring Mocha Brown, Ice Silver, Soft Lavender, Cream White, and Charcoal Ink.",
  },
  {
    icon: Sparkles,
    title: "1-Click Profile Data Binding",
    badge: "Career Kit",
    description:
      "Instantly sync your saved career history, skills, contact info, and education into any Studio canvas element.",
  },
  {
    icon: Layers,
    title: "Multi-Format Studio Engine",
    badge: "Interactive",
    description:
      "Design college defense presentations, LinkedIn profile banners (1584x396), certificates, and business cards on one canvas.",
  },
  {
    icon: QrCode,
    title: "Direct UPI & 0% Gateway Passes",
    badge: "Transparent",
    description:
      "30-day non-renewing passes with instant UPI QR codes, 1-tap app links (GPay, PhonePe, Paytm, FamPay), and printable receipts.",
  },
];

export function XenvraFeaturesSection() {
  return (
    <section id="features" className="bg-surface-secondary py-20 sm:py-28 border-y border-border">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs font-bold text-accent mb-3">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>Built for Career & Campus Workflows</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Everything you need to stand out
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-text-secondary leading-relaxed">
            Professional design tools and structured templates crafted specifically for job seekers, students, and founders.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {XENVRA_FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-md"
              >
                <div>
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-surface-secondary border border-border text-text-primary transition-colors group-hover:bg-brand-50 group-hover:text-accent group-hover:border-accent/20">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs leading-relaxed text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Retain alias for backward-compatibility
export const CanvaFeaturesSection = XenvraFeaturesSection;
