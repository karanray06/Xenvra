import type { StudioDocument, StudioKind } from "@/lib/schemas/studio";
import { ALL_PRESENTATION_DECKS } from "./decks/presentation-decks";
import { ALL_BRUTALIST_DECKS } from "./decks/brutalist-pitch-decks";
import { ALL_GRAPHIC_TEMPLATES } from "./graphics/multi-format-templates";
import { TEMPLATES as RESUME_TEMPLATES } from "@/components/templates/registry";

export interface TemplateManifestItem {
  id: string;
  slug: string;
  title: string;
  kind: StudioKind;
  category: string;
  tags: string[];
  aspect: string;
  dimensions: { width: number; height: number };
  tier: "free" | "pro";
  free: boolean;
  atsSafe?: boolean;
  description: string;
  seoDescription: string;
  getDoc: () => StudioDocument;
}

// Convert presentation decks to manifest items
const PRESENTATION_MANIFEST: TemplateManifestItem[] = ALL_PRESENTATION_DECKS.map((deck) => ({
  id: deck.id,
  slug: deck.slug,
  title: deck.title,
  kind: "deck",
  category: "Presentations",
  tags: deck.tags,
  aspect: "16:9",
  dimensions: { width: 1920, height: 1080 },
  tier: deck.tier,
  free: deck.tier === "free",
  description: deck.description,
  seoDescription: `${deck.title} - Professional 10-slide presentation template designed in Xenvra brand palette for career and campus presentations.`,
  getDoc: () => deck.getDoc("mocha"),
}));

// Convert brutalist presentation decks to manifest items
const BRUTALIST_MANIFEST: TemplateManifestItem[] = ALL_BRUTALIST_DECKS.map((deck) => ({
  id: deck.id,
  slug: deck.slug,
  title: deck.title,
  kind: "deck",
  category: "Brutalist Decks",
  tags: deck.tags,
  aspect: "16:9",
  dimensions: { width: 1920, height: 1080 },
  tier: deck.tier,
  free: deck.tier === "free",
  description: deck.description,
  seoDescription: `${deck.title} - Professional 10-slide brutalist pitch deck template built with extreme-scaled typography and asymmetric grids.`,
  getDoc: () => deck.getDoc(),
}));

// Convert graphics to manifest items
const GRAPHIC_MANIFEST: TemplateManifestItem[] = ALL_GRAPHIC_TEMPLATES.map((tmpl) => {
  const page = tmpl.doc.pages[0];
  const kindMap: Record<string, StudioKind> = {
    banner: "banner",
    certificate: "certificate",
    card: "card",
    cover_letter: "cover_letter",
  };
  const categoryMap: Record<string, string> = {
    banner: "LinkedIn Banners",
    certificate: "Certificates",
    card: "Business Cards",
    cover_letter: "Cover Letters",
  };

  return {
    id: tmpl.id,
    slug: tmpl.slug,
    title: tmpl.title,
    kind: kindMap[tmpl.kind] || "custom",
    category: categoryMap[tmpl.kind] || "Graphics",
    tags: tmpl.tags,
    aspect: `${page.width}:${page.height}`,
    dimensions: { width: page.width, height: page.height },
    tier: tmpl.tier,
    free: tmpl.tier === "free",
    description: tmpl.description,
    seoDescription: `${tmpl.title} - Free and Pro ready-to-use career graphic template. Customize typography, photo masks, and colors in Xenvra Studio.`,
    getDoc: () => tmpl.doc,
  };
});

