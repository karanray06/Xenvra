import { getUserContext } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getUserContext();

  if (!context?.user) {
    redirect("/login");
  }

  const { user, profile, plan } = context;

  return (
    <DashboardShell
      user={{
        id: user.id,
        email: user.email || "",
        fullName:
          profile?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User",
        avatarUrl:
          profile?.avatar_url || user.user_metadata?.avatar_url || null,
        plan,
      }}
    >
      {children}
    </DashboardShell>
  );
}
