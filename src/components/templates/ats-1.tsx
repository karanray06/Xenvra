import type { TemplateProps } from "./registry";

export function ATSOptimized({ data }: TemplateProps) {
  const c = data.contact;
  return (
    <div className="p-8 font-[Georgia,serif]" style={{ fontSize: "10px", lineHeight: "1.5" }}>
      {/* Header */}
      <div className="mb-1 text-center">
        <h1 className="text-xl font-bold text-gray-900">{c.fullName || "Your Name"}</h1>
      </div>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-[9px] text-gray-600">
        {c.email && <span>{c.email}</span>}
        {c.phone && <><span>·</span><span>{c.phone}</span></>}
        {c.location && <><span>·</span><span>{c.location}</span></>}
        {c.linkedin && <><span>·</span><span>{c.linkedin}</span></>}
        {c.github && <><span>·</span><span>{c.github}</span></>}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-4">
          <h2 className="mb-1 border-b border-gray-900 text-[10px] font-bold uppercase text-gray-900">Summary</h2>
          <p className="text-[9px] text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-1 border-b border-gray-900 text-[10px] font-bold uppercase text-gray-900">Professional Experience</h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="mb-3">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-bold text-gray-900">{exp.jobTitle}{exp.company ? `, ${exp.company}` : ""}{exp.location ? `, ${exp.location}` : ""}</p>
                <p className="text-[9px] text-gray-600">{exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}</p>
              </div>
              {exp.description && <div className="mt-1 text-[9px] text-gray-700 whitespace-pre-line">{exp.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-1 border-b border-gray-900 text-[10px] font-bold uppercase text-gray-900">Education</h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="mb-2">
              <div className="flex items-baseline justify-between">
                <p className="text-[10px] font-bold text-gray-900">
                  {edu.degree}{edu.field ? ` in ${edu.field}` : ""}{edu.school ? `, ${edu.school}` : ""}
                </p>
                <p className="text-[9px] text-gray-600">{edu.startDate} – {edu.endDate}</p>
              </div>
              {edu.gpa && <p className="text-[8px] text-gray-600">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-4">
          <h2 className="mb-1 border-b border-gray-900 text-[10px] font-bold uppercase text-gray-900">Projects</h2>
          {data.projects.map((proj) => (
            <div key={proj.id} className="mb-2">
              <p className="text-[10px] font-bold text-gray-900">{proj.name}</p>
              {proj.technologies.length > 0 && <p className="text-[8px] text-gray-600">Technologies: {proj.technologies.join(", ")}</p>}
              {proj.description && <p className="text-[9px] text-gray-700">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="mb-1 border-b border-gray-900 text-[10px] font-bold uppercase text-gray-900">Skills</h2>
          <p className="text-[9px] text-gray-700">{data.skills.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
