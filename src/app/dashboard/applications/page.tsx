import { redirect } from "next/navigation";

export default function ApplicationsRedirectPage() {
  redirect("/dashboard/jobs");
}
