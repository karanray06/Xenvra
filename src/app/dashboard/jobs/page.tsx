import { createClient, getUserContext } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApplicationTrackerClient } from "@/components/applications/application-tracker-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs & Applications — Xenvra",
  description: "Track your job applications and search career opportunities.",
};

export default async function JobsPage() {
  const context = await getUserContext();
  if (!context?.user) redirect("/login");

  const { user } = context;
  const supabase = await createClient();

  // Run queries in parallel (Phase B performance optimization)
  const [appsRes, resumesRes] = await Promise.all([
    supabase
      .from("job_applications")
      .select("*, resumes(title)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("resumes")
      .select("id, title")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <ApplicationTrackerClient
      initialApplications={appsRes.data || []}
      resumes={resumesRes.data || []}
    />
  );
}
