import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  // FAIL CLOSED: If CRON_SECRET is not configured, reject all requests
  if (!cronSecret) {
    console.error("[Security] Cron execution rejected: CRON_SECRET is not configured");
    return NextResponse.json({ error: "Cron service unavailable" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
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
      console.error("Cron expiry database error:", error);
      return NextResponse.json({ error: "Failed to expire entitlements" }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      expiredCount: data?.length || 0,
      timestamp: nowIso,
    });
  } catch (err: unknown) {
    console.error("Cron expiry unhandled error:", err);
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
