import { z } from "zod";

// ===== Resume Data Schema =====
// Shared between client and server for validation

export const contactSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  title: z.string().default(""),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
});

export const experienceSchema = z.object({
  id: z.string(),
  jobTitle: z.string().default(""),
  company: z.string().default(""),
  location: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  currentlyWorking: z.boolean().default(false),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  school: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  gpa: z.string().default(""),
  description: z.string().default(""),
});

export const projectSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  url: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
});

export const certificationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});

export const customSectionSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string().default(""),
      subtitle: z.string().default(""),
      date: z.string().default(""),
      description: z.string().default(""),
    })
  ).default([]),
});

export const resumeDataSchema = z.object({
  contact: contactSchema,
  summary: z.string().default(""),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(certificationSchema).default([]),
  languages: z.array(z.object({
    name: z.string(),
    proficiency: z.string().default(""),
  })).default([]),
  links: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })).default([]),
  customSections: z.array(customSectionSchema).default([]),
});

// ===== Inferred Types =====
export type ResumeData = z.infer<typeof resumeDataSchema>;
export type Contact = z.infer<typeof contactSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type CustomSection = z.infer<typeof customSectionSchema>;

// ===== Default Empty Resume =====
export function createEmptyResume(): ResumeData {
  return {
    contact: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      github: "",
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    languages: [],
    links: [],
    customSections: [],
  };
}

// ===== Template Theme =====
export const templateThemeSchema = z.object({
  accentColor: z.string().default("#F97316"),
  fontFamily: z.string().default("Inter"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
  margins: z.enum(["narrow", "normal", "wide"]).default("normal"),
  sectionOrder: z.array(z.string()).default([
    "summary",
    "experience",
    "education",
    "projects",
    "skills",
    "certifications",
    "languages",
    "customSections",
  ]),
  hiddenSections: z.array(z.string()).default([]),
});

export type TemplateTheme = z.infer<typeof templateThemeSchema>;

export function createDefaultTheme(): TemplateTheme {
  return templateThemeSchema.parse({});
}
