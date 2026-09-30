import type { TemplateProps } from "./registry";

export function ModernClassic({ data, accentColor = "#F97316" }: TemplateProps) {
  const c = data.contact;
  return (
    <div className="flex h-full font-[system-ui]" style={{ fontSize: "10px", lineHeight: "1.4" }}>
      {/* Sidebar */}
      <div className="w-[35%] p-6 text-white" style={{ backgroundColor: accentColor }}>
        <div className="mb-6">
          <h1 className="text-lg font-bold leading-tight">{c.fullName || "Your Name"}</h1>
          {c.title && <p className="mt-1 text-[11px] opacity-90">{c.title}</p>}
        </div>

        {/* Contact */}
        <div className="mb-5">
          <h2 className="mb-2 border-b border-white/30 pb-1 text-[9px] font-bold uppercase tracking-wider">Contact</h2>
          <div className="space-y-1 text-[9px] opacity-90">
            {c.email && <p>{c.email}</p>}
            {c.phone && <p>{c.phone}</p>}
            {c.location && <p>{c.location}</p>}
            {c.website && <p>{c.website}</p>}
            {c.linkedin && <p>{c.linkedin}</p>}
            {c.github && <p>{c.github}</p>}
          </div>
        </div>

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-2 border-b border-white/30 pb-1 text-[9px] font-bold uppercase tracking-wider">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((skill) => (
                <span key={skill} className="rounded bg-white/20 px-1.5 py-0.5 text-[8px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="mb-2 border-b border-white/30 pb-1 text-[9px] font-bold uppercase tracking-wider">Education</h2>
            {data.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <p className="font-semibold text-[9px]">{edu.degree}{edu.field ? ` in ${edu.field}` : ""}</p>
                <p className="text-[8px] opacity-90">{edu.school}</p>
                {(edu.startDate || edu.endDate) && (
                  <p className="text-[8px] opacity-70">{edu.startDate} – {edu.endDate}</p>
                )}
                {edu.gpa && <p className="text-[8px] opacity-70">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Summary */}
        {data.summary && (
          <div className="mb-5">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              Summary
            </h2>
            <p className="text-[9px] leading-relaxed text-gray-700">{data.summary}</p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              Experience
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="mb-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-bold text-gray-900">{exp.jobTitle}</p>
                  <p className="text-[8px] text-gray-500">{exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}</p>
                </div>
                <p className="text-[9px] font-medium" style={{ color: accentColor }}>{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                {exp.description && (
                  <div className="mt-1 text-[9px] leading-relaxed text-gray-600 whitespace-pre-line">{exp.description}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-5">
            <h2 className="mb-2 text-[10px] font-bold uppercase tracking-wider" style={{ color: accentColor }}>
              Projects
            </h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="mb-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-[10px] font-bold text-gray-900">{proj.name}</p>
                  {proj.url && <p className="text-[8px] text-gray-500">{proj.url}</p>}
                </div>
                {proj.technologies.length > 0 && (
                  <p className="text-[8px] italic text-gray-500">{proj.technologies.join(", ")}</p>
                )}
                {proj.description && (
                  <p className="mt-1 text-[9px] leading-relaxed text-gray-600">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
