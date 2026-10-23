import type { ResumeData } from "./schemas/resume";

export interface AtsCategoryScore {
  score: number;
  max: number;
  label: string;
}

export interface AtsSuggestion {
  id: string;
  type: "critical" | "warning" | "tip";
  title: string;
  description: string;
  section: "contact" | "summary" | "experience" | "skills" | "education" | "general";
}

export interface AtsAnalysisResult {
  overallScore: number;
  rating: "Needs Work" | "Fair" | "Good" | "Strong" | "Exceptional";
  categoryScores: {
    contact: AtsCategoryScore;
    structure: AtsCategoryScore;
    impact: AtsCategoryScore;
    actionVerbs: AtsCategoryScore;
    skillsAndKeywords: AtsCategoryScore;
  };
  suggestions: AtsSuggestion[];
  metrics: {
    wordCount: number;
    bulletCount: number;
    quantifiedBulletCount: number;
    strongVerbsCount: number;
    skillsCount: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
}

const STRONG_ACTION_VERBS = new Set([
  "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
  "advanced", "advised", "aligned", "allocated", "analyzed", "architected",
  "automated", "boosted", "budgeted", "built", "centralized", "championed",
  "clarified", "coached", "collaborated", "constructed", "consulted", "contracted",
  "coordinated", "crafted", "created", "curated", "customized", "decreased",
  "defined", "delivered", "deployed", "designed", "developed", "devised",
  "diagnosed", "directed", "distributed", "documented", "doubled", "drove",
  "engineered", "enhanced", "established", "evaluated", "exceeded", "executed",
  "expanded", "expedited", "fabricated", "facilitated", "forecasted", "formulated",
  "fostered", "founded", "generated", "governed", "guided", "halved",
  "harmonized", "headed", "identified", "implemented", "improved", "increased",
  "initiated", "innovated", "inspected", "installed", "instituted", "integrated",
  "introduced", "invented", "investigated", "launched", "lead", "led",
  "leveraged", "managed", "maximized", "mentored", "migrated", "minimized",
  "modeled", "modernized", "monitored", "negotiated", "operated", "optimized",
  "orchestrated", "organized", "originated", "outperformed", "overhauled", "oversaw",
  "partnered", "performed", "pioneered", "planned", "positioned", "prepared",
  "presented", "produced", "programmed", "promoted", "proposed", "published",
  "rebuilt", "reconciled", "redesigned", "reduced", "reengineered", "refined",
  "reformed", "remodeled", "reorganized", "replaced", "resolved", "restructured",
  "revamped", "scaled", "scheduled", "secured", "simplified", "spearheaded",
  "standardized", "streamlined", "strengthened", "structured", "supervised", "surpassed",
  "synthesized", "systematized", "trained", "transformed", "transitioned", "translated",
  "unified", "upgraded", "validated", "visualized", "won", "yielded"
]);

// Common metrics pattern (numbers, %, $, ₹, K, M, Xx increase)
const METRIC_REGEX = /\b(\d+(\.\d+)?%|\$\d+(\.\d+)?[kmbKMB]?|₹\d+(\.\d+)?[kmbKMB]?|\d+\+?|\d+x|\d+X)\b/;

export function analyzeResumeAts(
  data: ResumeData,
  targetJobDescription?: string
): AtsAnalysisResult {
  const suggestions: AtsSuggestion[] = [];

  // 1. Contact Score (max 20)
  let contactScore = 0;
  const contact = data.contact || {};
  if (contact.fullName && contact.fullName.trim().length > 1) contactScore += 5;
  if (contact.email && contact.email.includes("@")) contactScore += 5;
  if (contact.phone && contact.phone.trim().length > 6) contactScore += 4;
  if (contact.location && contact.location.trim().length > 2) contactScore += 3;
  if (contact.linkedin && contact.linkedin.trim().length > 4) contactScore += 3;

  if (!contact.email || !contact.email.includes("@")) {
    suggestions.push({
      id: "contact-email",
      type: "critical",
      title: "Add a valid email address",
      description: "Recruiters and ATS parsers need an email to contact you for screening.",
      section: "contact",
    });
  }
  if (!contact.phone || contact.phone.trim().length < 7) {
    suggestions.push({
      id: "contact-phone",
      type: "warning",
      title: "Add a phone number",
      description: "A direct contact phone number increases interview call rates by over 40%.",
      section: "contact",
    });
  }
  if (!contact.linkedin) {
    suggestions.push({
      id: "contact-linkedin",
      type: "tip",
      title: "Include your LinkedIn profile",
      description: "Over 87% of technical recruiters review applicant LinkedIn profiles before interviews.",
      section: "contact",
    });
  }

  // 2. Structure & Completeness Score (max 20)
  let structureScore = 0;
  const hasSummary = Boolean(data.summary && data.summary.trim().length > 40);
  const expCount = (data.experience || []).length;
  const eduCount = (data.education || []).length;
  const skillsCount = (data.skills || []).length;

  if (hasSummary) structureScore += 5;
  if (expCount >= 1) structureScore += 5;
  if (expCount >= 2) structureScore += 3;
  if (eduCount >= 1) structureScore += 4;
  if (skillsCount >= 4) structureScore += 3;

  if (!hasSummary) {
    suggestions.push({
      id: "structure-summary",
      type: "warning",
      title: "Add a professional summary",
      description: "A 2-3 sentence overview at the top quickly anchors your core value proposition.",
      section: "summary",
    });
  }
  if (expCount === 0) {
    suggestions.push({
      id: "structure-experience",
      type: "critical",
      title: "Add your work experience",
      description: "Employment history is the single highest-weighted section in ATS screening.",
      section: "experience",
    });
  }
  if (eduCount === 0) {
    suggestions.push({
      id: "structure-education",
      type: "warning",
      title: "Add your education",
      description: "Specify your degree, university, or relevant certifications.",
      section: "education",
    });
  }

  // 3. Impact & Quantification Score (max 20)
  let impactScore = 0;
  let totalBullets = 0;
  let quantifiedBullets = 0;
  let strongVerbsCount = 0;
  let totalWordCount = (data.summary || "").split(/\s+/).filter(Boolean).length;

  (data.experience || []).forEach((exp) => {
    const bullets = exp.highlights && exp.highlights.length > 0
      ? exp.highlights
      : (exp.description || "").split("\n").filter((l) => l.trim().length > 0);

    bullets.forEach((bullet) => {
      totalBullets++;
      const words = bullet.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
      totalWordCount += words.length;

      // Check for metrics/quantification
      if (METRIC_REGEX.test(bullet)) {
        quantifiedBullets++;
      }

      // Check first word or words for strong action verb
      const firstWord = words[0];
      if (firstWord && STRONG_ACTION_VERBS.has(firstWord)) {
        strongVerbsCount++;
      } else if (words.some((w) => STRONG_ACTION_VERBS.has(w))) {
        strongVerbsCount++;
      }
    });
  });

  const quantRatio = totalBullets > 0 ? quantifiedBullets / totalBullets : 0;
  if (quantRatio >= 0.5) impactScore = 20;
  else if (quantRatio >= 0.3) impactScore = 15;
  else if (quantRatio > 0.1) impactScore = 10;
  else if (quantifiedBullets > 0) impactScore = 5;

  if (totalBullets > 0 && quantRatio < 0.35) {
    suggestions.push({
      id: "impact-quantify",
      type: "warning",
      title: "Quantify your achievements with metrics",
      description: `Only ${quantifiedBullets} of your ${totalBullets} bullets contain numbers or percentages. Use metrics like "Increased conversion by 24%" or "Managed $50k budget".`,
      section: "experience",
    });
  }

  // 4. Action Verbs Score (max 20)
  let actionVerbsScore = 0;
  const verbRatio = totalBullets > 0 ? strongVerbsCount / totalBullets : 0;
  if (verbRatio >= 0.6) actionVerbsScore = 20;
  else if (verbRatio >= 0.4) actionVerbsScore = 15;
  else if (verbRatio >= 0.2) actionVerbsScore = 10;
  else if (strongVerbsCount > 0) actionVerbsScore = 5;

  if (totalBullets > 0 && verbRatio < 0.5) {
    suggestions.push({
      id: "verbs-strengthen",
      type: "tip",
      title: "Begin bullet points with strong action verbs",
      description: "Start bullets with verbs like 'Spearheaded', 'Engineered', 'Optimized', or 'Orchestrated' instead of passive phrases like 'Responsible for'.",
      section: "experience",
    });
  }

  // 5. Skills & Keywords Alignment (max 20)
  let skillsScore = 0;
  if (skillsCount >= 10) skillsScore = 20;
  else if (skillsCount >= 6) skillsScore = 15;
  else if (skillsCount >= 3) skillsScore = 10;
  else if (skillsCount > 0) skillsScore = 5;

  if (skillsCount < 6) {
    suggestions.push({
      id: "skills-expand",
      type: "warning",
      title: "Include at least 6-8 core technical or domain skills",
      description: "ATS scanners index skills to compute role relevance matching.",
      section: "skills",
    });
  }

  // Job Description Matching (if provided)
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  if (targetJobDescription && targetJobDescription.trim().length > 20) {
    // Extract keywords from job description
    const resumeText = [
      data.summary,
      ...(data.skills || []),
      ...(data.experience || []).map((e) => `${e.jobTitle} ${e.company} ${e.description} ${(e.highlights || []).join(" ")}`),
      ...(data.projects || []).map((p) => `${p.name} ${p.description} ${(p.technologies || []).join(" ")}`),
    ]
      .join(" ")
      .toLowerCase();

    // Common stopwords to exclude
    const stopwords = new Set([
      "about", "above", "after", "again", "against", "all", "and", "any", "are", "because",
      "been", "before", "being", "below", "between", "both", "but", "by", "can", "could",
      "did", "each", "few", "for", "from", "further", "had", "has", "have", "having",
      "her", "here", "hers", "herself", "him", "himself", "his", "how", "into", "its",
      "itself", "just", "more", "most", "must", "not", "off", "once", "only", "other",
      "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "some",
      "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then",
      "there", "these", "they", "this", "those", "through", "too", "under", "until",
      "very", "was", "were", "what", "when", "where", "which", "while", "who", "whom",
      "why", "with", "would", "you", "your", "yours", "yourself", "yourselves", "will",
      "work", "team", "experience", "years", "role", "looking", "candidate", "ability",
      "responsibilities", "requirements", "skills", "plus", "qualifications", "strong"
    ]);

    const words = targetJobDescription
      .toLowerCase()
      .replace(/[^a-z0-9#+.]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w));

    // Count frequency to find top job requirements
    const freq: Record<string, number> = {};
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k]) => k);

    topKeywords.forEach((kw) => {
      if (resumeText.includes(kw)) {
        matchedKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    });

    if (missingKeywords.length > 0) {
      suggestions.push({
        id: "keywords-missing",
        type: "tip",
        title: `Align with Job Description: ${missingKeywords.length} keywords missing`,
        description: `Consider incorporating relevant keywords such as: ${missingKeywords.slice(0, 5).join(", ")}.`,
        section: "skills",
      });
    }
  }

  // Calculate Overall Score (sum of 5 categories, max 100)
  const overallScore = Math.min(
    100,
    Math.round(contactScore + structureScore + impactScore + actionVerbsScore + skillsScore)
  );

  let rating: AtsAnalysisResult["rating"] = "Needs Work";
  if (overallScore >= 90) rating = "Exceptional";
  else if (overallScore >= 80) rating = "Strong";
  else if (overallScore >= 70) rating = "Good";
  else if (overallScore >= 50) rating = "Fair";

  return {
    overallScore,
    rating,
    categoryScores: {
      contact: { score: contactScore, max: 20, label: "Contact Information" },
      structure: { score: structureScore, max: 20, label: "Structure & Sections" },
      impact: { score: impactScore, max: 20, label: "Quantified Impact" },
      actionVerbs: { score: actionVerbsScore, max: 20, label: "Action Verbs" },
      skillsAndKeywords: { score: skillsScore, max: 20, label: "Skills & Keywords" },
    },
    suggestions,
    metrics: {
      wordCount: totalWordCount,
      bulletCount: totalBullets,
      quantifiedBulletCount: quantifiedBullets,
      strongVerbsCount,
      skillsCount,
    },
    matchedKeywords,
    missingKeywords,
  };
}
