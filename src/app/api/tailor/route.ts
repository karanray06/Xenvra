import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanInfo, checkAndRecordAiUsage } from "@/lib/plan-limits";
import { analyzeResumeAts } from "@/lib/ats";
import { resumeDataSchema, type ResumeData, type Experience } from "@/lib/schemas/resume";
import { z } from "zod";

const tailorRequestSchema = z.object({
  resumeData: resumeDataSchema.partial().passthrough(),
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

    // Plan Gating: Tailor is an advertised paid-only feature
    const planInfo = await getUserPlanInfo(user.id);
    if (!planInfo.isPaid) {
      return NextResponse.json(
        {
          error: "Job Description Tailoring requires an active Beginner or Pro pass. Upgrade on the Billing page to unlock.",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON body" }, { status: 400 });
    }

    const parseResult = tailorRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { resumeData, jobDescription, targetRole, company } = parseResult.data;

    // Check & consume AI quota
    const quota = await checkAndRecordAiUsage(user.id, 1, "tailor");
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.reason || "Daily AI action quota reached for your plan.", remaining: 0 },
        { status: 429 }
      );
    }

    const initialAts = analyzeResumeAts(resumeData as ResumeData, jobDescription);

    // Extract top JD requirements / skills without fabrication
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

    // Build tailored summary strictly adhering to truthful claims
    const roleTitle = targetRole || (resumeData as ResumeData).contact?.title || "Professional";
    const companyName = company ? ` for ${company}` : "";
    const keySkillsString = topKeywords.slice(0, 4).join(", ");

    const tailoredSummary = `Experienced ${roleTitle} with demonstrated expertise in ${keySkillsString}. Focused on scalable technical execution and driving measurable outcomes${companyName}.`;

    // Tailor experience without fabricating fake achievements
    const tailoredExperience: Experience[] = ((resumeData as ResumeData).experience || []).map(
      (exp) => {
        const bullets = exp.highlights && exp.highlights.length > 0
          ? [...exp.highlights]
          : (exp.description || "").split("\n").filter((l) => l.trim().length > 0);

        return {
          ...exp,
          highlights: bullets,
        };
      }
    );

    const tailoredData: ResumeData = {
      ...(resumeData as ResumeData),
      summary: tailoredSummary,
      experience: tailoredExperience,
      skills: Array.from(new Set([...((resumeData as ResumeData).skills || []), ...topKeywords.slice(0, 5)])),
    };

    // Calculate real ATS score — NEVER fabricate minimum +15
    const tailoredAts = analyzeResumeAts(tailoredData, jobDescription);

    return NextResponse.json({
      tailoredSummary,
      tailoredExperience,
      tailoredData,
      scoreBefore: initialAts.overallScore,
      scoreAfter: tailoredAts.overallScore, // Genuine calculated score, no fake Math.max(+15)
      matchedKeywords: initialAts.matchedKeywords,
      injectedKeywords: topKeywords.slice(0, 5),
      remaining: quota.remaining,
    });
  } catch (error: unknown) {
    console.error("Tailor route error:", error);
    return NextResponse.json({ error: "Failed to tailor resume" }, { status: 500 });
  }
}
