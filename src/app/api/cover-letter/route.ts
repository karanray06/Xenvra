import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const body = await req.json();
    const parseResult = coverLetterRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { company, role, hiringManager, jobDescription, resumeId, tone, save } =
      parseResult.data;

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

    const topSkills = (resumeData?.skills || []).slice(0, 4).join(", ");
    const topExp = resumeData?.experience?.[0];
    const pastCompany = topExp?.company || "industry leaders";
    const pastTitle = topExp?.jobTitle || "professional";

    // Format current date
    const today = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const greeting = hiringManager?.trim()
      ? `Dear ${hiringManager},`
      : `Dear Hiring Team at ${company},`;

    const toneIntro =
      tone === "strategic"
        ? `As a forward-thinking strategist, I am writing to present my candidacy for the ${role} position at ${company}.`
        : tone === "enthusiastic"
        ? `I am thrilled to submit my application for the ${role} position at ${company}.`
        : `I am writing to express my enthusiastic interest in the ${role} position at ${company}.`;

    const jdAlignment = jobDescription && jobDescription.trim().length > 20
      ? `Having closely reviewed your team's requirements, I am particularly equipped to hit the ground running and solve the challenges central to the ${role} mission.`
      : `What excites me most about ${company} is your commitment to excellence and high-standard execution. The requirements outlined for the ${role} align directly with my hands-on experience.`;

    const generatedContent = `${candidateName}
${[candidateEmail, candidatePhone, candidateLocation].filter(Boolean).join("  •  ")}

${today}

Hiring Committee
${company}

${greeting}

${toneIntro} With a proven track record as a ${pastTitle} at ${pastCompany} and deep expertise in ${topSkills || "scalable solutions and cross-functional leadership"}, I am eager to contribute directly to ${company}'s ongoing innovation and strategic growth.

Throughout my career, I have focused on translating ambitious goals into high-impact execution. Most recently, I spearheaded high-velocity initiatives that optimized workflow velocity and delivered measurable improvements in operational efficiency. My background equips me to quickly identify opportunities, eliminate friction, and drive predictable results in fast-paced environments.

${jdAlignment}

Thank you for your time and consideration. I welcome the opportunity to discuss how my background and dedication can support ${company}'s goals.

Sincerely,

${candidateName}`;

    let savedId: string | null = null;
    if (save) {
      const { data: savedLetter, error: insertError } = await supabase
        .from("cover_letters")
        .insert({
          user_id: user.id,
          resume_id: resumeId || null,
          title: `Cover Letter — ${company} (${role})`,
          company,
          role,
          content: generatedContent,
        })
        .select("id")
        .single();

      if (!insertError && savedLetter) {
        savedId = savedLetter.id;
      }
    }

    return NextResponse.json({
      content: generatedContent,
      savedId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Cover letter error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: letters, error } = await supabase
      .from("cover_letters")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(letters || []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("cover_letters")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
