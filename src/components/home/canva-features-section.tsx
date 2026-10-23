"use client";

import React from "react";
import {
  Layout,
  Image as ImageIcon,
  Type,
  Wand2,
  Sparkles,
  Layers,
  Sliders,
  Share2,
  Smartphone,
  Palette,
  Cloud,
  CheckCircle2,
  Truck,
  BarChart3,
  Scissors,
} from "lucide-react";

interface FeatureCard {
  icon: React.ElementType;
  title: string;
  description: string;
  badge?: string;
  linkText?: string;
  linkHref?: string;
}

const CANVA_FEATURES: FeatureCard[] = [
  {
    icon: Layout,
    title: "Thousands of free templates",
    description:
      "Plenty of template design inspiration for any occasion, no need to start from scratch and 100% customizable.",
  },
  {
    icon: ImageIcon,
    title: "Millions of free images, icons, and graphics",
    description:
      "Get access to our entire library of millions of photos, icons, graphics, media elements, audio, sound effects, and more.",
  },
  {
    icon: Type,
    title: "Font library",
    description:
      "Upload your own or access 3,000+ free and premium fonts curated for professional resumes and design.",
  },
  {
    icon: Wand2,
    title: "Magic Write™",
    description:
      "Create quality content faster with Magic Write™, an AI writer & text generator powered by OpenAI. Easily generate, summarize, expand, and re-write text. Your co-author for a fast first draft.",
  },
  {
    icon: Sparkles,
    title: "Magic Design™",
    description:
      "Auto-generate one-page designs with Magic Design™, a free AI design tool. Get refined templates based on your text and uploaded media, made just for you.",
  },
  {
    icon: Layers,
    title: "Brand Kit (Pro)",
    badge: "Pro",
    description:
      "Store your logo, brand colors, and fonts to stay effortlessly on-brand across all your career documents.",
  },
  {
    icon: Scissors,
    title: "One-click background remover",
    description:
      "Remove image backgrounds, perfect for product photos, headshots, or transparent PNGs with instant precision.",
  },
  {
    icon: Share2,
    title: "Easy sharing and exporting tools",
    description:
      "Share and export designs as a JPG, PNG, PDF, and PPTX. And when you embed a doc, you can customize which page will be displayed.",
  },
  {
    icon: Smartphone,
    title: "Access on any device",
    description:
      "Jump from mobile to desktop—design how you work best with seamless cross-device synchronization.",
  },
  {
    icon: Palette,
    title: "Color palette generator",
    description:
      "Generate a color palette from any image that inspires you with automatic WCAG contrast validation.",
  },
  {
    icon: Sliders,
    title: "Photo effects",
    description:
      "Play around with the look of your images for the perfect design—adjust contrast, brightness, grayscale, and tint.",
  },
  {
    icon: Cloud,
    title: "Cloud storage",
    description:
      "Get free 5GB storage or upgrade to Canva Pro and get unlimited folders with up to 1TB storage for all your designs.",
  },
  {
    icon: CheckCircle2,
    title: "Autosave",
    description:
      "Canva autosaves your progress so you can update anything, anytime without losing a single keystroke.",
  },
  {
    icon: Truck,
    title: "Free standard shipping",
    description:
      "Order prints and get them delivered fast, free, and in recycled packaging with commercial bleed and trim marks.",
  },
  {
    icon: BarChart3,
    title: "Customizable charts and tables",
    description:
      "Data visualization made beautiful, interactive, and easy—no complicated software to learn.",
  },
];

export function CanvaFeaturesSection() {
  return (
    <section id="features" className="bg-surface-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        {/* Header matching screenshot 2 */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            All the features you need
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-text-secondary">
            Canva&apos;s free drag-and-drop design tools make it easy to create any design, fast!
          </p>
        </div>

        {/* Feature Grid: 4 columns on desktop matching Canva layout */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CANVA_FEATURES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-accent/30 hover:shadow-lg"
              >
                <div>
                  {/* Icon Box */}
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-surface-secondary border border-border text-text-primary transition-colors group-hover:bg-brand-50 group-hover:text-accent group-hover:border-accent/20">
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Title & Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {/* Description */}
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
