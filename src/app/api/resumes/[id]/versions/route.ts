import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resumeDataSchema, type ResumeData } from "@/lib/schemas/resume";
import { z } from "zod";

const createVersionSchema = z.object({
  data: resumeDataSchema,
  version_number: z.number().int().positive().optional(),
  is_manual_snapshot: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership of resume
    const { data: resume, error: resumeErr } = await supabase
      .from("resumes")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (resumeErr || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const { data: versions, error } = await supabase
      .from("resume_versions")
      .select("id, version_number, created_at, data")
      .eq("resume_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
    }

    const formatted = (versions || []).map((v) => {
      const data = v.data as ResumeData;
      const wordCount = (data.summary || "").split(/\s+/).filter(Boolean).length;
      return {
        id: v.id,
        version_number: v.version_number,
        created_at: v.created_at,
        data,
        summary: data.summary?.slice(0, 80) || "No summary",
        wordCount,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: unknown) {
    console.error("Fetch versions error:", error);
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // MANDATORY SECURITY: Verify caller owns this resume
    const { data: resume, error: resumeErr } = await supabase
      .from("resumes")
      .select("id, version")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (resumeErr || !resume) {
      return NextResponse.json({ error: "Resume not found or unauthorized" }, { status: 404 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    const parseResult = createVersionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid version data schema", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { data, version_number, is_manual_snapshot } = parseResult.data;

    // Debounce snapshots: If not manual, snapshot at most once every 5 minutes
    if (!is_manual_snapshot) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentVersion } = await supabase
        .from("resume_versions")
        .select("id")
        .eq("resume_id", id)
        .eq("user_id", user.id)
        .gte("created_at", fiveMinAgo)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentVersion) {
        // Debounced: skip storing duplicate autosave snapshot within 5-min window
        return NextResponse.json({ success: true, debounced: true });
      }
    }

    // Insert new version
    const { error: insertErr } = await supabase.from("resume_versions").insert({
      resume_id: id,
      user_id: user.id,
      data,
      version_number: version_number || resume.version || 1,
    });

    if (insertErr) {
      console.error("Failed to insert resume version:", insertErr);
      return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
    }

    // Pruning: Keep only the most recent 30 versions per document (storage DoS prevention)
    const { data: oldVersions } = await supabase
      .from("resume_versions")
      .select("id")
      .eq("resume_id", id)
      .order("created_at", { ascending: false })
      .range(30, 100);

    if (oldVersions && oldVersions.length > 0) {
      const oldIds = oldVersions.map((v) => v.id);
      await supabase.from("resume_versions").delete().in("id", oldIds);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: unknown) {
    console.error("Create version error:", error);
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }
}
