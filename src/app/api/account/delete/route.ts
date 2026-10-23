import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { confirm?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (body.confirm !== "DELETE") {
      return NextResponse.json(
        { error: 'Typed confirmation "DELETE" is required to delete your account.' },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();

    // 1. Clean up user storage files if storage bucket exists
    try {
      const { data: buckets } = await adminClient.storage.listBuckets();
      if (buckets && buckets.length > 0) {
        for (const bucket of buckets) {
          try {
            const { data: files } = await adminClient.storage
              .from(bucket.name)
              .list(user.id);
            if (files && files.length > 0) {
              const filePaths = files.map((f) => `${user.id}/${f.name}`);
              await adminClient.storage.from(bucket.name).remove(filePaths);
            }
          } catch {
            // Continue if bucket listing is not applicable
          }
        }
      }
    } catch {
      // Storage cleanup non-blocking
    }

    // 2. Delete user via Supabase Auth Admin
    // Cascades down to profiles, resumes, entitlements, usage_events, etc.
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      return NextResponse.json(
        { error: `Failed to delete user account: ${deleteError.message}` },
        { status: 500 }
      );
    }

    // 3. Sign out session
    await supabase.auth.signOut();

    return NextResponse.json({
      ok: true,
      message: "Account and associated data deleted successfully.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
