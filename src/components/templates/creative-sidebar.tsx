import type { TemplateProps } from "./registry";
import { resolveTemplateTheme } from "./themes";

export function CreativeSidebar({
  data,
  accentColor,
  fontFamily,
}: TemplateProps) {
  const theme = resolveTemplateTheme("lavender", accentColor, fontFamily);
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
      {/* Lavender Sidebar */}
      <aside
        className="w-[34%] p-6 space-y-6"
        style={{
          backgroundColor: "#DCD3F2",
        }}
      >
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-[#241915]"
            style={{ fontFamily: theme.fontHeading }}
          >
            {c.fullName || "Your Full Name"}
          </h1>
          {c.title && (
            <p className="mt-1 text-xs font-semibold text-[#5A4032]">
              {c.title}
            </p>
          )}
        </div>

        {/* Contact info card */}
        <div className="rounded-xl bg-white/70 p-3.5 space-y-1.5 text-[9px] text-[#241915] backdrop-blur-xs">
          <p className="font-bold uppercase tracking-wider text-[10px] text-[#5A4032] mb-1">
            Connect
          </p>
          {c.email && <p className="font-medium break-all">{c.email}</p>}
          {c.phone && <p>{c.phone}</p>}
          {c.location && <p>{c.location}</p>}
          {c.website && <p className="break-all">{c.website}</p>}
          {c.linkedin && <p className="break-all">{c.linkedin}</p>}
          {c.github && <p className="break-all">{c.github}</p>}
        </div>

        {/* Skills pill cloud */}
        {data.skills && data.skills.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-[#5A4032]">
              Core Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-[#5A4032] text-white px-2 py-0.5 text-[8.5px] font-medium"
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
            <h3 className="font-bold text-[10px] uppercase tracking-wider text-[#5A4032]">
              Education
            </h3>
            {data.education.map((edu) => (
              <div key={edu.id} className="space-y-0.5 text-[9px]">
                <p className="font-bold text-[#241915]">{edu.degree}</p>
                <p className="text-[#5A4032]">{edu.school}</p>
                <p className="text-[8px] text-[#47322A]">
                  {edu.startDate} – {edu.endDate}
                </p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6">
        {data.summary && (
          <section className="space-y-1.5">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-[#5A4032] border-b pb-1"
              style={{ fontFamily: theme.fontHeading, borderColor: "#C9CCD1" }}
            >
              About Me
            </h2>
            <p className="text-[9.5px] text-[#241915] leading-relaxed">
              {data.summary}
            </p>
          </section>
        )}

        {/* Work Experience */}
        {data.experience && data.experience.length > 0 && (
          <section className="space-y-4">
            <h2
              className="text-xs font-bold uppercase tracking-wider text-[#5A4032] border-b pb-1"
              style={{ fontFamily: theme.fontHeading, borderColor: "#C9CCD1" }}
            >
              Experience
            </h2>
            {data.experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-[9.5px]">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-[#241915]">
                    {exp.jobTitle}{exp.company ? ` • ${exp.company}` : ""}
                  </h3>
                  <span className="text-[8.5px] text-[#6F747C]">
                    {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                  </span>
                </div>
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
              className="text-xs font-bold uppercase tracking-wider text-[#5A4032] border-b pb-1"
              style={{ fontFamily: theme.fontHeading, borderColor: "#C9CCD1" }}
            >
              Featured Work
            </h2>
            {data.projects.map((proj) => (
              <div key={proj.id} className="space-y-0.5 text-[9px]">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-bold text-[#241915]">{proj.name}</h3>
                  {proj.url && (
                    <span className="text-[8px] text-[#5A4032] font-semibold underline">
                      {proj.url}
                    </span>
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
