import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BuilderClient } from "@/components/builder/builder-client";

export default async function BuilderPage(props: {
  searchParams: Promise<{ id?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const searchParams = await props.searchParams;
  const resumeId = searchParams.id || null;

  let resume = null;
  if (resumeId) {
    const { data } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single();
    resume = data;
  }

  return (
    <BuilderClient
      userId={user.id}
      initialId={resume?.id || null}
      initialTitle={resume?.title || "Untitled Resume"}
      initialTemplateId={resume?.template_id || "modern-1"}
      initialData={resume?.data || null}
    />
  );
}
