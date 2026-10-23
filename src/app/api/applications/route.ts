import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const applicationSchema = z.object({
  id: z.string().uuid().optional(),
  company: z.string().min(1).max(200),
  role: z.string().min(1).max(200),
  jd_text: z.string().optional().default(""),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]).default("saved"),
  notes: z.string().optional().default(""),
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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(apps || []);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Fetch applications error";
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
    const parseResult = applicationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { company, role, jd_text, status, notes, resume_id, applied_at } =
      parseResult.data;

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
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(newApp);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Create application error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, notes, company, role, applied_at } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (company !== undefined) updates.company = company;
    if (role !== undefined) updates.role = role;
    if (applied_at !== undefined) updates.applied_at = applied_at;

    const { data: updatedApp, error } = await supabase
      .from("job_applications")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(updatedApp);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Update application error";
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
      .from("job_applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Delete application error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
