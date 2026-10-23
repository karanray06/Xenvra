import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BuilderClient } from "@/components/builder/builder-client";

import { TEMPLATES } from "@/components/templates/registry";

export default async function BuilderPage(props: {
  searchParams: Promise<{ id?: string; template?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const searchParams = await props.searchParams;
  const resumeId = searchParams.id || null;
  const requestedTemplate = searchParams.template;
  const isValidTemplate = requestedTemplate
    ? TEMPLATES.some((t) => t.id === requestedTemplate)
    : false;

  let resume = null;
  if (resumeId) {
    const { data } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .maybeSingle();
    resume = data;
  }

  // Check plan entitlement for watermark & template access
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPaid =
    entitlement?.status === "active" &&
    (entitlement.plan === "beginner" || entitlement.plan === "pro") &&
    (!entitlement.current_period_end ||
      new Date(entitlement.current_period_end) > new Date());

  const initialTemplateId =
    resume?.template_id || (isValidTemplate ? requestedTemplate! : "modern-1");

  return (
    <BuilderClient
      userId={user.id}
      initialId={resume?.id || null}
      initialTitle={resume?.title || "Untitled Resume"}
      initialTemplateId={initialTemplateId}
      initialData={resume?.data || null}
      isPaid={isPaid}
    />
  );
}
