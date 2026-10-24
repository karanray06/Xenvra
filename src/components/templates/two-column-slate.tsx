import type { TemplateProps } from "./registry";
import { resolveTemplateTheme } from "./themes";

export function TwoColumnSlate({
  data,
  accentColor,
  fontFamily,
}: TemplateProps) {
  const theme = resolveTemplateTheme("ice", accentColor, fontFamily);
  const c = data.contact;

  return (
    <div
      className="flex h-full min-h-[1123px] w-full bg-white text-[#241915]"
      style={{
        fontFamily: theme.fontBody,
        fontSize: "10px",
        lineHeight: "1.45",
      }}
    >
      {/* Left Column (30%) - Ice Silver Background */}
      <aside
        className="w-[32%] p-6 space-y-6 border-r"
        style={{
          backgroundColor: "#E6EEF4",
          borderColor: "#C9CCD1",
        }}
      >
        <div>
          <h1
            className="text-xl font-bold leading-tight"
            style={{ fontFamily: theme.fontHeading, color: theme.primary }}
          >
            {c.fullName || "Your Full Name"}
          </h1>
          {c.title && (
            <p className="mt-1 text-[11px] font-semibold" style={{ color: theme.accent }}>
              {c.title}
            </p>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-1.5 text-[9px] text-[#5E534D]">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#241915] border-b pb-1 border-[#C9CCD1]">
            Contact
          </h3>
          {c.email && <p className="font-medium break-all">{c.email}</p>}
          {c.phone && <p>{c.phone}</p>}
          {c.location && <p>{c.location}</p>}
          {c.website && <p className="break-all">{c.website}</p>}
          {c.linkedin && <p className="break-all">{c.linkedin}</p>}
          {c.github && <p className="break-all">{c.github}</p>}
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#241915] border-b pb-1 border-[#C9CCD1]">
              Skills & Tools
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded bg-white px-2 py-0.5 text-[8.5px] font-semibold text-[#241915] border border-[#C9CCD1]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#241915] border-b pb-1 border-[#C9CCD1]">
              Education
            </h3>
            {data.education.map((edu) => (
              <div key={edu.id} className="space-y-0.5 text-[9px]">
                <p className="font-bold text-[#241915]">
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </p>
                <p className="text-[#5E534D]">{edu.school}</p>
                <p className="text-[8px] text-[#6F747C]">
                  {edu.startDate} – {edu.endDate}
                </p>
                {edu.gpa && <p className="text-[8px] text-[#5E534D]">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Right Column (68%) - White Background */}
      <main className="flex-1 p-7 space-y-6">
        {data.summary && (
          <section className="space-y-1.5">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider border-b pb-1"
              style={{ color: theme.primary, borderColor: theme.border }}
            >
              Professional Summary
            </h2>
            <p className="text-[9.5px] text-[#241915] leading-relaxed">
              {data.summary}
            </p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="space-y-4">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider border-b pb-1"
              style={{ color: theme.primary, borderColor: theme.border }}
            >
              Work Experience
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-[9.5px]">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-[#241915]">
                    {exp.jobTitle}{exp.company ? ` • ${exp.company}` : ""}
                  </h3>
                  <span className="text-[8.5px] font-medium text-[#6F747C]">
                    {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.location && (
                  <p className="text-[8.5px] text-[#5E534D]">{exp.location}</p>
                )}
                {exp.description && (
                  <p className="text-[9px] text-[#241915] whitespace-pre-line leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="space-y-3">
            <h2
              className="text-[11px] font-bold uppercase tracking-wider border-b pb-1"
              style={{ color: theme.primary, borderColor: theme.border }}
            >
              Key Projects
            </h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="space-y-0.5 text-[9px]">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-[#241915]">{proj.name}</h3>
                  {proj.url && (
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[8px] underline"
                      style={{ color: theme.accent }}
                    >
                      {proj.url}
                    </a>
                  )}
                </div>
                {proj.description && (
                  <p className="text-[#241915] leading-relaxed">{proj.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
