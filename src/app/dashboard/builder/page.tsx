import { redirect } from "next/navigation";

export default async function BuilderRedirectPage(props: {
  searchParams: Promise<{ id?: string; template?: string }>;
}) {
  const searchParams = await props.searchParams;
  const qs = new URLSearchParams();
  if (searchParams.id) qs.set("id", searchParams.id);
  if (searchParams.template) qs.set("template", searchParams.template);
  const query = qs.toString();
  redirect(`/dashboard/studio${query ? `?${query}` : ""}`);
}
