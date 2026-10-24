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

/**
 * Checks and atomically records AI usage quota.
 */
export async function checkAndRecordAiUsage(
  userId: string,
  tokens = 1,
  action = "ai_improve"
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  const admin = createAdminClient();

  // Call the atomic consume_ai_credit RPC function if available
  try {
    const { data: rpcResult, error: rpcErr } = await admin.rpc("consume_ai_credit", {
      p_user_id: userId,
      p_action: action,
    });

    if (!rpcErr && rpcResult) {
      const allowed = Boolean(rpcResult.allowed);
      const limit = Number(rpcResult.limit || 5);
      const used = Number(rpcResult.used || 0);
      return {
        allowed,
        remaining: Math.max(0, limit - used),
        reason: rpcResult.reason,
      };
    }
  } catch (err) {
    console.warn("consume_ai_credit RPC fallback to direct query:", err);
  }

  // Fallback direct check
  const planInfo = await getUserPlanInfo(userId);
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const { count } = await admin
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("action", action)
    .gte("created_at", startOfToday.toISOString());

  const usedToday = count || 0;

  if (usedToday >= planInfo.maxAiDaily) {
    return {
      allowed: false,
      remaining: 0,
      reason: `Daily AI limit reached (${usedToday}/${planInfo.maxAiDaily}). Upgrade on the Billing page to increase limits.`,
    };
  }

  await admin.from("usage_events").insert({
    user_id: userId,
    action,
    tokens,
  });

  return {
    allowed: true,
    remaining: Math.max(0, planInfo.maxAiDaily - usedToday - 1),
  };
}

/**
 * Refunds an AI credit if the external LLM provider call fails.
 */
export async function refundAiUsage(userId: string, action = "ai_improve"): Promise<void> {
  const admin = createAdminClient();
  try {
    await admin.rpc("refund_ai_credit", {
      p_user_id: userId,
      p_action: action,
    });
  } catch {
    // Direct delete of latest usage event within 5 mins
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: latest } = await admin
      .from("usage_events")
      .select("id")
      .eq("user_id", userId)
      .eq("action", action)
      .gte("created_at", fiveMinAgo)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latest?.id) {
      await admin.from("usage_events").delete().eq("id", latest.id);
    }
  }
}
