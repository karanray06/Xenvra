import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { studioDocumentSchema, STUDIO_KINDS } from "@/lib/schemas/studio";
import { getUserPlanInfo } from "@/lib/plan-limits";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const createDesignRequestSchema = z.object({
  title: z.string().min(1).max(120),
  kind: z.enum(STUDIO_KINDS),
  doc: studioDocumentSchema,
  resumeId: z.string().uuid().optional(),
});

// GET /api/studio/designs - List user designs
export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: designs, error } = await supabase
    .from("designs")
    .select("id, kind, title, schema_version, resume_id, thumb_path, version, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch designs" }, { status: 500 });
  }

  return NextResponse.json({ designs });
}

// POST /api/studio/designs - Create a new design with plan limits
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const rate = await checkRateLimit(user.id, "upload");
  if (!rate.success) {
    const retryAfter = Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many requests. Please wait." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createDesignRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid design document payload", details: parsed.error.format() },
      { status: 400 }
    );
  }

  // Check plan limits for design count
  const planInfo = await getUserPlanInfo(user.id);
  const { count } = await supabase
    .from("designs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const maxAllowed = planInfo.planId === "free" ? 10 : 200;
  if ((count || 0) >= maxAllowed) {
    return NextResponse.json(
      {
        error: `Design limit reached (${maxAllowed} designs for ${planInfo.planName} plan). Please upgrade to Pro for unlimited designs.`,
      },
      { status: 403 }
    );
  }

  const { data: design, error } = await supabase
    .from("designs")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      kind: parsed.data.kind,
      doc: parsed.data.doc,
      resume_id: parsed.data.resumeId || null,
      version: 1,
    })
    .select("id, kind, title, version, created_at, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save design" }, { status: 500 });
  }

  return NextResponse.json({ design }, { status: 201 });
}
