import type { TemplateProps } from "./registry";
import { resolveTemplateTheme } from "./themes";

export function AcademicCV({
  data,
  accentColor,
  fontFamily,
}: TemplateProps) {
  const theme = resolveTemplateTheme("serif", accentColor, fontFamily);
  const c = data.contact;

  return (
    <div
      className="h-full min-h-[1123px] w-full bg-white p-9 text-[#241915]"
      style={{
        fontFamily: theme.fontBody,
        fontSize: "10px",
        lineHeight: "1.5",
      }}
    >
      {/* Header - Formal Academic Layout */}
      <header className="border-b-2 pb-4 text-center" style={{ borderColor: theme.accent }}>
        <h1
          className="text-2xl font-bold tracking-tight text-[#241915]"
          style={{ fontFamily: theme.fontHeading }}
        >
          {c.fullName || "Curriculum Vitae"}
        </h1>
        {c.title && (
          <p
            className="mt-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: theme.accent }}
          >
            {c.title}
          </p>
        )}

        {/* Academic Contact Details */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[9px] text-[#5A4032]">
          {c.location && <span>{c.location}</span>}
          {c.email && (
            <>
              <span>•</span>
              <span className="font-medium text-[#241915]">{c.email}</span>
            </>
          )}
          {c.phone && (
            <>
              <span>•</span>
              <span>{c.phone}</span>
            </>
          )}
          {c.website && (
            <>
              <span>•</span>
              <span>{c.website}</span>
            </>
          )}
          {c.linkedin && (
            <>
              <span>•</span>
              <span>{c.linkedin}</span>
            </>
          )}
        </div>
      </header>

      {/* Research Interests / Statement */}
      {data.summary && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: theme.accent, borderColor: "#C9CCD1" }}
          >
            Research Profile & Areas of Specialization
          </h2>
          <p className="mt-2 text-[9.5px] text-[#3E2C22] leading-relaxed italic">
            {data.summary}
          </p>
        </section>
      )}

      {/* Education First (Standard in Academic CVs) */}
      {data.education && data.education.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: theme.accent, borderColor: "#C9CCD1" }}
          >
            Education & Academic Credentials
          </h2>
          <div className="mt-2.5 space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-[10.5px] text-[#241915]">
                    {edu.degree}{edu.field ? ` in ${edu.field}` : ""}
                  </h3>
                  <p className="text-[9.5px] text-[#5A4032]">
                    {edu.school}
                  </p>
                  {edu.gpa && (
                    <p className="text-[8.5px] text-[#6F747C]">Honours / GPA: {edu.gpa}</p>
                  )}
                </div>
                <span className="shrink-0 font-sans text-[8.5px] text-[#5E534D]">
                  {edu.startDate} — {edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Academic Appointments & Research Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: theme.accent, borderColor: "#C9CCD1" }}
          >
            Appointments & Research Experience
          </h2>
          <div className="mt-2.5 space-y-3.5">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-[10.5px] text-[#241915]">
                    {exp.jobTitle}{exp.company ? ` — ${exp.company}` : ""}
                  </h3>
                  <span className="shrink-0 font-sans text-[8.5px] text-[#5E534D]">
                    {exp.startDate} — {exp.currentlyWorking ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.location && (
                  <p className="text-[8.5px] text-[#6F747C]">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="mt-1 text-[9px] text-[#3E2C22] leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Publications / Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: theme.accent, borderColor: "#C9CCD1" }}
          >
            Publications, Papers & Conferences
          </h2>
          <div className="mt-2 space-y-2">
            {data.projects.map((proj) => (
              <div key={proj.id} className="text-[9px]">
                <span className="font-bold text-[#241915]">&ldquo;{proj.name}&rdquo;</span>
                {proj.description && (
                  <span className="text-[#3E2C22]"> — {proj.description}</span>
                )}
                {proj.url && (
                  <span className="ml-1 text-[#5A4032] underline font-mono text-[8px]">{proj.url}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fellowships, Grants & Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: theme.accent, borderColor: "#C9CCD1" }}
          >
            Grants, Fellowships & Accreditations
          </h2>
          <div className="mt-2 space-y-1.5">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex items-baseline justify-between text-[9px]">
                <span className="font-semibold text-[#241915]">{cert.name}</span>
                <span className="text-[#6F747C] text-[8.5px]">
                  {cert.issuer ? `${cert.issuer} · ` : ""}{cert.date}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Methodologies & Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: theme.accent, borderColor: "#C9CCD1" }}
          >
            Methodological & Technical Competencies
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.skills.map((s, idx) => (
              <span
                key={idx}
                className="rounded border px-2 py-0.5 text-[8.5px] font-medium text-[#241915]"
                style={{ borderColor: "#C9CCD1", backgroundColor: "#F5F9FB" }}
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
