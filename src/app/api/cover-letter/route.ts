import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanInfo, checkAndRecordAiUsage, refundAiUsage } from "@/lib/plan-limits";
import { generateAiCompletion } from "@/lib/ai";
import type { ResumeData, Contact } from "@/lib/schemas/resume";
import { z } from "zod";

const coverLetterRequestSchema = z.object({
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  hiringManager: z.string().max(200).optional(),
  jobDescription: z.string().max(10000).optional(),
  resumeId: z.string().uuid().optional(),
  tone: z.enum(["confident", "strategic", "enthusiastic"]).default("confident"),
  save: z.boolean().default(false),
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

    // Plan Gating: Cover letter generator is a paid-tier feature
    const planInfo = await getUserPlanInfo(user.id);
    if (!planInfo.isPaid) {
      return NextResponse.json(
        {
          error: "AI Cover Letter Generator requires an active Beginner or Pro pass. Upgrade on the Billing page to unlock.",
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

    const parseResult = coverLetterRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { company, role, hiringManager, jobDescription, resumeId, tone, save } =
      parseResult.data;

    // Check & consume AI quota
    const quota = await checkAndRecordAiUsage(user.id, 1, "cover_letter");
    if (!quota.allowed) {
      return NextResponse.json(
        { error: quota.reason || "Daily AI limit reached for your plan.", remaining: 0 },
        { status: 429 }
      );
    }

    // Fetch user profile & resume data
    let resumeData: ResumeData | null = null;
    if (resumeId) {
      const { data: res } = await supabase
        .from("resumes")
        .select("data")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (res?.data) resumeData = res.data as ResumeData;
    }

    const contact: Partial<Contact> = resumeData?.contact || {};
    const candidateName = contact.fullName || "Candidate";
    const candidateEmail = contact.email || "";
    const candidatePhone = contact.phone || "";
    const candidateLocation = contact.location || "";

    const topSkills = (resumeData?.skills || []).slice(0, 6).join(", ");
    const topExp = resumeData?.experience?.[0];
    const pastCompany = topExp?.company || "";
    const pastTitle = topExp?.jobTitle || "";

    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const greeting = hiringManager?.trim()
      ? `Dear ${hiringManager},`
      : `Dear Hiring Team at ${company},`;

    const systemPrompt = `You are an executive career advisor writing a tailored, persuasive cover letter.
CRITICAL RULES:
1. NEVER fabricate metrics, projects, achievements, or credentials not present in the candidate's background.
2. Maintain professional tone: ${tone}.
3. Return ONLY the letter body (date, greeting, 3-4 concise paragraphs, and sign-off). Do not include markdown code fences or conversational notes.`;

    const userPrompt = `Candidate: ${candidateName}
Contact: ${[candidateEmail, candidatePhone, candidateLocation].filter(Boolean).join(" • ")}
Target Role: ${role} at ${company}
Greeting: ${greeting}
Date: ${today}
Past Role: ${pastTitle}${pastCompany ? ` at ${pastCompany}` : ""}
Verified Skills: ${topSkills || "Not specified"}
Job Context: ${jobDescription || "Standard responsibilities for " + role}`;

    let letterContent = "";
    try {
      const aiLetter = await generateAiCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ], { maxTokens: 800 });

      if (!aiLetter || aiLetter.trim().length === 0) {
        throw new Error("AI provider returned empty response");
      }
      letterContent = aiLetter.trim();
    } catch (aiErr) {
      await refundAiUsage(user.id, "cover_letter");
      console.error("AI cover letter generation failed:", aiErr);
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Your credit has been refunded. Please try again." },
        { status: 503 }
      );
    }

    // Optional save to cover_letters table
    let savedId: string | null = null;
    if (save) {
      const { data: savedRecord } = await supabase
        .from("cover_letters")
        .insert({
          user_id: user.id,
          company,
          role,
          content: letterContent,
          tone,
        })
        .select("id")
        .maybeSingle();

      savedId = savedRecord?.id || null;
    }

    return NextResponse.json({
      content: letterContent,
      id: savedId,
      remaining: quota.remaining,
    });
  } catch (error: unknown) {
    console.error("Cover letter route error:", error);
    return NextResponse.json({ error: "Failed to generate cover letter" }, { status: 500 });
  }
}
