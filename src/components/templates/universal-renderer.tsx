"use client";

import React from "react";
import type { ResumeData } from "@/lib/schemas/resume";
import type { TemplateSpec } from "@/lib/schemas/template-spec";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Award,
} from "lucide-react";

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.86 0 1.56-.7 1.56-1.56s-.7-1.56-1.56-1.56a1.56 1.56 0 0 0-1.56 1.56c0 .86.7 1.56 1.56 1.56m1.39 9.97v-8.37H5.07v8.37h2.78z" />
    </svg>
  );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
      <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
    </svg>
  );
}

interface UniversalRendererProps {
  data: ResumeData;
  spec: TemplateSpec;
  accentColor?: string;
  fontFamily?: string;
}

export function UniversalRenderer({
  data,
  spec,
  accentColor,
  fontFamily,
}: UniversalRendererProps) {
  const contact = data.contact || {};
  const activeAccent = accentColor || spec.designTokens.palette.accent;
  const primaryColor = spec.designTokens.palette.primary;
  const surfaceColor = spec.designTokens.palette.surface;
  const textColor = spec.designTokens.palette.text;
  const textMuted = spec.designTokens.palette.textMuted;
  const borderColor = spec.designTokens.palette.border;

  const fontHeading = fontFamily || spec.designTokens.fontPair.heading;
  const fontBody = fontFamily || spec.designTokens.fontPair.body;

  // -------------------------------------------------------------------------
  // Helper Section Renderers
  // -------------------------------------------------------------------------
  const renderContactItem = (icon: React.ReactNode, value?: string, href?: string) => {
    if (!value) return null;
    const content = (
      <span className="flex items-center gap-1.5 text-[8.5pt] text-current">
        <span className="opacity-70">{icon}</span>
        <span className="truncate">{value}</span>
      </span>
    );
    if (href) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
          {content}
        </a>
      );
    }
    return content;
  };

  const renderContact = (variant: string) => {
    const items = [
      contact.email ? renderContactItem(<Mail className="h-3 w-3" />, contact.email, `mailto:${contact.email}`) : null,
      contact.phone ? renderContactItem(<Phone className="h-3 w-3" />, contact.phone, `tel:${contact.phone}`) : null,
      contact.location ? renderContactItem(<MapPin className="h-3 w-3" />, contact.location) : null,
      contact.website ? renderContactItem(<Globe className="h-3 w-3" />, contact.website.replace(/^https?:\/\//, ""), contact.website) : null,
      contact.linkedin ? renderContactItem(<LinkedinIcon className="h-3 w-3" />, contact.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, "in/"), contact.linkedin) : null,
      contact.github ? renderContactItem(<GithubIcon className="h-3 w-3" />, contact.github.replace(/^https?:\/\/(www\.)?github\.com\//, "gh/"), contact.github) : null,
    ].filter(Boolean);

    if (items.length === 0) return null;

    if (variant === "sidebar-list") {
      return <div className="flex flex-col gap-2 mt-2">{items}</div>;
    }
    if (variant === "compact-badges") {
      return (
        <div className="flex flex-wrap gap-2 mt-2">
          {items.map((it, i) => (
            <div key={i} className="rounded px-2 py-0.5 text-[8pt] border" style={{ borderColor, backgroundColor: surfaceColor }}>
              {it}
            </div>
          ))}
        </div>
      );
    }
    // Default inline-row
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
        {items.map((it, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="opacity-30">•</span>}
            {it}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderSummary = () => {
    if (!data.summary) return null;
    return (
      <div className="resume-section mb-4">
        <h3
          className="font-bold uppercase tracking-wider text-[9.5pt] mb-1.5 pb-0.5 border-b flex items-center gap-1.5"
          style={{ color: primaryColor, borderColor, fontFamily: fontHeading }}
        >
          <Sparkles className="h-3 w-3" style={{ color: activeAccent }} />
          Professional Summary
        </h3>
        <p className="text-[8.5pt] leading-relaxed text-justify" style={{ color: textColor }}>
          {data.summary}
        </p>
      </div>
    );
  };

  const renderExperience = (variant: string) => {
    if (!data.experience || data.experience.length === 0) return null;
    return (
      <div className="resume-section mb-4">
        <h3
          className="font-bold uppercase tracking-wider text-[9.5pt] mb-2 pb-0.5 border-b flex items-center gap-1.5"
          style={{ color: primaryColor, borderColor, fontFamily: fontHeading }}
        >
          <Briefcase className="h-3 w-3" style={{ color: activeAccent }} />
          Work Experience
        </h3>
        <div className={variant === "timeline" ? "border-l-2 pl-3 space-y-3 relative" : "space-y-3"} style={{ borderColor: activeAccent }}>
          {data.experience.map((exp) => (
            <div key={exp.id} className="relative">
              {variant === "timeline" && (
                <div
                  className="absolute -left-[17px] top-1 h-2 w-2 rounded-full border-2 bg-white"
                  style={{ borderColor: activeAccent }}
                />
              )}
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-[9pt]" style={{ color: primaryColor }}>
                  {exp.jobTitle || "Role Title"}
                </span>
                <span className="text-[7.5pt] font-medium" style={{ color: textMuted }}>
                  {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate || "Present"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[8pt] font-medium mb-1" style={{ color: activeAccent }}>
                <span>{exp.company || "Company"}</span>
                {exp.location && <span style={{ color: textMuted }}>{exp.location}</span>}
              </div>
              {exp.description && (
                <p className="text-[8pt] leading-relaxed mb-1" style={{ color: textColor }}>
                  {exp.description}
                </p>
              )}
              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="list-disc list-outside ml-3.5 space-y-0.5 text-[8pt]" style={{ color: textColor }}>
                  {exp.highlights.map((h, i) => (
                    <li key={i} className="leading-snug">{h}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = (_variant?: string) => {
    if (!data.education || data.education.length === 0) return null;
    return (
      <div className="resume-section mb-4">
        <h3
          className="font-bold uppercase tracking-wider text-[9.5pt] mb-2 pb-0.5 border-b flex items-center gap-1.5"
          style={{ color: primaryColor, borderColor, fontFamily: fontHeading }}
        >
          <GraduationCap className="h-3 w-3" style={{ color: activeAccent }} />
          Education
        </h3>
        <div className="space-y-2">
          {data.education.map((edu) => (
            <div key={edu.id} className="text-[8pt]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold" style={{ color: primaryColor }}>
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </span>
                <span className="text-[7.5pt]" style={{ color: textMuted }}>
                  {edu.startDate} – {edu.endDate}
                </span>
              </div>
              <div className="flex items-center justify-between" style={{ color: activeAccent }}>
                <span>{edu.school}</span>
                {edu.gpa && <span style={{ color: textMuted }}>GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSkills = (variant: string) => {
    if (!data.skills || data.skills.length === 0) return null;
    return (
      <div className="resume-section mb-4">
        <h3
          className="font-bold uppercase tracking-wider text-[9.5pt] mb-2 pb-0.5 border-b"
          style={{ color: primaryColor, borderColor, fontFamily: fontHeading }}
        >
          Skills &amp; Expertise
        </h3>
        {variant === "tags" && (
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((s, i) => {
              const label = typeof s === "string" ? s : (s && typeof s === "object" && "name" in s ? String((s as { name: string }).name) : "");
              return (
                <span
                  key={i}
                  className="rounded px-2 py-0.5 text-[7.5pt] font-medium border"
                  style={{
                    backgroundColor: surfaceColor,
                    color: textColor,
                    borderColor,
                  }}
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}
        {variant === "level-bars" && (
          <div className="space-y-1.5">
            {data.skills.map((s, i) => {
              const name = typeof s === "string" ? s : (s && typeof s === "object" && "name" in s ? String((s as { name: string }).name) : "");
              return (
                <div key={i}>
                  <div className="flex justify-between text-[7.5pt] font-medium mb-0.5" style={{ color: textColor }}>
                    <span>{name}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: activeAccent,
                        width: `${Math.max(65, 100 - (i % 4) * 10)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {(variant === "plain-text" || variant === "bullets") && (
          <p className="text-[8pt] leading-relaxed" style={{ color: textColor }}>
            {data.skills.map((s) => (typeof s === "string" ? s : (s && typeof s === "object" && "name" in s ? String((s as { name: string }).name) : ""))).join(" • ")}
          </p>
        )}
      </div>
    );
  };

  const renderProjects = () => {
    if (!data.projects || data.projects.length === 0) return null;
    return (
      <div className="resume-section mb-4">
        <h3
          className="font-bold uppercase tracking-wider text-[9.5pt] mb-2 pb-0.5 border-b flex items-center gap-1.5"
          style={{ color: primaryColor, borderColor, fontFamily: fontHeading }}
        >
          <Award className="h-3 w-3" style={{ color: activeAccent }} />
          Key Projects
        </h3>
        <div className="space-y-2">
          {data.projects.map((proj) => (
            <div key={proj.id} className="text-[8pt]">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold" style={{ color: primaryColor }}>
                  {proj.name}
                </span>
                {proj.startDate && (
                  <span className="text-[7.5pt]" style={{ color: textMuted }}>
                    {proj.startDate} {proj.endDate && `– ${proj.endDate}`}
                  </span>
                )}
              </div>
              {proj.description && (
                <p className="text-[8pt] leading-snug mt-0.5" style={{ color: textColor }}>
                  {proj.description}
                </p>
              )}
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="text-[7.5pt] font-medium mt-0.5" style={{ color: activeAccent }}>
                  Tech: {proj.technologies.join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSectionByKey = (key: string) => {
    switch (key) {
      case "summary":
        return renderSummary();
      case "experience":
        return renderExperience(spec.sectionVariants.experience);
      case "education":
        return renderEducation(spec.sectionVariants.education);
      case "skills":
        return renderSkills(spec.sectionVariants.skills);
      case "projects":
        return renderProjects();
      case "contact":
        return (
          <div className="mb-4">
            <h4 className="font-bold uppercase tracking-wider text-[8pt] mb-1 pb-0.5 border-b" style={{ borderColor, color: primaryColor }}>
              Contact
            </h4>
            {renderContact("sidebar-list")}
          </div>
        );
      default:
        return null;
    }
  };

  // -------------------------------------------------------------------------
  // Layout Assemblies
  // -------------------------------------------------------------------------
  const layout = spec.grid.layout;

  return (
    <div
      id="resume-preview"
      className="resume-artboard relative mx-auto bg-white text-left shadow-xl"
      style={{
        width: "210mm",
        minHeight: "297mm",
        boxSizing: "border-box",
        fontFamily: fontBody,
        padding: layout === "header-band" ? "0" : spec.page.margin,
      }}
    >
      {/* 1. Header-Band Layout */}
      {layout === "header-band" && (
        <>
          <div
            className="px-8 py-7"
            style={{
              backgroundColor: primaryColor,
              color: "#ffffff",
              borderBottom: `3px solid ${activeAccent}`,
            }}
          >
            <h1 className="text-[22pt] font-bold tracking-tight" style={{ fontFamily: fontHeading }}>
              {contact.fullName || "Your Full Name"}
            </h1>
            <p className="text-[11pt] font-medium mt-0.5 opacity-90" style={{ color: activeAccent }}>
              {contact.title || "Target Professional Title"}
            </p>
            <div className="mt-3 text-white/90">
              {renderContact("compact-badges")}
            </div>
          </div>

          <div className="p-8 grid grid-cols-12 gap-6">
            <div className="col-span-8">
              {spec.sectionOrder.main.map((sKey) => (
                <React.Fragment key={sKey}>{renderSectionByKey(sKey)}</React.Fragment>
              ))}
            </div>
            <div className="col-span-4 border-l pl-5" style={{ borderColor }}>
              {(spec.sectionOrder.sidebar || ["skills", "education"]).map((sKey) => (
                <React.Fragment key={sKey}>{renderSectionByKey(sKey)}</React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 2. Sidebar-Left Layout */}
      {layout === "sidebar-left" && (
        <div className="grid grid-cols-12 gap-6 h-full min-h-[297mm]">
          <div
            className="col-span-4 p-5 rounded-lg h-full"
            style={{
              backgroundColor: surfaceColor,
              borderRight: `1px solid ${borderColor}`,
            }}
          >
            <div className="mb-5 pb-3 border-b" style={{ borderColor }}>
              <h1 className="text-[18pt] font-bold leading-tight" style={{ color: primaryColor, fontFamily: fontHeading }}>
                {contact.fullName || "Your Name"}
              </h1>
              <p className="text-[9pt] font-semibold mt-1" style={{ color: activeAccent }}>
                {contact.title || "Professional Title"}
              </p>
            </div>
            {(spec.sectionOrder.sidebar || ["contact", "skills", "education"]).map((sKey) => (
              <React.Fragment key={sKey}>{renderSectionByKey(sKey)}</React.Fragment>
            ))}
          </div>

          <div className="col-span-8 py-2">
            {spec.sectionOrder.main.map((sKey) => (
              <React.Fragment key={sKey}>{renderSectionByKey(sKey)}</React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 3. Sidebar-Right Layout */}
      {layout === "sidebar-right" && (
        <div className="grid grid-cols-12 gap-6 h-full min-h-[297mm]">
          <div className="col-span-8 py-2">
            <div className="mb-4 pb-2 border-b" style={{ borderColor }}>
              <h1 className="text-[22pt] font-bold leading-tight" style={{ color: primaryColor, fontFamily: fontHeading }}>
                {contact.fullName || "Your Name"}
              </h1>
              <p className="text-[10.5pt] font-semibold mt-0.5" style={{ color: activeAccent }}>
                {contact.title || "Professional Title"}
              </p>
            </div>
            {spec.sectionOrder.main.map((sKey) => (
              <React.Fragment key={sKey}>{renderSectionByKey(sKey)}</React.Fragment>
            ))}
          </div>

          <div
            className="col-span-4 p-5 rounded-lg h-full"
            style={{
              backgroundColor: surfaceColor,
              borderLeft: `1px solid ${borderColor}`,
            }}
          >
            {(spec.sectionOrder.sidebar || ["contact", "skills", "education"]).map((sKey) => (
              <React.Fragment key={sKey}>{renderSectionByKey(sKey)}</React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* 4. Single-Column Layout (Universal ATS & Minimal) */}
      {layout === "single-column" && (
        <div className="py-2">
          {/* Header */}
          <div className="mb-5 pb-3 border-b text-center" style={{ borderColor }}>
            <h1 className="text-[22pt] font-bold tracking-tight uppercase" style={{ color: primaryColor, fontFamily: fontHeading }}>
              {contact.fullName || "Your Full Name"}
            </h1>
            <p className="text-[10pt] font-semibold mt-0.5 tracking-wider uppercase" style={{ color: activeAccent }}>
              {contact.title || "Target Career Title"}
            </p>
            <div className="flex justify-center mt-2">
              {renderContact(spec.sectionVariants.contact)}
            </div>
          </div>

          {/* Main Flow */}
          {spec.sectionOrder.main.map((sKey) => (
            <React.Fragment key={sKey}>{renderSectionByKey(sKey)}</React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