// Helper to build a vector StudioDocument for a resume template
function buildResumeStudioDoc(templateId: string, _name: string, _isPro: boolean): StudioDocument {
  const isDarkMocha = templateId.includes("creative") || templateId.includes("sidebar");
  const isTwoCol = templateId.includes("two-column") || templateId.includes("modern-1");

  return {
    schemaVersion: 1,
    brandKit: {
      colors: ["#E6EEF4", "#5A4032", "#C9CCD1", "#DCD3F2", "#241915"],
      fonts: ["Plus Jakarta Sans", "Inter", "DM Serif Display"],
    },
    pages: [
      {
        id: `page-resume-${templateId}`,
        name: "Resume Page 1",
        width: 794,
        height: 1123,
        background: "#FFFFFF",
        elements: [
          // Sidebar background if 2-col / sidebar layout
          ...(isDarkMocha
            ? [
                {
                  id: "res-sidebar-bg",
                  name: "Sidebar Accent",
                  type: "shape" as const,
                  shapeType: "rect" as const,
                  x: 0,
                  y: 0,
                  width: 250,
                  height: 1123,
                  rotation: 0,
                  opacity: 1,
                  locked: true,
                  hidden: false,
                  zIndex: 1,
                  fill: "#5A4032",
                },
              ]
            : isTwoCol
            ? [
                {
                  id: "res-sidebar-bg",
                  name: "Sidebar Tint",
                  type: "shape" as const,
                  shapeType: "rect" as const,
                  x: 0,
                  y: 0,
                  width: 240,
                  height: 1123,
                  rotation: 0,
                  opacity: 1,
                  locked: true,
                  hidden: false,
                  zIndex: 1,
                  fill: "#F5F9FB",
                },
              ]
            : []),

          // Header: Name
          {
            id: "res-name",
            name: "Candidate Name",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 48,
            width: isDarkMocha || isTwoCol ? 470 : 698,
            height: 40,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 10,
            content: "ALEXANDER CHEN",
            fontSize: 28,
            fontFamily: "Plus Jakarta Sans",
            fontWeight: 800,
            fontStyle: "normal",
            color: "#241915",
            align: "left",
            lineHeight: 1.1,
            letterSpacing: -0.5,
            underline: false,
            uppercase: true,
            bind: "personal.fullName",
          },

          // Title / Role
          {
            id: "res-role",
            name: "Professional Title",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 92,
            width: isDarkMocha || isTwoCol ? 470 : 698,
            height: 22,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 11,
            content: "Senior Full-Stack Engineer · Distributed Systems",
            fontSize: 13,
            fontFamily: "Inter",
            fontWeight: 600,
            fontStyle: "normal",
            color: "#5A4032",
            align: "left",
            lineHeight: 1.2,
            letterSpacing: 0,
            underline: false,
            uppercase: false,
            bind: "personal.title",
          },

          // Contact Row
          {
            id: "res-contact",
            name: "Contact Information",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 118,
            width: isDarkMocha || isTwoCol ? 470 : 698,
            height: 18,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 12,
            content: "alex.chen@example.com · +91 98765 43210 · Bengaluru, India · linkedin.com/in/alexchen",
            fontSize: 10,
            fontFamily: "Inter",
            fontWeight: 400,
            fontStyle: "normal",
            color: "#5E534D",
            align: "left",
            lineHeight: 1.2,
            letterSpacing: 0,
            underline: false,
            uppercase: false,
            bind: "personal.contactSummary",
          },

          // Divider
          {
            id: "res-head-divider",
            name: "Header Divider",
            type: "shape" as const,
            shapeType: "rect" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 142,
            width: isDarkMocha || isTwoCol ? 470 : 698,
            height: 1.5,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 13,
            fill: "#C9CCD1",
          },

          // Professional Summary Section
          {
            id: "res-sec-summary-title",
            name: "Summary Title",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 154,
            width: 300,
            height: 18,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 14,
            content: "PROFESSIONAL SUMMARY",
            fontSize: 11,
            fontFamily: "Plus Jakarta Sans",
            fontWeight: 800,
            fontStyle: "normal",
            color: "#5A4032",
            align: "left",
            lineHeight: 1.2,
            letterSpacing: 1,
            underline: false,
            uppercase: true,
          },
          {
            id: "res-sec-summary-body",
            name: "Summary Content",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 176,
            width: isDarkMocha || isTwoCol ? 470 : 698,
            height: 52,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 15,
            content:
              "High-velocity engineer with 5+ years architecting web platforms and real-time APIs. Experienced in TypeScript, Next.js, Go, PostgreSQL, and cloud deployments. Proven track record leading developer tooling initiatives that reduced CI latency by 45%.",
            fontSize: 9.5,
            fontFamily: "Inter",
            fontWeight: 400,
            fontStyle: "normal",
            color: "#241915",
            align: "left",
            lineHeight: 1.5,
            letterSpacing: 0,
            underline: false,
            uppercase: false,
            bind: "personal.summary",
          },

          // Experience Section
          {
            id: "res-sec-exp-title",
            name: "Experience Title",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 238,
            width: 300,
            height: 18,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 16,
            content: "WORK EXPERIENCE",
            fontSize: 11,
            fontFamily: "Plus Jakarta Sans",
            fontWeight: 800,
            fontStyle: "normal",
            color: "#5A4032",
            align: "left",
            lineHeight: 1.2,
            letterSpacing: 1,
            underline: false,
            uppercase: true,
          },
          // Job 1
          {
            id: "res-job1-header",
            name: "Job 1 Header",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 260,
            width: isDarkMocha || isTwoCol ? 470 : 698,
            height: 18,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 17,
            content: "Lead Software Architect · CloudNova Technologies | 2023 - Present",
            fontSize: 10.5,
            fontFamily: "Inter",
            fontWeight: 700,
            fontStyle: "normal",
            color: "#241915",
            align: "left",
            lineHeight: 1.2,
            letterSpacing: 0,
            underline: false,
            uppercase: false,
            bind: "experience[0].title",
          },
          {
            id: "res-job1-bullets",
            name: "Job 1 Bullets",
            type: "text" as const,
            x: isDarkMocha || isTwoCol ? 270 : 48,
            y: 280,
            width: isDarkMocha || isTwoCol ? 470 : 698,
            height: 60,
            rotation: 0,
            opacity: 1,
            locked: false,
            hidden: false,
            zIndex: 18,
            content:
              "• Directed migration of monolithic core into 12 microservices, handling 15M+ requests/day at 99.98% uptime.\n• Implemented vector AST rendering engine reducing canvas export times from 3.2s to 420ms.\n• Mentored 8 junior and mid-level software engineers across code reviews and system architecture design.",
            fontSize: 9.5,
            fontFamily: "Inter",
            fontWeight: 400,
            fontStyle: "normal",
            color: "#241915",
            align: "left",
            lineHeight: 1.5,
            letterSpacing: 0,
            underline: false,
            uppercase: false,
            bind: "experience[0].bullets",
          },
        ],
      },
    ],
  };
}

