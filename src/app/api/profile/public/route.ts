import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  slug: z.string().min(3).max(60).regex(/^[a-zA-Z0-9_-]+$/, "Slug can only contain letters, numbers, hyphens, and underscores"),
  resume_id: z.string().uuid().nullable().optional(),
  visibility: z.enum(["public", "private"]).default("public"),
});

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("public_profiles")
      .select("*, resumes(title)")
      .eq("user_id", user.id)
      .maybeSingle();

    let viewsCount = 0;
    if (profile) {
      const { count } = await supabase
        .from("profile_views")
        .select("id", { count: "exact", head: true })
        .eq("public_profile_id", profile.id);
      viewsCount = count || 0;
    }

    return NextResponse.json({
      profile,
      viewsCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch profile error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

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
    const parseResult = updateProfileSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid profile payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { slug, resume_id, visibility } = parseResult.data;

    const { data: existing } = await supabase
      .from("public_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error } = await supabase
        .from("public_profiles")
        .update({
          slug: slug.toLowerCase(),
          resume_id: resume_id || null,
          visibility,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(updated);
    } else {
      const { data: inserted, error } = await supabase
        .from("public_profiles")
        .insert({
          user_id: user.id,
          slug: slug.toLowerCase(),
          resume_id: resume_id || null,
          visibility,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json(inserted);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Save profile error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
