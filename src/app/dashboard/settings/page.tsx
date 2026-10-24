import { createClient, getUserContext } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/settings/settings-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings — Xenvra",
  description: "Account settings, plans, billing, and portfolio settings.",
};

export default async function SettingsPage() {
  const context = await getUserContext();
  if (!context?.user) redirect("/login");

  const { user, profile, entitlement } = context;
  const supabase = await createClient();

  // Run independent queries with Promise.all (Phase B performance optimization)
  const [publicProfileRes, userResumesRes, plansRes, paymentsRes] = await Promise.all([
    supabase.from("public_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("resumes").select("id, title").eq("user_id", user.id).order("updated_at", { ascending: false }),
    supabase.from("plans").select("*").order("price_inr", { ascending: true }),
    supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const publicProfile = publicProfileRes.data;
  let viewsCount = 0;
  if (publicProfile) {
    const { count } = await supabase
      .from("profile_views")
      .select("id", { count: "exact", head: true })
      .eq("public_profile_id", publicProfile.id);
    viewsCount = count || 0;
  }

  return (
    <SettingsView
      user={{
        id: user.id,
        email: user.email || "",
        fullName: profile?.full_name || user.user_metadata?.full_name || "User",
      }}
      profile={profile}
      publicProfile={publicProfile}
      viewsCount={viewsCount}
      resumes={userResumesRes.data || []}
      plans={plansRes.data || []}
      entitlement={entitlement || null}
      payments={paymentsRes.data || []}
    />
  );
}
