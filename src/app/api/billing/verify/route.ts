import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RazorpayProvider } from "@/lib/payments/razorpay";
import { z } from "zod";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parseResult = verifySchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid verification parameters" }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parseResult.data;

    // Verify cryptographic signature
    const provider = new RazorpayProvider();
    await provider.verifyAndFulfil(
      { razorpay_order_id, razorpay_payment_id, userId: user.id },
      razorpay_signature
    );

    const adminSupabase = createAdminClient();

    // Fetch the payment record to determine plan
    const { data: paymentRecord } = await adminSupabase
      .from("payments")
      .select("id, plan, status, amount_inr")
      .eq("razorpay_order_id", razorpay_order_id)
      .maybeSingle();

    const plan = paymentRecord?.plan || "pro";

    // Fetch plan duration
    const { data: planData } = await adminSupabase
      .from("plans")
      .select("duration_days")
      .eq("id", plan)
      .maybeSingle();

    const durationDays = planData?.duration_days || 30;

    // Update payment record to completed
    await adminSupabase
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "completed",
      })
      .eq("razorpay_order_id", razorpay_order_id);

    // Calculate expiry (extend if already active)
    const { data: existingEntitlement } = await adminSupabase
      .from("entitlements")
      .select("current_period_end, status")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date();
    let baseTime = now;
    if (
      existingEntitlement?.status === "active" &&
      existingEntitlement.current_period_end &&
      new Date(existingEntitlement.current_period_end) > now
    ) {
      baseTime = new Date(existingEntitlement.current_period_end);
    }

    const expiryDate = new Date(baseTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // Upsert entitlement
    await adminSupabase
      .from("entitlements")
      .upsert(
        {
          user_id: user.id,
          plan,
          status: "active",
          current_period_end: expiryDate.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    return NextResponse.json({
      success: true,
      plan,
      expiry: expiryDate.toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
