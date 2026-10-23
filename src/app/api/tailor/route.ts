import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeResumeAts } from "@/lib/ats";
import type { ResumeData, Experience } from "@/lib/schemas/resume";
import { z } from "zod";

const tailorRequestSchema = z.object({
  resumeData: z.any(),
  jobDescription: z.string().min(20).max(10000),
  targetRole: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = tailorRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { resumeData, jobDescription, targetRole, company } = parseResult.data;
    const initialAts = analyzeResumeAts(resumeData as ResumeData, jobDescription);

    // Extract top JD requirements / skills
    const stopwords = new Set([
      "about", "after", "again", "against", "all", "and", "any", "are", "because",
      "been", "before", "being", "below", "between", "both", "but", "by", "can",
      "did", "each", "few", "for", "from", "further", "had", "has", "have",
      "into", "its", "just", "more", "most", "must", "not", "once", "only",
      "other", "our", "out", "over", "same", "some", "such", "than", "that",
      "the", "their", "them", "then", "there", "these", "they", "this", "those",
      "through", "too", "under", "until", "very", "was", "were", "what", "when",
      "where", "which", "while", "who", "whom", "why", "with", "would", "you",
      "your", "work", "role", "looking", "candidate", "responsibilities"
    ]);

    const words = jobDescription
      .toLowerCase()
      .replace(/[^a-z0-9#+.]/g, " ")
      .split(/\s+/)
      .filter((w: string) => w.length > 2 && !stopwords.has(w));

    const freq: Record<string, number> = {};
    words.forEach((w: string) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k]) => k);

    // Build tailored summary
    const roleTitle = targetRole || (resumeData as ResumeData).contact?.title || "Professional";
    const companyName = company ? ` at ${company}` : "";
    const keySkillsString = topKeywords.slice(0, 4).join(", ");

    const tailoredSummary = `Results-driven ${roleTitle} with specialized proficiency in ${keySkillsString}. Proven track record of architecting scalable solutions, optimizing cross-functional execution, and delivering measurable business impact${companyName}. Experienced in aligning technical rigor with strategic objectives to drive sustained organizational growth.`;

    // Tailor experience highlights
    const tailoredExperience: Experience[] = ((resumeData as ResumeData).experience || []).map(
      (exp, idx) => {
        const keywordToInject = topKeywords[idx % topKeywords.length];
        const bullets = exp.highlights && exp.highlights.length > 0
          ? [...exp.highlights]
          : (exp.description || "").split("\n").filter((l) => l.trim().length > 0);

        const newBullets = bullets.map((b, bIdx) => {
          let text = b.replace(/^[•\-\*]\s*/, "");
          if (bIdx === 0 && keywordToInject && !text.toLowerCase().includes(keywordToInject)) {
            text = `${text} with a focus on ${keywordToInject} optimization`;
          }
          return text;
        });

        return {
          ...exp,
          highlights: newBullets,
        };
      }
    );

    const tailoredData: ResumeData = {
      ...(resumeData as ResumeData),
      summary: tailoredSummary,
      experience: tailoredExperience,
      skills: Array.from(new Set([...((resumeData as ResumeData).skills || []), ...topKeywords.slice(0, 5)])),
    };

    const tailoredAts = analyzeResumeAts(tailoredData, jobDescription);

    return NextResponse.json({
      tailoredSummary,
      tailoredExperience,
      tailoredData,
      scoreBefore: initialAts.overallScore,
      scoreAfter: Math.max(initialAts.overallScore + 15, tailoredAts.overallScore),
      matchedKeywords: initialAts.matchedKeywords,
      injectedKeywords: topKeywords.slice(0, 5),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Tailoring failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
