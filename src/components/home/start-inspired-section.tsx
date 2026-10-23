"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TemplateShowcaseItem {
  id: string;
  name: string;
  displayName: string;
  personName: string;
  role: string;
  categories: string[];
  accentColor: string;
  headerBg?: string;
  sidebarBg?: string;
  hasPhoto: boolean;
  avatarSeed?: string;
  layout: "single" | "sidebar-left" | "sidebar-right" | "header-band";
}

const TEMPLATE_SHOWCASE: TemplateShowcaseItem[] = [
  {
    id: "modern-classic",
    name: "White Minimalist Resume",
    displayName: "White Minimalist Resume",
    personName: "HANNAH MORALES",
    role: "Customer Planning Manager",
    categories: ["trending", "minimalist", "simple", "professional"],
    accentColor: "#1e293b",
    hasPhoto: false,
    layout: "sidebar-left",
  },
  {
    id: "student-campus",
    name: "White Simple Student CV Resume",
    displayName: "White Simple Student CV Resume",
    personName: "OLIVIA WILSON",
    role: "Student",
    categories: ["trending", "college", "photo", "academic", "scholarship", "simple"],
    accentColor: "#2a7f62",
    sidebarBg: "#e8f2ee",
    headerBg: "#e8d8ce",
    hasPhoto: true,
    avatarSeed: "olivia",
    layout: "sidebar-left",
  },
  {
    id: "minimal-clean",
    name: "Minimalist CV Resume",
    displayName: "Minimalist CV Resume",
    personName: "Isabel Mercado",
    role: "Marketing Manager",
    categories: ["trending", "minimalist", "photo", "professional", "corporate"],
    accentColor: "#2c3e50",
    sidebarBg: "#22303c",
    hasPhoto: true,
    avatarSeed: "isabel",
    layout: "sidebar-left",
  },
  {
    id: "modern-gradient",
    name: "Deep Purple Professional College Student CV",
    displayName: "Deep Purple Professional College Student...",
    personName: "KORINA VILLANUEVA",
    role: "Computer Science Student",
    categories: ["trending", "college", "colorful", "photo", "academic", "modern"],
    accentColor: "#6b21a8",
    headerBg: "#581c87",
    hasPhoto: true,
    avatarSeed: "korina",
    layout: "header-band",
  },
  {
    id: "minimal-mono",
    name: "Black and White Minimalist Professional Resume",
    displayName: "Black and White Minimalist Professional R...",
    personName: "SEBASTIAN BENNETT",
    role: "Professional Accountant",
    categories: ["trending", "minimalist", "professional", "corporate", "simple", "seek"],
    accentColor: "#09090b",
    hasPhoto: false,
    layout: "single",
  },
  {
    id: "ats-classic",
    name: "Simple Professional Resume",
    displayName: "Simple Professional Resume",
    personName: "Daniel Morton",
    role: "Project Assistant",
    categories: ["trending", "simple", "professional", "corporate", "seek"],
    accentColor: "#2563eb",
    hasPhoto: false,
    layout: "single",
  },
  {
    id: "ats-tech",
    name: "Black and White Simple Professional Resume",
    displayName: "Black and White Simple Professional Resu...",
    personName: "DANIEL GALLEGO",
    role: "UX Designer",
    categories: ["trending", "simple", "professional", "corporate", "minimalist"],
    accentColor: "#18181b",
    hasPhoto: false,
    layout: "single",
  },
  {
    id: "modern-split",
    name: "Grey Minimalist Professional Resume Doc",
    displayName: "Grey Minimalist Professional Resume Doc...",
    personName: "HARPER RUSSO",
    role: "Product Manager",
    categories: ["trending", "minimalist", "professional", "photo", "corporate"],
    accentColor: "#475569",
    sidebarBg: "#e2e8f0",
    hasPhoto: true,
    avatarSeed: "harper",
    layout: "sidebar-left",
  },
  {
    id: "modern-minimal",
    name: "Blue and Black Developer Resume",
    displayName: "Blue and black Developer Resume",
    personName: "SARAH AMELIA",
    role: "Developer",
    categories: ["trending", "modern", "professional", "photo", "corporate"],
    accentColor: "#2563eb",
    hasPhoto: true,
    avatarSeed: "sarah",
    layout: "sidebar-left",
  },
  {
    id: "executive-suite",
    name: "Blue and Gray Simple Professional CV Resume",
    displayName: "Blue and Gray Simple Professional CV Res...",
    personName: "RICHARD SANCHEZ",
    role: "Marketing Manager",
    categories: ["trending", "simple", "professional", "photo", "corporate"],
    accentColor: "#334155",
    headerBg: "#334155",
    hasPhoto: true,
    avatarSeed: "richard",
    layout: "header-band",
  },
  {
    id: "executive-board",
    name: "Modern Executive Resume",
    displayName: "Modern Executive Resume",
    personName: "ADAM FLETCHER",
    role: "Operations Director",
    categories: ["corporate", "modern", "professional", "seek"],
    accentColor: "#0f172a",
    sidebarBg: "#f1f5f9",
    hasPhoto: true,
    avatarSeed: "adam",
    layout: "sidebar-left",
  },
  {
    id: "ats-executive",
    name: "Administrative Manager Resume",
    displayName: "Administrative Manager Resume",
    personName: "OLIVIA SANCHEZ",
    role: "Administrative Manager",
    categories: ["corporate", "professional", "seek", "simple"],
    accentColor: "#0284c7",
    hasPhoto: false,
    layout: "single",
  },
  {
    id: "student-starter",
    name: "Student Fresher Resume",
    displayName: "Student Fresher Resume",
    personName: "ADELINE PALMERSTON",
    role: "Student",
    categories: ["college", "student", "photo", "high-school", "scholarship"],
    accentColor: "#831843",
    headerBg: "#9d174d",
    sidebarBg: "#fdf2f8",
    hasPhoto: true,
    avatarSeed: "adeline",
    layout: "header-band",
  },
  {
    id: "creative-canvas",
    name: "Creative Graphic Designer Resume",
    displayName: "Creative Graphic Designer Resume",
    personName: "ELENA ROSTOVA",
    role: "Senior Graphic Designer",
    categories: ["creative", "graphic-design", "colorful", "photo", "trending"],
    accentColor: "#ea580c",
    sidebarBg: "#fff7ed",
    hasPhoto: true,
    avatarSeed: "elena",
    layout: "sidebar-left",
  },
  {
    id: "student-arts",
    name: "Academic Research & Faculty CV",
    displayName: "Academic Research & Faculty CV",
    personName: "DR. JULIAN VANCE",
    role: "Postdoctoral Research Fellow",
    categories: ["academic", "scholarship", "professional"],
    accentColor: "#1e3a8a",
    hasPhoto: false,
    layout: "single",
  },
  {
    id: "creative-bold",
    name: "Acting & Performance Portfolio Resume",
    displayName: "Acting & Performance Portfolio Resume",
    personName: "MARCUS CHEN",
    role: "Theater & Film Actor",
    categories: ["acting", "creative", "photo", "trending"],
    accentColor: "#be123c",
    headerBg: "#18181b",
    hasPhoto: true,
    avatarSeed: "marcus",
    layout: "header-band",
  },
  {
    id: "creative-timeline",
    name: "Infographic Tech Resume",
    displayName: "Infographic Tech Resume",
    personName: "ALEX THORNE",
    role: "Full Stack Lead",
    categories: ["infographic", "creative", "colorful", "trending"],
    accentColor: "#06b6d4",
    sidebarBg: "#ecfeff",
    hasPhoto: false,
    layout: "sidebar-left",
  },
  {
    id: "ats-entry",
    name: "High School & Scholarship Resume",
    displayName: "High School & Scholarship Resume",
    personName: "CHLOE ZHANG",
    role: "High School Honor Graduate",
    categories: ["high-school", "scholarship", "simple", "college"],
    accentColor: "#059669",
    hasPhoto: false,
    layout: "single",
  },
];