// Convert 10 Core Resume templates
const RESUME_MANIFEST: TemplateManifestItem[] = RESUME_TEMPLATES.slice(0, 10).map((t) => ({
  id: `resume-${t.id}`,
  slug: `resume-${t.id}`,
  title: t.name,
  kind: "resume",
  category: "Resumes",
  tags: t.tags || ["resume", "ats", "career"],
  aspect: "A4",
  dimensions: { width: 794, height: 1123 },
  tier: t.tier === "pro" ? "pro" : "free",
  free: t.free,
  atsSafe: t.atsSafe ?? true,
  description: t.description,
  seoDescription: `${t.name} - Professional resume template built in Xenvra brand colors. Selectable vector text layers formatted for standard Applicant Tracking Systems.`,
  getDoc: () => buildResumeStudioDoc(t.id, t.name, !t.free),
}));

export const ALL_STUDIO_TEMPLATES: TemplateManifestItem[] = [
  ...PRESENTATION_MANIFEST,
  ...BRUTALIST_MANIFEST,
  ...RESUME_MANIFEST,
  ...GRAPHIC_MANIFEST,
];

export function getStudioTemplateById(id: string): TemplateManifestItem | undefined {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();
  return ALL_STUDIO_TEMPLATES.find((t) => {
    const tId = t.id.toLowerCase();
    const tSlug = t.slug.toLowerCase();
    return (
      tId === normalized ||
      tSlug === normalized ||
      tId === `resume-${normalized}` ||
      tId === `deck-${normalized}` ||
      tId.replace("resume-", "") === normalized ||
      tId.replace("deck-", "") === normalized ||
      tSlug.replace("-deck", "") === normalized ||
      tSlug.replace("-presentation", "") === normalized
    );
  });
}

export function getStudioTemplatesByKind(kind: StudioKind): TemplateManifestItem[] {
  return ALL_STUDIO_TEMPLATES.filter((t) => t.kind === kind);
}

export function getStudioTemplatesByCategory(category: string): TemplateManifestItem[] {
  if (category === "All") return ALL_STUDIO_TEMPLATES;
  return ALL_STUDIO_TEMPLATES.filter((t) => t.category.toLowerCase() === category.toLowerCase());
}
