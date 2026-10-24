import type { TemplateProps } from "./registry";
import { resolveTemplateTheme } from "./themes";

export function MinimalSerif({
  data,
  accentColor,
  fontFamily,
}: TemplateProps) {
  const theme = resolveTemplateTheme("serif", accentColor, fontFamily);
  const c = data.contact;

  return (
    <div
      className="h-full min-h-[1123px] w-full bg-white p-10 text-[#241915]"
      style={{
        fontFamily: theme.fontBody,
        fontSize: "10px",
        lineHeight: "1.55",
      }}
    >
      {/* Centered Editorial Header */}
      <header className="text-center pb-6 border-b border-[#C9CCD1] space-y-2">
        <h1
          className="text-3xl tracking-tight text-[#241915]"
          style={{ fontFamily: theme.fontHeading }}
        >
          {c.fullName || "Your Full Name"}
        </h1>
        {c.title && (
          <p
            className="text-xs uppercase tracking-widest text-[#5A4032]"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            {c.title}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9px] text-[#5E534D] pt-1">
          {c.email && <span>{c.email}</span>}
          {c.phone && <span>• {c.phone}</span>}
          {c.location && <span>• {c.location}</span>}
          {c.website && <span>• {c.website}</span>}
          {c.linkedin && <span>• {c.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.summary && (
        <section className="mt-6 text-center max-w-2xl mx-auto">
          <p className="text-[10px] italic text-[#241915] leading-relaxed">
            &ldquo;{data.summary}&rdquo;
          </p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mt-8 space-y-5">
          <h2
            className="text-base text-[#241915] border-b border-[#C9CCD1] pb-1"
            style={{ fontFamily: theme.fontHeading }}
          >
            Professional Experience
          </h2>
          {data.experience.map((exp) => (
            <div key={exp.id} className="space-y-1">
              <div className="flex items-baseline justify-between">
                <h3 className="font-bold text-[11px] text-[#241915]">
                  {exp.jobTitle}{exp.company ? `, ${exp.company}` : ""}
                </h3>
                <span className="text-[9px] text-[#5E534D]">
                  {exp.startDate} – {exp.currentlyWorking ? "Present" : exp.endDate}
                </span>
              </div>
              {exp.location && (
                <p className="text-[8.5px] text-[#6F747C] italic">{exp.location}</p>
              )}
              {exp.description && (
                <p className="text-[9.5px] text-[#241915] whitespace-pre-line leading-relaxed">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mt-8 space-y-4">
          <h2
            className="text-base text-[#241915] border-b border-[#C9CCD1] pb-1"
            style={{ fontFamily: theme.fontHeading }}
          >
            Education & Academic Credentials
          </h2>
          {data.education.map((edu) => (
            <div key={edu.id} className="flex items-baseline justify-between text-[9.5px]">
              <div>
                <p className="font-bold text-[#241915]">
                  {edu.degree} {edu.field && `in ${edu.field}`}
                </p>
                <p className="text-[#5E534D]">{edu.school}</p>
              </div>
              <span className="text-[9px] text-[#6F747C]">
                {edu.startDate} – {edu.endDate}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mt-8 space-y-2">
          <h2
            className="text-base text-[#241915] border-b border-[#C9CCD1] pb-1"
            style={{ fontFamily: theme.fontHeading }}
          >
            Areas of Expertise
          </h2>
          <p className="text-[9.5px] text-[#241915] leading-relaxed">
            {data.skills.join(" • ")}
          </p>
        </section>
      )}
    </div>
  );
}
