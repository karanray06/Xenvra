import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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
