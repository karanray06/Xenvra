import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Clock, LayoutGrid } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user's resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, template_id, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const userName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "there";

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-text-secondary">
          Create, edit, and manage your resumes.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/builder"
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-accent transition-colors group-hover:bg-brand-100">
            <Plus className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">New Resume</p>
            <p className="text-sm text-text-secondary">
              Start from scratch
            </p>
          </div>
        </Link>
        <Link
          href="/dashboard/templates"
          className="group flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-accent transition-colors group-hover:bg-brand-100">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Browse Templates</p>
            <p className="text-sm text-text-secondary">
              Pick a design
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-tertiary text-text-tertiary">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="font-semibold text-text-primary">
              {resumes?.length ?? 0} Resume{(resumes?.length ?? 0) !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-text-secondary">Total created</p>
          </div>
        </div>
      </div>

      {/* Resumes List */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-text-primary">
          Your Resumes
        </h2>

        {!resumes || resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-secondary py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
              <FileText className="h-8 w-8 text-accent" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              No resumes yet
            </h3>
            <p className="mb-6 max-w-sm text-sm text-text-secondary">
              Create your first professional resume in minutes with our
              AI-powered builder.
            </p>
            <Link
              href="/dashboard/builder"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-4 w-4" />
              Create Resume
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Link
                key={resume.id}
                href={`/dashboard/builder?id=${resume.id}`}
                className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
              >
                <div className="mb-4 flex h-32 items-center justify-center rounded-lg bg-surface-tertiary">
                  <FileText className="h-10 w-10 text-text-tertiary transition-colors group-hover:text-accent" />
                </div>
                <h3 className="font-semibold text-text-primary">
                  {resume.title}
                </h3>
                <div className="mt-2 flex items-center gap-1.5 text-xs text-text-tertiary">
                  <Clock className="h-3 w-3" />
                  {new Date(resume.updated_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