const CATEGORIES = [
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

export function StartInspiredSection() {
  const [activeTab, setActiveTab] = useState("trending");

  const filtered = TEMPLATE_SHOWCASE.filter((item) =>
    item.categories.includes(activeTab)
  );

  return (
    <section className="bg-surface py-16 sm:py-24 border-b border-border/60">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        {/* Title & Subheading matching screenshot */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">
            Start inspired
          </h2>
          <p className="mt-2 text-sm sm:text-base text-text-secondary">
            Get a headstart with free design templates you can customize in a few clicks.
          </p>
        </div>

        {/* Scrollable Category Filter Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-4 mb-10 no-scrollbar border-b border-border/40">
          {CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 text-xs font-semibold transition-all relative rounded-full ${
                  isActive
                    ? "text-accent font-bold"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary"
                }`}
              >
                {cat.label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Responsive Template Grid (2 on mobile, 3 on tablet, 5 on desktop) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5">
          {filtered.map((tpl) => (
            <Link
              key={tpl.id + tpl.name}
              href={`/dashboard/builder?template=${tpl.id}`}
              className="group flex flex-col cursor-pointer transition-transform hover:-translate-y-1"
            >
              {/* Card Container with A4 proportion */}
              <div className="relative aspect-[210/297] w-full overflow-hidden rounded-xl border border-border/80 bg-white shadow-xs transition-all duration-300 group-hover:border-accent group-hover:shadow-xl">
                {/* Visual Representation of Resume */}
                <div className="absolute inset-0 flex flex-col p-3 text-[5px] select-none pointer-events-none">
                  {/* Header Band if applicable */}
                  {tpl.layout === "header-band" && (
                    <div
                      className="rounded-t-sm -mx-3 -mt-3 p-2.5 mb-2 text-white flex items-center justify-between"
                      style={{ backgroundColor: tpl.headerBg || tpl.accentColor }}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold tracking-wider text-[7px] leading-tight">
                          {tpl.personName}
                        </div>
                        <div className="opacity-90 text-[5px]">{tpl.role}</div>
                      </div>
                      {tpl.hasPhoto && (
                        <div className="h-6 w-6 rounded-full bg-white/20 border border-white/60 flex items-center justify-center font-bold text-[6px]">
                          {tpl.personName.charAt(0)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Body Layout */}
                  <div className="flex-1 flex gap-2 overflow-hidden">
                    {/* Left Sidebar if applicable */}
                    {tpl.layout === "sidebar-left" && (
                      <div
                        className="w-[34%] rounded-sm p-1.5 flex flex-col gap-1.5"
                        style={{
                          backgroundColor: tpl.sidebarBg || "#f8fafc",
                          color: tpl.sidebarBg && tpl.sidebarBg.startsWith("#2") ? "#ffffff" : "#334155",
                        }}
                      >
                        {tpl.hasPhoto && (
                          <div className="mx-auto h-7 w-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-[7px]">
                            {tpl.personName.charAt(0)}
                          </div>
                        )}
                        <div className="space-y-0.5 border-b pb-1 border-black/10">
                          <div className="font-bold text-[6px] truncate">{tpl.personName}</div>
                          <div className="text-[4.5px] opacity-75 truncate">{tpl.role}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="h-1 w-8 bg-current opacity-30 rounded-full" />
                          <div className="h-1 w-10 bg-current opacity-20 rounded-full" />
                          <div className="h-1 w-6 bg-current opacity-20 rounded-full" />
                        </div>
                        <div className="mt-auto space-y-1">
                          <div className="h-1 w-7 bg-current opacity-30 rounded-full" />
                          <div className="h-1 w-9 bg-current opacity-20 rounded-full" />
                        </div>
                      </div>
                    )}

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col gap-1.5">
                      {tpl.layout !== "header-band" && tpl.layout !== "sidebar-left" && (
                        <div className="border-b border-border/80 pb-1 mb-0.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[7px] text-slate-900 tracking-wide">
                              {tpl.personName}
                            </div>
                            <div className="text-[5px] text-accent font-medium">{tpl.role}</div>
                          </div>
                          {tpl.hasPhoto && (
                            <div className="h-6 w-6 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-accent text-[6px]">
                              {tpl.personName.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Simulated Content Blocks */}
                      <div className="space-y-1">
                        <div className="h-1.5 w-12 bg-slate-800 rounded-xs" />
                        <div className="h-1 w-full bg-slate-200 rounded-full" />
                        <div className="h-1 w-4/5 bg-slate-200 rounded-full" />
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 w-16 bg-slate-800 rounded-xs" />
                        <div className="flex justify-between">
                          <div className="h-1 w-14 bg-slate-400 rounded-full" />
                          <div className="h-1 w-6 bg-slate-200 rounded-full" />
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full" />
                        <div className="h-1 w-11/12 bg-slate-100 rounded-full" />
                      </div>

                      <div className="space-y-1">
                        <div className="h-1.5 w-10 bg-slate-800 rounded-xs" />
                        <div className="flex gap-1 flex-wrap">
                          <div className="h-2 w-6 bg-accent/15 border border-accent/30 rounded-xs" />
                          <div className="h-2 w-7 bg-accent/15 border border-accent/30 rounded-xs" />
                          <div className="h-2 w-5 bg-accent/15 border border-accent/30 rounded-xs" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 p-3 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                  <span className="rounded-lg bg-accent px-3 py-1.5 text-center text-xs font-bold text-white shadow-md transition-transform group-hover:scale-105">
                    Customize Template
                  </span>
                  <span className="mt-1.5 text-[10px] text-white/80">
                    100% Free · Click to edit
                  </span>
                </div>
              </div>

              {/* Title Underneath matching screenshot */}
              <div className="mt-2 text-left">
                <p className="text-xs font-semibold text-text-primary line-clamp-1 group-hover:text-accent transition-colors">
                  {tpl.displayName}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA to view all in Dashboard */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-2 rounded-xl bg-surface border border-border px-6 py-3 text-sm font-semibold text-text-primary shadow-xs transition-all hover:border-accent hover:text-accent hover:shadow-md"
          >
            Explore All 24+ Professional Templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
