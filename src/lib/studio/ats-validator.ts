import type { StudioDocument, TextElement } from "@/lib/schemas/studio";

export interface ATSValidationResult {
  score: number;
  grade: "A+" | "A" | "B" | "C";
  isExtractable: boolean;
  sectionsDetected: {
    contact: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
  metricsCount: number;
  wordCount: number;
  checklist: {
    id: string;
    title: string;
    status: "pass" | "warn" | "fail";
    description: string;
  }[];
}

export function validateStudioDocumentATS(doc: StudioDocument): ATSValidationResult {
  const textElements: TextElement[] = [];

  for (const page of doc.pages) {
    for (const el of page.elements) {
      if (el.type === "text" && !el.hidden && (el.opacity ?? 1) > 0.2) {
        textElements.push(el as TextElement);
      }
    }
  }

  const allText = textElements.map((el) => el.content).join("\n");
  const lowerText = allText.toLowerCase();

  // 1. Text Extractability Check
  const isExtractable = textElements.length > 3 && allText.trim().length > 50;

  // 2. Sections presence
  const hasContact =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(allText) ||
    /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(allText) ||
    lowerText.includes("linkedin.com") ||
    lowerText.includes("github.com");

  const hasExperience =
    lowerText.includes("experience") ||
    lowerText.includes("work history") ||
    lowerText.includes("employment") ||
    lowerText.includes("professional history");

  const hasEducation =
    lowerText.includes("education") ||
    lowerText.includes("university") ||
    lowerText.includes("college") ||
    lowerText.includes("b.tech") ||
    lowerText.includes("degree");

  const hasSkills =
    lowerText.includes("skills") ||
    lowerText.includes("technical skills") ||
    lowerText.includes("technologies") ||
    lowerText.includes("core competencies");

  // 3. Quantified metrics count (% numbers, currency, multipliers, metrics)
  const metricMatches = allText.match(/\b\d+([.,]\d+)?\s*(%|k|m|cr|lakh|x|\+|users|requests|ms|sec)\b/gi) || [];
  const metricsCount = metricMatches.length;

  // 4. Word count
  const words = allText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 5. Checklist Generation
  const checklist: ATSValidationResult["checklist"] = [];

  // Extractability
  checklist.push({
    id: "extractable",
    title: "Vector ATS Text Layer",
    status: isExtractable ? "pass" : "fail",
    description: isExtractable
      ? "All text elements are compiled into native PDF stream operands with zero raster distortion."
      : "Insufficient selectable text detected. Ensure you are using text boxes instead of flattened images.",
  });

  // Contact Info
  checklist.push({
    id: "contact",
    title: "Verifiable Contact Information",
    status: hasContact ? "pass" : "fail",
    description: hasContact
      ? "Email, phone number, and digital portfolio links are cleanly parsed."
      : "Missing explicit email address or phone number in text layer.",
  });

  // Core Sections
  const coreSectionsCount = [hasExperience, hasEducation, hasSkills].filter(Boolean).length;
  checklist.push({
    id: "sections",
    title: "Standard ATS Section Hierarchy",
    status: coreSectionsCount === 3 ? "pass" : coreSectionsCount >= 2 ? "warn" : "fail",
    description:
      coreSectionsCount === 3
        ? "Work Experience, Education, and Skills sections detected with standard headers."
        : "Missing one or more standard sections (Work Experience, Education, or Skills).",
  });

  // Quantified Impact
  checklist.push({
    id: "metrics",
    title: "Quantified X-Y-Z Metrics",
    status: metricsCount >= 4 ? "pass" : metricsCount >= 2 ? "warn" : "fail",
    description:
      metricsCount >= 4
        ? `Found ${metricsCount} quantified metrics (percentages, speed improvements, or revenue numbers).`
        : `Only found ${metricsCount} quantified metrics. Add numbers to demonstrate tangible business impact.`,
  });

  // Word Density
  checklist.push({
    id: "density",
    title: "Information Density & Length",
    status: wordCount >= 150 && wordCount <= 750 ? "pass" : "warn",
    description:
      wordCount >= 150 && wordCount <= 750
        ? `Ideal density (${wordCount} words) for single-page visual recruiter scanning.`
        : wordCount < 150
          ? `Text volume is sparse (${wordCount} words). Add detailed project highlights and responsibilities.`
          : `High density (${wordCount} words). Consider trimming verbose sentences to preserve clean margins.`,
  });

  // Score Calculation
  let baseScore = 20; // baseline for vector AST
  if (isExtractable) baseScore += 20;
  if (hasContact) baseScore += 15;
  if (hasExperience) baseScore += 15;
  if (hasEducation) baseScore += 10;
  if (hasSkills) baseScore += 10;
  if (metricsCount >= 4) baseScore += 10;
  else if (metricsCount >= 2) baseScore += 5;

  const score = Math.min(100, Math.max(0, baseScore));
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : "C";

  return {
    score,
    grade,
    isExtractable,
    sectionsDetected: {
      contact: hasContact,
      experience: hasExperience,
      education: hasEducation,
      skills: hasSkills,
    },
    metricsCount,
    wordCount,
    checklist,
  };
}
