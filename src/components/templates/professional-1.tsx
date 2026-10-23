import type { TemplateProps } from "./registry";

export function ProfessionalExecutive({
  data,
  accentColor = "#5A4032",
}: TemplateProps) {
  const c = data.contact;

  return (
    <div
      className="h-full bg-white p-8 text-[#241915] font-serif"
      style={{ fontSize: "10px", lineHeight: "1.5" }}
    >
      {/* Header */}
      <header className="border-b-2 pb-4 text-center" style={{ borderColor: accentColor }}>
        <h1
          className="text-2xl font-bold tracking-tight text-[#241915]"
          style={{ letterSpacing: "-0.01em" }}
        >
          {c.fullName || "Your Full Name"}
        </h1>
        {c.title && (
          <p
            className="mt-1 text-xs font-medium uppercase tracking-wider"
            style={{ color: accentColor }}
          >
            {c.title}
          </p>
        )}

        {/* Contact Strip */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-[9px] text-[#5A4032]">
          {c.location && <span>{c.location}</span>}
          {c.location && (c.email || c.phone) && <span>•</span>}
          {c.email && <span>{c.email}</span>}
          {c.email && c.phone && <span>•</span>}
          {c.phone && <span>{c.phone}</span>}
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

      {/* Summary */}
      {data.summary && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: accentColor, borderColor: "#C9CCD1" }}
          >
            Executive Summary
          </h2>
          <p className="mt-2 text-[9.5px] text-[#3E2C22] leading-relaxed text-justify">
            {data.summary}
          </p>
        </section>
      )}

      {/* Professional Experience */}
      {data.experience.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: accentColor, borderColor: "#C9CCD1" }}
          >
            Professional Experience
          </h2>
          <div className="mt-3 space-y-4">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between font-sans">
                  <div>
                    <span className="font-bold text-[10px] text-[#241915]">
                      {exp.jobTitle || "Job Title"}
                    </span>
                    {exp.company && (
                      <span className="text-[9.5px] italic text-[#5A4032]">
                        {" "}— {exp.company}
                        {exp.location ? `, ${exp.location}` : ""}
                      </span>
                    )}
                  </div>
                  {(exp.startDate || exp.endDate) && (
                    <span className="text-[8.5px] text-[#715443] tabular-nums">
                      {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                    </span>
                  )}
                </div>

                {exp.description && (
                  <p className="mt-1 text-[9px] text-[#3E2C22] leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[8.5px] text-[#3E2C22]">
                    {exp.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: accentColor, borderColor: "#C9CCD1" }}
          >
            Education & Credentials
          </h2>
          <div className="mt-3 space-y-2.5">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex items-baseline justify-between font-sans">
                <div>
                  <span className="font-bold text-[9.5px] text-[#241915]">
                    {edu.degree}
                    {edu.field ? ` in ${edu.field}` : ""}
                  </span>
                  {edu.school && (
                    <span className="text-[9px] text-[#5A4032]">
                      {" "}— {edu.school}
                    </span>
                  )}
                </div>
                {(edu.startDate || edu.endDate) && (
                  <span className="text-[8.5px] text-[#715443]">
                    {edu.startDate} – {edu.endDate}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: accentColor, borderColor: "#C9CCD1" }}
          >
            Core Competencies & Skills
          </h2>
          <div className="mt-2.5 flex flex-wrap gap-1.5 font-sans">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded border border-[#C9CCD1] bg-[#E6EEF4]/40 px-2 py-0.5 text-[8.5px] font-medium text-[#241915]"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mt-5">
          <h2
            className="font-sans text-[10px] font-bold uppercase tracking-widest pb-1 border-b"
            style={{ color: accentColor, borderColor: "#C9CCD1" }}
          >
            Selected Projects
          </h2>
          <div className="mt-2.5 space-y-2">
            {data.projects.map((proj) => (
              <div key={proj.id} className="font-sans">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold text-[9.5px] text-[#241915]">
                    {proj.name}
                  </span>
                  {proj.url && (
                    <span className="text-[8px] text-[#5A4032] underline">
                      {proj.url}
                    </span>
                  )}
                </div>
                {proj.description && (
                  <p className="mt-0.5 text-[8.5px] text-[#3E2C22]">
                    {proj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
