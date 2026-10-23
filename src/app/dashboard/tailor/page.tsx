import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TailorClient } from "@/components/tailor/tailor-client";

export default async function TailorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, data, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <TailorClient resumes={resumes || []} />;
}
