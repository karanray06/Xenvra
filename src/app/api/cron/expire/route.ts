import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();

    // Mark past-due active entitlements as expired
    const { data, error } = await admin
      .from("entitlements")
      .update({
        status: "expired",
        updated_at: nowIso,
      })
      .eq("status", "active")
      .neq("plan", "free")
      .lt("current_period_end", nowIso)
      .select("id, user_id, plan");

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      expiredCount: data?.length || 0,
      timestamp: nowIso,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Cron execution failed";
    console.error("Cron expiry error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
