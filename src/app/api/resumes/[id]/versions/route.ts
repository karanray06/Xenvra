import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ResumeData } from "@/lib/schemas/resume";

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

    const { data: versions, error } = await supabase
      .from("resume_versions")
      .select("id, version_number, created_at, data")
      .eq("resume_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
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
    const message = error instanceof Error ? error.message : "Fetch versions error";
    return NextResponse.json({ error: message }, { status: 500 });
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

    const body = await req.json();
    const { data, version_number } = body;

    const { error } = await supabase.from("resume_versions").insert({
      resume_id: id,
      user_id: user.id,
      data,
      version_number: version_number || 1,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create version error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
