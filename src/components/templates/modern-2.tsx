import type { TemplateProps } from "./registry";

export function ModernGradientEdge({
  data,
  accentColor = "#5A4032",
}: TemplateProps) {
  const c = data.contact;

  return (
    <div
      className="relative flex h-full bg-white font-sans text-[#241915]"
      style={{ fontSize: "10px", lineHeight: "1.45" }}
    >
      {/* Gradient Edge Bar */}
      <div
        className="w-2 shrink-0 h-full"
        style={{
          background: `linear-gradient(180deg, ${accentColor} 0%, #7B66B8 50%, #DCD3F2 100%)`,
        }}
      />

      <div className="flex-1 p-7">
        {/* Header */}
        <header className="flex items-start justify-between border-b pb-4" style={{ borderColor: "#C9CCD1" }}>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#241915]">
              {c.fullName || "Your Full Name"}
            </h1>
            {c.title && (
              <p className="mt-0.5 text-[11px] font-semibold text-[#5A4032]">
                {c.title}
              </p>
            )}
            {data.summary && (
              <p className="mt-2 max-w-xl text-[9px] text-[#3E2C22] leading-relaxed">
                {data.summary}
              </p>
            )}
          </div>

          {/* Contact Details Chip */}
          <div className="shrink-0 space-y-1 text-right text-[8.5px] text-[#5A4032]">
            {c.email && <p className="font-medium">{c.email}</p>}
            {c.phone && <p>{c.phone}</p>}
            {c.location && <p>{c.location}</p>}
            {c.website && <p className="underline">{c.website}</p>}
            {c.linkedin && <p className="underline">{c.linkedin}</p>}
            {c.github && <p className="underline">{c.github}</p>}
          </div>
        </header>

        {/* 2-Column Body Layout */}
        <div className="mt-5 grid grid-cols-12 gap-6">
          {/* Main Experience & Projects (8 cols) */}
          <div className="col-span-8 space-y-5">
            {/* Experience */}
            {data.experience.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: accentColor }}
                  />
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#241915]">
                    Experience
                  </h2>
                </div>
                <div className="space-y-4">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="relative pl-3 border-l" style={{ borderColor: "#E6EEF4" }}>
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-bold text-[9.5px] text-[#241915]">
                          {exp.jobTitle}
                        </h3>
                        {(exp.startDate || exp.endDate) && (
                          <span className="text-[8px] font-medium text-[#715443] tabular-nums">
                            {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                          </span>
                        )}
                      </div>
                      {exp.company && (
                        <p className="text-[8.5px] font-semibold text-[#5A4032]">
                          {exp.company}
                          {exp.location ? ` • ${exp.location}` : ""}
                        </p>
                      )}
                      {exp.description && (
                        <p className="mt-1 text-[8.5px] text-[#3E2C22] leading-normal">
                          {exp.description}
                        </p>
                      )}
                      {exp.highlights && exp.highlights.length > 0 && (
                        <ul className="mt-1 list-disc pl-3.5 space-y-0.5 text-[8px] text-[#3E2C22]">
                          {exp.highlights.map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-2.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: "#7B66B8" }}
                  />
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-[#241915]">
                    Featured Projects
                  </h2>
                </div>
                <div className="space-y-2.5">
                  {data.projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-lg border p-2.5 bg-[#E6EEF4]/30"
                      style={{ borderColor: "#C9CCD1" }}
                    >
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-semibold text-[9px] text-[#241915]">
                          {proj.name}
                        </h3>
                        {proj.url && (
                          <span className="text-[8px] text-[#5A4032] underline">
                            {proj.url}
                          </span>
                        )}
                      </div>
                      {proj.description && (
                        <p className="mt-1 text-[8px] text-[#3E2C22]">
                          {proj.description}
                        </p>
                      )}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {proj.technologies.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-white px-1.5 py-0.2 text-[7.5px] text-[#5A4032] border border-[#C9CCD1]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar: Skills, Education, Certs (4 cols) */}
          <div className="col-span-4 space-y-5">
            {/* Skills */}
            {data.skills.length > 0 && (
              <section>
                <h2 className="mb-2 text-[9.5px] font-bold uppercase tracking-wider text-[#241915] pb-1 border-b" style={{ borderColor: "#C9CCD1" }}>
                  Skills & Tools
                </h2>
                <div className="flex flex-wrap gap-1">
                  {data.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#DCD3F2]/60 px-2 py-0.5 text-[8px] font-medium text-[#241915]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education.length > 0 && (
              <section>
                <h2 className="mb-2 text-[9.5px] font-bold uppercase tracking-wider text-[#241915] pb-1 border-b" style={{ borderColor: "#C9CCD1" }}>
                  Education
                </h2>
                <div className="space-y-2">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <h3 className="font-bold text-[8.5px] text-[#241915]">
                        {edu.degree}
                        {edu.field ? ` in ${edu.field}` : ""}
                      </h3>
                      <p className="text-[8px] text-[#5A4032]">{edu.school}</p>
                      {(edu.startDate || edu.endDate) && (
                        <p className="text-[7.5px] text-[#715443]">
                          {edu.startDate} – {edu.endDate}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <section>
                <h2 className="mb-2 text-[9.5px] font-bold uppercase tracking-wider text-[#241915] pb-1 border-b" style={{ borderColor: "#C9CCD1" }}>
                  Certifications
                </h2>
                <div className="space-y-1.5">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="text-[8px]">
                      <p className="font-semibold text-[#241915]">{cert.name}</p>
                      {cert.issuer && (
                        <p className="text-[#5A4032]">{cert.issuer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
