import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { YoupiGatewayProvider } from "@/lib/payments/youpi";
import { z } from "zod";

const verifySchema = z.object({
  order_id: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  utr: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  signature: z.string().optional(),
  razorpay_signature: z.string().optional(),
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

    const orderId = parseResult.data.order_id || parseResult.data.razorpay_order_id;
    const utr = parseResult.data.utr || parseResult.data.razorpay_payment_id || `UTR_${Date.now()}`;
    const signature = parseResult.data.signature || parseResult.data.razorpay_signature || "";

    if (!orderId) {
      return NextResponse.json({ error: "order_id is required" }, { status: 400 });
    }

    const youpi = new YoupiGatewayProvider();
    if (!youpi.validateUtr(utr)) {
      return NextResponse.json(
        { error: "Please enter a valid 12-digit UPI UTR / Reference number from your banking app" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Fetch the payment record to determine plan
    const { data: paymentRecord } = await adminSupabase
      .from("payments")
      .select("id, plan, status, amount_inr, metadata")
      .eq("razorpay_order_id", orderId)
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
        razorpay_payment_id: utr,
        razorpay_signature: signature,
        status: "completed",
        metadata: {
          ...(typeof paymentRecord?.metadata === "object" ? paymentRecord.metadata : {}),
          provider: "youpi",
          utr,
          verifiedAt: new Date().toISOString(),
        },
      })
      .eq("razorpay_order_id", orderId);

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
      utr,
      expiry: expiryDate.toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("Payment verification error:", err);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
