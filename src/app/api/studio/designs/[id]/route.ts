import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { studioDocumentSchema } from "@/lib/schemas/studio";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const updateDesignRequestSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  doc: studioDocumentSchema.optional(),
  thumbPath: z.string().optional(),
  version: z.number().int().min(1),
});

// GET /api/studio/designs/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: design, error } = await supabase
    .from("designs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !design) {
    return NextResponse.json({ error: "Design not found" }, { status: 404 });
  }

  // Authorization check (own design or public template)
  if (design.user_id !== user.id && !design.is_template) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ design });
}

// PUT /api/studio/designs/[id] - Atomic update with optimistic concurrency
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await checkRateLimit(user.id, "upload");
  if (!rate.success) {
    const retryAfter = Math.max(1, Math.ceil((rate.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Too many updates. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateDesignRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid update payload", details: parsed.error.format() },
      { status: 400 }
    );
  }

  const { title, doc, thumbPath, version } = parsed.data;

  // Optimistic concurrency atomic update
  const { data: updated, error } = await supabase
    .from("designs")
    .update({
      ...(title ? { title } : {}),
      ...(doc ? { doc } : {}),
      ...(thumbPath ? { thumb_path: thumbPath } : {}),
      version: version + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("version", version)
    .select("id, title, version, updated_at")
    .single();

  if (error) {
    // If no row updated, it was a concurrent conflict
    return NextResponse.json(
      { error: "Conflict: This document was modified elsewhere. Please refresh." },
      { status: 409 }
    );
  }

  return NextResponse.json({ design: updated });
}

// DELETE /api/studio/designs/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("designs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to delete design" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
