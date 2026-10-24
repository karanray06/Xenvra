import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Download,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { ResumeData } from "@/lib/schemas/resume";
import type { Metadata } from "next";

export const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "login",
  "auth",
  "dashboard",
  "studio",
  "templates",
  "jobs",
  "settings",
  "p",
  "print",
  "cover-letters",
  "tailor",
  "billing",
  "faq",
  "terms",
  "privacy",
  "health",
]);

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const cleanSlug = slug.toLowerCase();

  if (RESERVED_SLUGS.has(cleanSlug)) {
    return { title: "Page Not Found", robots: { index: false, follow: false } };
  }

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("public_profiles")
    .select("visibility, full_name, headline")
    .eq("slug", cleanSlug)
    .maybeSingle();

  const isPublic = profile?.visibility === "public";
  const title = profile?.full_name ? `${profile.full_name} | Verified Portfolio` : `${slug} — Portfolio | Xenvra`;

  return {
    title,
    description: profile?.headline || "View professional verified portfolio and career achievements.",
    robots: {
      index: isPublic,
      follow: isPublic,
      googleBot: {
        index: isPublic,
        follow: isPublic,
      },
    },
  };
}

export default async function PublicProfilePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const cleanSlug = slug.toLowerCase();

  if (RESERVED_SLUGS.has(cleanSlug)) {
    notFound();
  }

  const admin = createAdminClient();

  // Call the SECURITY DEFINER RPC get_public_profile(slug)
  // Ensures anonymous visitors only get published profiles, and contact is redacted if show_contact is false
  let profileData: {
    slug: string;
    full_name: string;
    headline: string;
    bio: string;
    show_contact: boolean;
    resume_id: string;
    template_id: string;
    data: ResumeData;
  } | null = null;

  try {
    const { data: rpcResult } = await admin.rpc("get_public_profile", {
      p_slug: cleanSlug,
    });
    if (rpcResult) {
      profileData = rpcResult as unknown as typeof profileData;
    }
  } catch {
    // Fallback if migration not yet applied in live DB
  }

  if (!profileData) {
    // Direct admin fallback for published profiles
    const { data: profile } = await admin
      .from("public_profiles")
      .select("id, resume_id, visibility, show_contact, full_name, headline, bio")
      .eq("slug", cleanSlug)
      .eq("visibility", "public")
      .maybeSingle();

    if (!profile || !profile.resume_id) {
      notFound();
    }

    const { data: resume } = await admin
      .from("resumes")
      .select("id, title, data, template_id")
      .eq("id", profile.resume_id)
      .maybeSingle();

    if (!resume || !resume.data) {
      notFound();
    }

    const data = resume.data as ResumeData;
    if (!profile.show_contact && data.contact) {
      data.contact = {
        ...data.contact,
        email: "",
        phone: "",
      };
    }

    profileData = {
      slug: cleanSlug,
      full_name: profile.full_name || data.contact?.fullName || "",
      headline: profile.headline || data.contact?.title || "",
      bio: profile.bio || data.summary || "",
      show_contact: profile.show_contact ?? true,
      resume_id: resume.id,
      template_id: resume.template_id || "modern-1",
      data,
    };
  }

  const data = profileData.data;
  const contact = data.contact || {};

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary">
      {/* Top Banner Navigation */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-text-primary">
              XENVRA
            </span>
            <span className="rounded-full bg-lav-200 px-2 py-0.5 text-[10px] font-bold text-accent">
              PORTFOLIO
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href={`/print/${profileData.resume_id}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-accent-hover transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download PDF</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 space-y-8">
        <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight sm:text-4xl">
                {profileData.full_name || contact.fullName || "Candidate"}
              </h1>
              {(profileData.headline || contact.title) && (
                <p className="mt-1 text-base font-medium text-accent">
                  {profileData.headline || contact.title}
                </p>
              )}
              {contact.location && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-text-tertiary">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{contact.location}</span>
                </p>
              )}
            </div>

            {/* Social / Contact Links */}
            <div className="flex flex-wrap items-center gap-2">
              {profileData.show_contact && contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-tertiary transition-colors shadow-xs"
                >
                  <Mail className="h-3.5 w-3.5 text-accent" />
                  <span>Contact</span>
                </a>
              )}
              {contact.linkedin && (
                <a
                  href={contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-tertiary transition-colors shadow-xs"
                >
                  <svg className="h-3.5 w-3.5 fill-current text-accent" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.66 1.66 1.66 0 0 0 1.66-1.66 1.65 1.65 0 0 0-1.66-1.66Z" />
                  </svg>
                  <span>LinkedIn</span>
                </a>
              )}
              {contact.github && (
                <a
                  href={contact.github.startsWith("http") ? contact.github : `https://${contact.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-tertiary transition-colors shadow-xs"
                >
                  <svg className="h-3.5 w-3.5 fill-current text-text-primary" viewBox="0 0 24 24">
                    <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2Z" />
                  </svg>
                  <span>GitHub</span>
                </a>
              )}
              {contact.website && (
                <a
                  href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-tertiary transition-colors shadow-xs"
                >
                  <Globe className="h-3.5 w-3.5 text-accent" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Summary / Bio */}
          {(profileData.bio || data.summary) && (
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-sm text-text-secondary leading-relaxed">
                {profileData.bio || data.summary}
              </p>
            </div>
          )}
        </div>

        {/* Experience Section */}
        {data.experience && data.experience.length > 0 && (
          <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Briefcase className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-text-primary">Work Experience</h2>
            </div>

            <div className="space-y-6">
              {data.experience.map((exp, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="font-bold text-base text-text-primary">
                      {exp.jobTitle}
                    </h3>
                    <span className="text-xs font-medium text-text-tertiary">
                      {exp.startDate} — {exp.currentlyWorking ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-accent">
                    {exp.company} {exp.location && `• ${exp.location}`}
                  </div>
                  {exp.description && (
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-text-secondary space-y-1">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <GraduationCap className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-text-primary">Education</h2>
            </div>

            <div className="space-y-4">
              {data.education.map((edu, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="font-bold text-sm text-text-primary">
                      {edu.school}
                    </h3>
                    <span className="text-xs text-text-tertiary">
                      {edu.startDate} — {edu.endDate}
                    </span>
                  </div>
                  <div className="text-xs text-text-secondary">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </div>
                  {edu.gpa && (
                    <div className="text-xs text-text-tertiary">
                      GPA / Grade: {edu.gpa}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {data.skills && data.skills.length > 0 && (
          <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-text-primary">Skills & Core Competencies</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg border border-border bg-surface-secondary px-3 py-1.5 text-xs font-semibold text-text-primary shadow-2xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-text-tertiary">
        <p>Built with Xenvra • The Career & Campus Design Platform</p>
      </footer>
    </div>
  );
}
