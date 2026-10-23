import { createClient } from "@/lib/supabase/server";
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

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("public_profiles")
    .select("visibility")
    .eq("slug", slug.toLowerCase())
    .maybeSingle();

  const isPublic = profile?.visibility === "public";
  return {
    title: `${slug} — Verified Profile | Xenvra`,
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
  const supabase = await createClient();

  // Fetch public profile
  const { data: profile } = await supabase
    .from("public_profiles")
    .select("id, resume_id, visibility, user_id")
    .eq("slug", slug.toLowerCase())
    .eq("visibility", "public")
    .maybeSingle();

  if (!profile || !profile.resume_id) {
    notFound();
  }

  // Record view asynchronously
  try {
    await supabase.from("profile_views").insert({
      public_profile_id: profile.id,
    });
  } catch {
    // Non-blocking view tracking
  }

  // Fetch resume data
  const { data: resume } = await supabase
    .from("resumes")
    .select("id, title, data")
    .eq("id", profile.resume_id)
    .maybeSingle();

  if (!resume || !resume.data) {
    notFound();
  }

  const data = resume.data as ResumeData;
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
              href={`/print/${resume.id}`}
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
                {contact.fullName || "Candidate"}
              </h1>
              {contact.title && (
                <p className="mt-1 text-base font-medium text-accent">
                  {contact.title}
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
              {contact.email && (
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
                  <svg className="h-3.5 w-3.5 fill-current text-blue-600" viewBox="0 0 24 24">
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
                  <Globe className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="mt-6 border-t border-border pt-6">
              <p className="text-sm text-text-secondary leading-relaxed">
                {data.summary}
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
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-6 border-l-2 border-border space-y-2">
                  <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-accent ring-4 ring-surface" />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-text-primary">{exp.jobTitle}</h3>
                      <p className="text-xs font-semibold text-text-secondary">{exp.company}</p>
                    </div>
                    <span className="text-[11px] font-medium text-text-tertiary mt-0.5 sm:mt-0">
                      {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                    </span>
                  </div>

                  {exp.description && (
                    <p className="text-xs text-text-secondary leading-relaxed">{exp.description}</p>
                  )}

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="space-y-1.5 text-xs text-text-secondary">
                      {exp.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2">
                          <span className="text-accent font-bold">•</span>
                          <span>{h.replace(/^[•\-\*]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
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
              <h2 className="text-lg font-bold text-text-primary">Core Skills & Expertise</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="rounded-xl bg-lav-200/80 px-3 py-1.5 text-xs font-bold text-text-primary shadow-xs"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Education Section */}
        {data.education && data.education.length > 0 && (
          <section className="rounded-3xl border border-border bg-surface p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <GraduationCap className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-bold text-text-primary">Education</h2>
            </div>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-text-primary">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </h3>
                    <p className="text-xs text-text-secondary">{edu.school}</p>
                  </div>
                  <span className="text-[11px] text-text-tertiary">
                    {edu.startDate} – {edu.endDate}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-text-tertiary">
          <p>
            Curated resume profile hosted on{" "}
            <Link href="/" className="font-semibold text-accent hover:underline">
              Xenvra
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
