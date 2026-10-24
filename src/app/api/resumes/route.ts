import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resumeDataSchema } from "@/lib/schemas/resume";
import { getTemplateById } from "@/components/templates/registry";
import { getUserPlanInfo } from "@/lib/plan-limits";
import { z } from "zod";

const createResumeSchema = z.object({
  title: z.string().min(1).max(200).default("Untitled Resume"),
  template_id: z.string().max(50).default("modern-1"),
  data: resumeDataSchema.optional(),
  design_json: z.unknown().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = createResumeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { title, template_id, data, design_json } = parseResult.data;

    // Enforce size limit (< 2MB)
    const jsonStr = JSON.stringify({ data, design_json });
    if (Buffer.byteLength(jsonStr, "utf8") > 2_000_000) {
      return NextResponse.json({ error: "Document payload exceeds 2 MB size limit" }, { status: 413 });
    }

    // Plan check: verify resume count limit
    const planInfo = await getUserPlanInfo(user.id);
    const { count, error: countErr } = await supabase
      .from("resumes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (countErr) {
      console.error("Resume count query error:", countErr);
    }

    const currentCount = count || 0;
    if (currentCount >= planInfo.maxResumes) {
      return NextResponse.json(
        {
          error: `Resume limit reached (${currentCount}/${planInfo.maxResumes}) for your ${planInfo.planName} plan. Upgrade on Billing page to create more.`,
          maxResumes: planInfo.maxResumes,
        },
        { status: 403 }
      );
    }

    // Plan check: verify template tier
    if (template_id) {
      const template = getTemplateById(template_id);
      if (template && !template.free && !planInfo.canUseProTemplates) {
        return NextResponse.json(
          { error: `The ${template.name} template requires an active Beginner or Pro pass.` },
          { status: 403 }
        );
      }
    }

    // Insert resume via server
    const { data: newResume, error: insertError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        template_id,
        data: data || {},
        design_json: design_json || null,
        version: 1,
      })
      .select("id, title, template_id, version, created_at, updated_at")
      .single();

    if (insertError || !newResume) {
      console.error("Server resume creation error:", insertError);
      return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
    }

    return NextResponse.json(newResume, { status: 201 });
  } catch (err: unknown) {
    console.error("Unhandled error creating resume:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
