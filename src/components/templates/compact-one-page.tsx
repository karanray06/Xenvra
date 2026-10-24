import type { TemplateProps } from "./registry";
import { resolveTemplateTheme } from "./themes";

export function CompactOnePage({
  data,
  accentColor,
  fontFamily,
}: TemplateProps) {
  const theme = resolveTemplateTheme("charcoal", accentColor, fontFamily);
  const c = data.contact;

  return (
    <div
      className="h-full min-h-[1123px] w-full bg-white p-7 text-[#241915]"
      style={{
        fontFamily: theme.fontBody,
        fontSize: "9px",
        lineHeight: "1.35",
      }}
    >
      {/* Top Header - Tight high-density strip */}
      <header className="border-b pb-3 mb-3 flex items-start justify-between" style={{ borderColor: "#C9CCD1" }}>
        <div>
          <h1
            className="text-lg font-bold tracking-tight text-[#241915]"
            style={{ fontFamily: theme.fontHeading }}
          >
            {c.fullName || "Your Full Name"}
          </h1>
          {c.title && (
            <p className="font-semibold text-[10px]" style={{ color: theme.accent }}>
              {c.title}
            </p>
          )}
        </div>

        {/* Compact contact badges */}
        <div className="flex flex-wrap items-center justify-end gap-x-2.5 gap-y-1 text-[8.5px] text-[#5E534D]">
          {c.email && <span className="font-medium text-[#241915]">{c.email}</span>}
          {c.phone && <span>· {c.phone}</span>}
          {c.location && <span>· {c.location}</span>}
          {c.linkedin && <span>· {c.linkedin}</span>}
          {c.github && <span>· {c.github}</span>}
          {c.website && <span>· {c.website}</span>}
        </div>
      </header>

      {/* Summary - Compact if present */}
      {data.summary && (
        <section className="mb-3">
          <p className="text-[8.5px] text-[#3E2C22] leading-snug">{data.summary}</p>
        </section>
      )}

      {/* 2-column or 3-column split for skills & metrics */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-3 rounded px-2.5 py-1.5" style={{ backgroundColor: "#F6F1EE" }}>
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span
              className="text-[9px] font-bold uppercase tracking-wider mr-1"
              style={{ color: theme.accent }}
            >
              Core Skills:
            </span>
            {data.skills.map((s, idx) => (
              <span
                key={idx}
                className="rounded bg-white px-1.5 py-0.5 text-[8px] font-medium border text-[#241915]"
                style={{ borderColor: "#C9CCD1" }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience - Primary Focus */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-3">
          <h2
            className="text-[9.5px] font-bold uppercase tracking-wider border-b pb-0.5 mb-2"
            style={{ color: theme.primary, borderColor: "#C9CCD1" }}
          >
            Professional Experience
          </h2>
          <div className="space-y-2.5">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="font-bold text-[9.5px] text-[#241915]">{exp.jobTitle}</span>
                    {exp.company && (
                      <span className="font-semibold text-[#5A4032]"> · {exp.company}</span>
                    )}
                    {exp.location && (
                      <span className="text-[#6F747C] text-[8px]"> ({exp.location})</span>
                    )}
                  </div>
                  <span className="text-[8px] text-[#5E534D] font-mono shrink-0">
                    {exp.startDate} — {exp.currentlyWorking ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.description && (
                  <p className="mt-0.5 text-[8.5px] text-[#3E2C22] whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-3">
          <h2
            className="text-[9.5px] font-bold uppercase tracking-wider border-b pb-0.5 mb-2"
            style={{ color: theme.primary, borderColor: "#C9CCD1" }}
          >
            Key Projects & Systems
          </h2>
          <div className="space-y-2">
            {data.projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-[9px] text-[#241915]">{proj.name}</span>
                  {proj.url && (
                    <span className="text-[8px] font-mono text-[#5A4032] underline">{proj.url}</span>
                  )}
                </div>
                {proj.description && (
                  <p className="mt-0.5 text-[8.5px] text-[#3E2C22] leading-snug">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Certifications Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Education */}
        {data.education && data.education.length > 0 && (
          <section>
            <h2
              className="text-[9.5px] font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5"
              style={{ color: theme.primary, borderColor: "#C9CCD1" }}
            >
              Education
            </h2>
            <div className="space-y-1.5">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-[9px] text-[#241915]">{edu.degree}</span>
                    <span className="text-[8px] text-[#5E534D]">
                      {edu.startDate} — {edu.endDate}
                    </span>
                  </div>
                  <p className="text-[8px] text-[#5A4032]">
                    {edu.school}
                    {edu.gpa ? ` · GPA: ${edu.gpa}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Certifications or Languages */}
        {data.certifications && data.certifications.length > 0 && (
          <section>
            <h2
              className="text-[9.5px] font-bold uppercase tracking-wider border-b pb-0.5 mb-1.5"
              style={{ color: theme.primary, borderColor: "#C9CCD1" }}
            >
              Certifications & Awards
            </h2>
            <div className="space-y-1">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex items-baseline justify-between">
                  <span className="font-medium text-[8.5px] text-[#241915]">{cert.name}</span>
                  {cert.issuer && (
                    <span className="text-[8px] text-[#6F747C]">{cert.issuer} ({cert.date})</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
