import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CoverLetterClient } from "@/components/cover-letter/cover-letter-client";

export default async function CoverLettersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: letters } = await supabase
    .from("cover_letters")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, title, data")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <CoverLetterClient
      initialLetters={letters || []}
      resumes={resumes || []}
    />
  );
}
