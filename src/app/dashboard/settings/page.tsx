import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, CreditCard } from "lucide-react";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { PublicProfileCard } from "@/components/settings/public-profile-card";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: publicProfile } = await supabase
    .from("public_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  let viewsCount = 0;
  if (publicProfile) {
    const { count } = await supabase
      .from("profile_views")
      .select("id", { count: "exact", head: true })
      .eq("public_profile_id", publicProfile.id);
    viewsCount = count || 0;
  }

  const { data: userResumes } = await supabase
    .from("resumes")
    .select("id, title")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const planName =
    entitlement?.status === "active"
      ? entitlement.plan === "pro"
        ? "Pro Plan"
        : entitlement.plan === "beginner"
        ? "Beginner Plan"
        : "Free Plan"
      : "Free Plan";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Settings</h1>

      <div className="space-y-6">
        {/* Public Profile & Analytics Section */}
        <PublicProfileCard
          initialProfile={publicProfile}
          viewsCount={viewsCount}
          resumes={userResumes || []}
        />

        {/* Profile Section */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <User className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">
              Profile
            </h2>
          </div>
          <div className="grid gap-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Full Name
              </label>
              <input
                type="text"
                defaultValue={profile?.full_name || ""}
                disabled
                className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Email
              </label>
              <input
                type="email"
                defaultValue={user.email || ""}
                disabled
                className="w-full rounded-lg border border-border bg-surface-secondary px-4 py-2.5 text-sm text-text-tertiary"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Managed by your login provider
              </p>
            </div>
          </div>
        </section>

        {/* Plan Section */}
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-text-primary">Plan</h2>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-tertiary px-5 py-4">
            <div>
              <p className="font-semibold text-text-primary">{planName}</p>
              <p className="text-sm text-text-secondary">
                {planName === "Free Plan"
                  ? "1 resume, 3 templates, basic features"
                  : "Active subscription with pro templates and exports"}
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-accent capitalize">
              {entitlement?.status || "Active"}
            </span>
          </div>
          {entitlement?.current_period_end && (
            <p className="mt-3 text-xs text-text-tertiary">
              Renewal / Expiry:{" "}
              {new Date(entitlement.current_period_end).toLocaleDateString()}
            </p>
          )}
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-danger/20 bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-danger">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            Deleting your account will permanently remove all your resumes, saved data, and authentication profile.
            This action cannot be undone.
          </p>
          <DeleteAccountButton />
        </section>
      </div>
    </div>
  );
}
