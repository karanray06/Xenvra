import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/billing/billing-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing & Plans — Xenvra",
  description: "Manage your subscription, plans, and receipts.",
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Fetch available plans
  const { data: plansData } = await supabase
    .from("plans")
    .select("*")
    .order("price_inr", { ascending: true });

  // 2. Fetch user's current entitlement
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Fetch user's payment history
  const { data: payments } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <BillingClient
      plans={plansData || []}
      entitlement={entitlement || null}
      payments={payments || []}
      userEmail={user.email || ""}
      userName={user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
    />
  );
}
