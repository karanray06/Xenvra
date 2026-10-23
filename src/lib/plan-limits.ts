import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export interface UserPlanInfo {
  planId: "free" | "beginner" | "pro";
  planName: string;
  isPaid: boolean;
  maxResumes: number;
  maxAiDaily: number;
  canExportDocx: boolean;
  canExportNoWatermark: boolean;
  canUseProTemplates: boolean;
}

export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo> {
  const admin = createAdminClient();

  const { data: entitlement } = await admin
    .from("entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  const now = new Date();
  const isActive =
    entitlement?.status === "active" &&
    (!entitlement.current_period_end || new Date(entitlement.current_period_end) > now);

  const planId = (isActive && entitlement?.plan ? entitlement.plan : "free") as
    | "free"
    | "beginner"
    | "pro";

  const { data: planRecord } = await admin
    .from("plans")
    .select("name, max_resumes, max_ai_actions_daily")
    .eq("id", planId)
    .maybeSingle();

  const maxResumes = planRecord?.max_resumes ?? (planId === "pro" ? 999 : planId === "beginner" ? 3 : 1);
  const maxAiDaily = planRecord?.max_ai_actions_daily ?? (planId === "pro" ? 999 : planId === "beginner" ? 30 : 5);

  return {
    planId,
    planName: planRecord?.name || (planId === "pro" ? "Pro" : planId === "beginner" ? "Beginner" : "Free"),
    isPaid: planId === "beginner" || planId === "pro",
    maxResumes,
    maxAiDaily,
    canExportDocx: planId === "pro",
    canExportNoWatermark: planId === "beginner" || planId === "pro",
    canUseProTemplates: planId === "beginner" || planId === "pro",
  };
}

export async function checkAndRecordAiUsage(
  userId: string,
  tokens = 100
): Promise<{ allowed: boolean; remaining: number }> {
  const planInfo = await getUserPlanInfo(userId);
  const admin = createAdminClient();

  // Count usage events since start of today (UTC)
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const { count } = await admin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", "ai_improve")
    .gte("created_at", startOfToday.toISOString());

  const usedToday = count || 0;

  if (usedToday >= planInfo.maxAiDaily) {
    return { allowed: false, remaining: 0 };
  }

  // Record usage event
  await admin.from("usage_events").insert({
    user_id: userId,
    action: "ai_improve",
    tokens,
  });

  return {
    allowed: true,
    remaining: Math.max(0, planInfo.maxAiDaily - usedToday - 1),
  };
}
