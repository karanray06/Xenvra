import { createClient, getUserContext } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TailorClient } from "@/components/tailor/tailor-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JD Tailor — Xenvra Studio",
  description: "Tailor your resume against any job description with keyword alignment.",
};

export default async function TailorPage() {
  const context = await getUserContext();
  if (!context?.user) redirect("/login");

  const { user } = context;
  const supabase = await createClient();

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, data, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return <TailorClient resumes={resumes || []} />;
}
