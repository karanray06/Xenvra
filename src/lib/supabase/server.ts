import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

export async function createClient() {
  let cookieStore = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Outside request store context (e.g. testing)
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "mock-anon-key",
    {
      cookies: {
        getAll() {
          return cookieStore ? cookieStore.getAll() : [];
        },
        setAll(cookiesToSet) {
          try {
            if (cookieStore) {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            }
          } catch {
            // Ignored if called from a Server Component
          }
        },
      },
    }
  );
}

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getUserContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [profileResult, entitlementResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("entitlements")
      .select("id, plan, status, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const plan =
    (entitlementResult.data?.status === "active"
      ? entitlementResult.data.plan
      : "free") || "free";

  return {
    user,
    profile: profileResult.data,
    plan,
    entitlement: entitlementResult.data,
  };
});

