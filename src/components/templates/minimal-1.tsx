import type { TemplateProps } from "./registry";

export function Minimalist({ data, accentColor = "#F97316" }: TemplateProps) {
  const c = data.contact;
  return (
    <div className="p-8 font-[system-ui]" style={{ fontSize: "10px", lineHeight: "1.5" }}>
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-light tracking-wide text-gray-900">{c.fullName || "Your Name"}</h1>
        {c.title && <p className="mt-1 text-[11px] text-gray-500">{c.title}</p>}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[9px] text-gray-500">
          {c.email && <span>{c.email}</span>}
          {c.phone && <><span className="text-gray-300">|</span><span>{c.phone}</span></>}
          {c.location && <><span className="text-gray-300">|</span><span>{c.location}</span></>}
          {c.linkedin && <><span className="text-gray-300">|</span><span>{c.linkedin}</span></>}
          {c.github && <><span className="text-gray-300">|</span><span>{c.github}</span></>}
        </div>
      </div>

      <div className="mx-auto mb-6 h-px w-16" style={{ backgroundColor: accentColor }} />

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <p className="text-center text-[9px] italic leading-relaxed text-gray-600">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-gray-900">{exp.jobTitle}</span>
                  {exp.company && <span className="text-[9px] text-gray-500"> — {exp.company}</span>}
                </div>
                <span className="text-[8px] text-gray-400">{exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}</span>
              </div>
              {exp.description && <p className="mt-1 text-[9px] leading-relaxed text-gray-600 whitespace-pre-line">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-gray-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</span>
                  {edu.school && <span className="text-[9px] text-gray-500"> — {edu.school}</span>}
                </div>
                <span className="text-[8px] text-gray-400">{edu.startDate} – {edu.endDate}</span>
              </div>
              {edu.gpa && <p className="text-[8px] text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-3">
              <p className="text-[10px] font-semibold text-gray-900">{proj.name}</p>
              {proj.technologies.length > 0 && (
                <p className="text-[8px] text-gray-400">{proj.technologies.join(" · ")}</p>
              )}
              {proj.description && <p className="mt-1 text-[9px] text-gray-600">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Skills</h2>
          <p className="text-[9px] text-gray-600">{data.skills.join(" · ")}</p>
        </div>
      )}
    </div>
  );
}
