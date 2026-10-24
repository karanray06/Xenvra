import { createClient, getUserContext } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CoverLetterClient } from "@/components/cover-letter/cover-letter-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cover Letters — Xenvra Studio",
  description: "Craft personalized, tailored cover letters powered by AI.",
};

export default async function CoverLettersPage() {
  const context = await getUserContext();
  if (!context?.user) redirect("/login");

  const { user } = context;
  const supabase = await createClient();

  // Run queries in parallel (Phase B performance optimization)
  const [lettersRes, resumesRes] = await Promise.all([
    supabase
      .from("cover_letters")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("resumes")
      .select("id, title, data")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
  ]);

  return (
    <CoverLetterClient
      initialLetters={lettersRes.data || []}
      resumes={resumesRes.data || []}
    />
  );
}
