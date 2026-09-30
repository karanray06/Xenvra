"use client";

import { useResume } from "./resume-provider";
import {
  User,
  Briefcase,
  GraduationCap,
  FolderOpen,
  Award,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { Experience, Education, Project, Certification } from "@/lib/schemas/resume";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

// ===== Collapsible Section Wrapper =====
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-surface-tertiary/50"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-text-primary">{title}</span>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 text-text-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-text-tertiary" />
        )}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-text-secondary">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
      />
    </div>
  );
}

// ===== Contact Form =====
function ContactForm() {
  const { data, updateData } = useResume();
  const c = data.contact;
  const set = (field: string, value: string) =>
    updateData((d) => ({ ...d, contact: { ...d.contact, [field]: value } }));

  return (
    <Section title="Personal Details" icon={User} defaultOpen>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Input label="Full Name" value={c.fullName} onChange={(v) => set("fullName", v)} placeholder="John Doe" />
        </div>
        <div className="col-span-2">
          <Input label="Job Title" value={c.title} onChange={(v) => set("title", v)} placeholder="Software Engineer" />
        </div>
        <Input label="Email" value={c.email} onChange={(v) => set("email", v)} placeholder="john@example.com" type="email" />
        <Input label="Phone" value={c.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" />
        <Input label="Location" value={c.location} onChange={(v) => set("location", v)} placeholder="Mumbai, India" />
        <Input label="Website" value={c.website} onChange={(v) => set("website", v)} placeholder="https://johndoe.com" />
        <Input label="LinkedIn" value={c.linkedin} onChange={(v) => set("linkedin", v)} placeholder="linkedin.com/in/johndoe" />
        <Input label="GitHub" value={c.github} onChange={(v) => set("github", v)} placeholder="github.com/johndoe" />
      </div>
    </Section>
  );
}

// ===== Summary Form =====
function SummaryForm() {
  const { data, updateField } = useResume();
  return (
    <Section title="Professional Summary" icon={User}>
      <TextArea
        label="Summary"
        value={data.summary}
        onChange={(v) => updateField("summary", v)}
        placeholder="Experienced software engineer with 5+ years..."
        rows={4}
      />
    </Section>
  );
}

// ===== Experience Form =====
function ExperienceForm() {
  const { data, updateField } = useResume();
  const items = data.experience;

  const add = () => {
    updateField("experience", [
      ...items,
      { id: genId(), jobTitle: "", company: "", location: "", startDate: "", endDate: "", currentlyWorking: false, description: "", highlights: [] },
    ]);
  };

  const update = (idx: number, field: string, value: unknown) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
    updateField("experience", next);
  };

  const remove = (idx: number) => {
    updateField("experience", items.filter((_, i) => i !== idx));
  };

  return (
    <Section title="Work Experience" icon={Briefcase}>
      <div className="space-y-4">
        {items.map((exp, i) => (
          <div key={exp.id} className="rounded-lg border border-border bg-surface-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {exp.jobTitle || exp.company || `Experience ${i + 1}`}
              </span>
              <button onClick={() => remove(i)} className="text-text-tertiary hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Job Title" value={exp.jobTitle} onChange={(v) => update(i, "jobTitle", v)} placeholder="Software Engineer" />
              <Input label="Company" value={exp.company} onChange={(v) => update(i, "company", v)} placeholder="Google" />
              <Input label="Location" value={exp.location} onChange={(v) => update(i, "location", v)} placeholder="Bangalore" />
              <Input label="Start Date" value={exp.startDate} onChange={(v) => update(i, "startDate", v)} placeholder="Jan 2022" />
              <Input label="End Date" value={exp.endDate} onChange={(v) => update(i, "endDate", v)} placeholder="Present" />
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    checked={exp.currentlyWorking}
                    onChange={(e) => update(i, "currentlyWorking", e.target.checked)}
                    className="accent-accent"
                  />
                  Currently working
                </label>
              </div>
              <div className="col-span-2">
                <TextArea label="Description" value={exp.description} onChange={(v) => update(i, "description", v)} placeholder="• Led development of..." rows={3} />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> Add Experience
        </button>
      </div>
    </Section>
  );
}

// ===== Education Form =====
function EducationForm() {
  const { data, updateField } = useResume();
  const items = data.education;

  const add = () => {
    updateField("education", [
      ...items,
      { id: genId(), school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "" },
    ]);
  };

  const update = (idx: number, field: string, value: string) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
    updateField("education", next);
  };

  const remove = (idx: number) => {
    updateField("education", items.filter((_, i) => i !== idx));
  };

  return (
    <Section title="Education" icon={GraduationCap}>
      <div className="space-y-4">
        {items.map((edu, i) => (
          <div key={edu.id} className="rounded-lg border border-border bg-surface-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {edu.school || `Education ${i + 1}`}
              </span>
              <button onClick={() => remove(i)} className="text-text-tertiary hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="School" value={edu.school} onChange={(v) => update(i, "school", v)} placeholder="MIT" />
              <Input label="Degree" value={edu.degree} onChange={(v) => update(i, "degree", v)} placeholder="B.Tech" />
              <Input label="Field" value={edu.field} onChange={(v) => update(i, "field", v)} placeholder="Computer Science" />
              <Input label="GPA" value={edu.gpa} onChange={(v) => update(i, "gpa", v)} placeholder="8.5/10" />
              <Input label="Start Date" value={edu.startDate} onChange={(v) => update(i, "startDate", v)} placeholder="Aug 2018" />
              <Input label="End Date" value={edu.endDate} onChange={(v) => update(i, "endDate", v)} placeholder="May 2022" />
            </div>
          </div>
        ))}
        <button
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> Add Education
        </button>
      </div>
    </Section>
  );
}

// ===== Projects Form =====
function ProjectsForm() {
  const { data, updateField } = useResume();
  const items = data.projects;

  const add = () => {
    updateField("projects", [
      ...items,
      { id: genId(), name: "", description: "", technologies: [], url: "", startDate: "", endDate: "" },
    ]);
  };

  const update = (idx: number, field: string, value: unknown) => {
    const next = items.map((item, i) => (i === idx ? { ...item, [field]: value } : item));
    updateField("projects", next);
  };

  const remove = (idx: number) => {
    updateField("projects", items.filter((_, i) => i !== idx));
  };

  return (
    <Section title="Projects" icon={FolderOpen}>
      <div className="space-y-4">
        {items.map((proj, i) => (
          <div key={proj.id} className="rounded-lg border border-border bg-surface-secondary p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-text-secondary">
                {proj.name || `Project ${i + 1}`}
              </span>
              <button onClick={() => remove(i)} className="text-text-tertiary hover:text-danger">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Project Name" value={proj.name} onChange={(v) => update(i, "name", v)} placeholder="My App" />
              <Input label="URL" value={proj.url} onChange={(v) => update(i, "url", v)} placeholder="https://myapp.com" />
              <Input label="Start Date" value={proj.startDate} onChange={(v) => update(i, "startDate", v)} placeholder="Jun 2023" />
              <Input label="End Date" value={proj.endDate} onChange={(v) => update(i, "endDate", v)} placeholder="Aug 2023" />
              <div className="col-span-2">
                <Input
                  label="Technologies (comma separated)"
                  value={proj.technologies.join(", ")}
                  onChange={(v) => update(i, "technologies", v.split(",").map((s) => s.trim()).filter(Boolean))}
                  placeholder="React, Node.js, PostgreSQL"
                />
              </div>
              <div className="col-span-2">
                <TextArea label="Description" value={proj.description} onChange={(v) => update(i, "description", v)} placeholder="Built a full-stack..." rows={3} />
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> Add Project
        </button>
      </div>
    </Section>
  );
}

// ===== Skills Form =====
function SkillsForm() {
  const { data, updateField } = useResume();
  const [input, setInput] = useState("");

  const addSkill = () => {
    const skill = input.trim();
    if (skill && !data.skills.includes(skill)) {
      updateField("skills", [...data.skills, skill]);
      setInput("");
    }
  };

  const removeSkill = (skill: string) => {
    updateField("skills", data.skills.filter((s) => s !== skill));
  };

  return (
    <Section title="Skills" icon={Award}>
      <div>
        <div className="mb-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            placeholder="Type a skill and press Enter"
            className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
          <button
            onClick={addSkill}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-accent"
            >
              {skill}
              <button onClick={() => removeSkill(skill)} className="hover:text-danger">
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ===== Main Form Panel =====
export function ResumeForm() {
  return (
    <div className="h-full overflow-y-auto">
      <ContactForm />
      <SummaryForm />
      <ExperienceForm />
      <EducationForm />
      <ProjectsForm />
      <SkillsForm />
    </div>
  );
}
