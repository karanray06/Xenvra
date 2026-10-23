import { z } from "zod";

export const documentContactSchema = z.object({
  fullName: z.string().default(""),
  title: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  website: z.string().default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  photoUrl: z.string().optional(),
});

export const documentExperienceSchema = z.object({
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

export const documentEducationSchema = z.object({
  id: z.string(),
  school: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  gpa: z.string().default(""),
  description: z.string().default(""),
});

export const documentSkillItemSchema = z.union([
  z.string(),
  z.object({
    name: z.string(),
    level: z.number().min(1).max(5).optional(),
    category: z.string().optional(),
  }),
]);

export const documentProjectSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  url: z.string().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
});

export const documentCertificationSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
  url: z.string().default(""),
});

export const documentLanguageSchema = z.object({
  name: z.string(),
  proficiency: z.string().default(""),
});

export const documentReferenceSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  role: z.string().default(""),
  company: z.string().default(""),
  contact: z.string().default(""),
});

export const documentCustomSectionSchema = z.object({
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

export const styleOverridesSchema = z.object({
  accentColor: z.string().optional(),
  fontPair: z.object({
    heading: z.string(),
    body: z.string(),
  }).optional(),
  density: z.enum(["compact", "normal", "spacious"]).default("normal"),
  sectionSpacing: z.number().min(8).max(36).default(16),
  marginSize: z.string().default("0.5in"),
});

export const resumeDocumentSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  contact: documentContactSchema.default({
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
  }),
  summary: z.string().default(""),
  experience: z.array(documentExperienceSchema).default([]),
  education: z.array(documentEducationSchema).default([]),
  skills: z.array(documentSkillItemSchema).default([]),
  certifications: z.array(documentCertificationSchema).default([]),
  projects: z.array(documentProjectSchema).default([]),
  languages: z.array(documentLanguageSchema).default([]),
  hobbies: z.array(z.string()).default([]),
  references: z.array(documentReferenceSchema).default([]),
  customSections: z.array(documentCustomSectionSchema).default([]),
  sectionOrder: z.array(z.string()).default([
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
  ]),
  sectionVisibility: z.record(z.string(), z.boolean()).default({}),
  styleOverrides: styleOverridesSchema.default({
    density: "normal",
    sectionSpacing: 16,
    marginSize: "0.5in",
  }),
});

export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;
export type StyleOverrides = z.infer<typeof styleOverridesSchema>;
