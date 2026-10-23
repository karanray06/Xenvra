import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ApplicationTrackerClient } from "@/components/applications/application-tracker-client";

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: apps } = await supabase
    .from("job_applications")
    .select("*, resumes(title)")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <ApplicationTrackerClient
      initialApplications={apps || []}
      resumes={resumes || []}
    />
  );
}
