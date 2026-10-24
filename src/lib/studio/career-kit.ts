import type { StudioDocument, TextElement } from "@/lib/schemas/studio";

export interface CareerProfile {
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
    grade?: string;
  }[];
}

export const DEFAULT_CAREER_PROFILE: CareerProfile = {
  fullName: "Aarav Sharma",
  role: "Lead Full-Stack & Systems Engineer",
  email: "aarav.sharma@xenvra.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, Karnataka, India",
  summary:
    "Product-minded systems engineer with 5+ years of experience designing high-concurrency cloud architectures, TypeScript compilers, and real-time canvas engines. Proven record of scaling systems to 15M+ daily requests.",
  linkedinUrl: "linkedin.com/in/aaravsharma",
  githubUrl: "github.com/aaravsharma",
  websiteUrl: "aaravsharma.dev",
  skills: [
    "TypeScript",
    "React 19",
    "Next.js App Router",
    "PostgreSQL",
    "Supabase RLS",
    "Tailwind CSS",
    "Node.js",
    "Redis",
    "Docker",
    "System Architecture",
  ],
  experience: [
    {
      company: "Xenvra Technologies",
      role: "Lead Platform Architect",
      duration: "2023 – Present",
      bullets: [
        "Directed migration of monolithic core into 12 microservices, handling 15M+ requests/day at 99.98% uptime.",
        "Implemented vector AST rendering engine reducing canvas export times from 3.2s to 420ms.",
        "Mentored 8 junior and mid-level software engineers across code reviews and system architecture design.",
      ],
    },
    {
      company: "Razorpay / HyperVerge",
      role: "Senior Software Engineer",
      duration: "2021 – 2023",
      bullets: [
        "Architected webhook ingestion gateway processing ₹45Cr+ in monthly payment settlements with zero race conditions.",
        "Implemented Redis-backed sliding window rate limiter cutting malicious bot probe traffic by 94%.",
      ],
    },
  ],
  education: [
    {
      institution: "Indian Institute of Information Technology (IIIT)",
      degree: "B.Tech in Computer Science & Engineering",
      year: "2017 – 2021",
      grade: "8.9 CGPA / First Class with Distinction",
    },
  ],
};

/**
 * Resolves a dot/bracket notation path against the CareerProfile object.
 * e.g. "personal.fullName", "experience[0].bullets", "skills.all"
 */
export function resolveProfileField(profile: CareerProfile, path: string): string | null {
  const normalized = path.trim().toLowerCase();

  if (normalized === "personal.fullname" || normalized === "fullname" || normalized === "name") {
    return profile.fullName;
  }
  if (normalized === "personal.role" || normalized === "role" || normalized === "title") {
    return profile.role;
  }
  if (normalized === "personal.email" || normalized === "email") {
    return profile.email;
  }
  if (normalized === "personal.phone" || normalized === "phone" || normalized === "contact") {
    return profile.phone;
  }
  if (normalized === "personal.location" || normalized === "location") {
    return profile.location;
  }
  if (normalized === "personal.summary" || normalized === "summary") {
    return profile.summary;
  }
  if (normalized === "personal.linkedin" || normalized === "linkedin") {
    return profile.linkedinUrl;
  }
  if (normalized === "personal.github" || normalized === "github") {
    return profile.githubUrl;
  }
  if (normalized === "personal.website" || normalized === "website") {
    return profile.websiteUrl;
  }

  // Skills
  if (normalized === "skills.all" || normalized === "skills") {
    return profile.skills.join(" • ");
  }

  // Experience bindings
  const expMatch = path.match(/experience\[(\d+)\]\.(\w+)/i);
  if (expMatch) {
    const idx = parseInt(expMatch[1], 10);
    const field = expMatch[2].toLowerCase();
    const exp = profile.experience[idx];
    if (!exp) return null;

    if (field === "company") return exp.company;
    if (field === "role" || field === "title") return exp.role;
    if (field === "duration" || field === "period") return exp.duration;
    if (field === "bullets" || field === "highlights") {
      return exp.bullets.map((b) => (b.startsWith("•") ? b : `• ${b}`)).join("\n");
    }
  }

  // Education bindings
  const eduMatch = path.match(/education\[(\d+)\]\.(\w+)/i);
  if (eduMatch) {
    const idx = parseInt(eduMatch[1], 10);
    const field = eduMatch[2].toLowerCase();
    const edu = profile.education[idx];
    if (!edu) return null;

    if (field === "institution" || field === "school") return edu.institution;
    if (field === "degree") return edu.degree;
    if (field === "year") return edu.year;
    if (field === "grade") return edu.grade || "";
  }

  return null;
}

/**
 * Applies data-bound values from a CareerProfile across all text nodes in a StudioDocument.
 */
export function applyCareerDataBinding(
  doc: StudioDocument,
  profile: CareerProfile = DEFAULT_CAREER_PROFILE
): { doc: StudioDocument; boundCount: number } {
  let boundCount = 0;

  const newPages = doc.pages.map((page) => {
    const newElements = page.elements.map((el) => {
      if (el.type !== "text") return el;
      const textEl = el as TextElement;
      const bindPath = textEl.bind || (textEl as Record<string, unknown>).dataBinding;

      if (typeof bindPath === "string" && bindPath) {
        const resolvedValue = resolveProfileField(profile, bindPath);
        if (resolvedValue !== null && resolvedValue !== textEl.content) {
          boundCount++;
          return {
            ...textEl,
            content: resolvedValue,
          };
        }
      }
      return el;
    });

    return {
      ...page,
      elements: newElements,
    };
  });

  return {
    doc: {
      ...doc,
      pages: newPages,
    },
    boundCount,
  };
}
