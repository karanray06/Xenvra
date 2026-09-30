import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Settings, User, CreditCard } from "lucide-react";

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
    .single();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-text-primary">Settings</h1>

      <div className="space-y-6">
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
              <p className="font-semibold text-text-primary">Free Plan</p>
              <p className="text-sm text-text-secondary">
                1 resume, 3 templates, basic features
              </p>
            </div>
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-accent">
              Current
            </span>
          </div>
          <p className="mt-4 text-sm text-text-tertiary">
            Upgrade options with Razorpay payments coming in Phase 4.
          </p>
        </section>

        {/* Danger Zone */}
        <section className="rounded-xl border border-danger/20 bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold text-danger">
            Danger Zone
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            Deleting your account will permanently remove all your resumes and
            data. This action cannot be undone.
          </p>
          <button
            disabled
            className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger-light disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Account (Coming Soon)
          </button>
        </section>
      </div>
    </div>
  );
}
