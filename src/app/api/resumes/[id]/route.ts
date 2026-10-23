import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resumeDataSchema } from "@/lib/schemas/resume";
import { getTemplateById } from "@/components/templates/registry";
import { z } from "zod";

const updateResumeSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  template_id: z.string().max(50).optional(),
  data: resumeDataSchema.optional(),
  version: z.number().int().optional(),
});

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return handleSave(request, props);
}

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return handleSave(request, props);
}

async function handleSave(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
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
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parseResult = updateResumeSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parseResult.error.format() },
      { status: 400 }
    );
  }

  const { title, template_id, data, version } = parseResult.data;

  // Server-side plan check: non-free templates require active paid entitlement
  if (template_id) {
    const tInfo = getTemplateById(template_id);
    if (tInfo && !tInfo.free) {
      const { data: ent } = await supabase
        .from("entitlements")
        .select("plan, status, current_period_end")
        .eq("user_id", user.id)
        .maybeSingle();

      const isPaidPlan =
        ent?.status === "active" &&
        (ent.plan === "beginner" || ent.plan === "pro") &&
        (!ent.current_period_end || new Date(ent.current_period_end) > new Date());

      if (!isPaidPlan) {
        return NextResponse.json(
          { error: `The ${tInfo.name} template requires an active paid plan.` },
          { status: 403 }
        );
      }
    }
  }

  // Check existing resume & optimistic versioning
  const { data: currentResume, error: fetchErr } = await supabase
    .from("resumes")
    .select("id, version, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchErr || !currentResume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const currentVersion = currentResume.version ?? 1;
  if (version !== undefined && version < currentVersion) {
    return NextResponse.json(
      { error: "Conflict: newer version exists", currentVersion },
      { status: 409 }
    );
  }

  const newVersion = currentVersion + 1;
  const updates: Record<string, unknown> = {
    version: newVersion,
    updated_at: new Date().toISOString(),
  };

  if (title !== undefined) updates.title = title;
  if (template_id !== undefined) updates.template_id = template_id;
  if (data !== undefined) updates.data = data;

  const { error: updateErr } = await supabase
    .from("resumes")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, version: newVersion });
}
