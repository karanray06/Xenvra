import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseJson, verifyMutationOrigin } from "@/lib/api-utils";
import { z } from "zod";

const createApplicationSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  jd_text: z.string().max(20000).optional().default(""),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]).default("saved"),
  notes: z.string().max(5000).optional().default(""),
  resume_id: z.string().uuid().nullable().optional(),
  applied_at: z.string().nullable().optional(),
});

const updateApplicationSchema = z.object({
  id: z.string().uuid(),
  company: z.string().min(1).max(200).optional(),
  role: z.string().min(1).max(200).optional(),
  jd_text: z.string().max(20000).optional(),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]).optional(),
  notes: z.string().max(5000).optional(),
  resume_id: z.string().uuid().nullable().optional(),
  applied_at: z.string().nullable().optional(),
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

    const { data: apps, error } = await supabase
      .from("job_applications")
      .select("*, resumes(title)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Fetch applications query error:", error);
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }

    return NextResponse.json(apps || []);
  } catch (error: unknown) {
    console.error("Fetch applications unhandled error:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!verifyMutationOrigin(req)) {
    return NextResponse.json({ error: "Cross-site requests prohibited" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, errorResponse } = await parseJson(req, createApplicationSchema);
    if (errorResponse) return errorResponse;
    if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const { company, role, jd_text, status, notes, resume_id, applied_at } = data;

    const { data: newApp, error } = await supabase
      .from("job_applications")
      .insert({
        user_id: user.id,
        company,
        role,
        jd_text: jd_text || "",
        status,
        notes: notes || "",
        resume_id: resume_id || null,
        applied_at: applied_at || (status === "applied" ? new Date().toISOString() : null),
      })
      .select()
      .single();

    if (error) {
      console.error("Insert application query error:", error);
      return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
    }

    return NextResponse.json(newApp, { status: 201 });
  } catch (error: unknown) {
    console.error("Create application unhandled error:", error);
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyMutationOrigin(req)) {
    return NextResponse.json({ error: "Cross-site requests prohibited" }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, errorResponse } = await parseJson(req, updateApplicationSchema);
    if (errorResponse) return errorResponse;
    if (!data) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

    const { id, status, notes, company, role, jd_text, resume_id, applied_at } = data;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (company !== undefined) updates.company = company;
    if (role !== undefined) updates.role = role;
    if (jd_text !== undefined) updates.jd_text = jd_text;
    if (resume_id !== undefined) updates.resume_id = resume_id;
    if (applied_at !== undefined) updates.applied_at = applied_at;

    const { data: updatedApp, error } = await supabase
      .from("job_applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Update application database error:", error);
      return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
    }

    return NextResponse.json(updatedApp);
  } catch (error: unknown) {
    console.error("Update application unhandled error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!verifyMutationOrigin(req)) {
    return NextResponse.json({ error: "Cross-site requests prohibited" }, { status: 403 });
  }

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
      return NextResponse.json({ error: "Missing application id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete application database error:", error);
      return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Delete application unhandled error:", error);
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 });
  }
}
