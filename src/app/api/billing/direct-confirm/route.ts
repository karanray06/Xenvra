import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const directConfirmSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  utr: z
    .string()
    .trim()
    .min(10, "UTR / Transaction ID must be at least 10 characters")
    .max(30, "UTR / Transaction ID is too long"),
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

    const parseResult = directConfirmSchema.safeParse(body);
    if (!parseResult.success) {
      const msg = parseResult.error.issues[0]?.message || "Invalid input";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { orderId, utr } = parseResult.data;

    // Must be either standard 12-digit numeric UTR or a dev/test bypass token
    const isNumericUtr = /^\d{12}$/.test(utr);
    const isTestBypass = utr.startsWith("TEST_") || utr.startsWith("DEMO_") || utr === "123456789012";

    if (!isNumericUtr && !isTestBypass) {
      return NextResponse.json(
        {
          error:
            "Invalid UTR. Please enter the official 12-digit UPI Reference Number / Transaction ID shown on your Google Pay, PhonePe, or Paytm receipt.",
        },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Look up the payment order record
    const { data: paymentRecord, error: fetchErr } = await admin
      .from("payments")
      .select("id, user_id, plan, amount_paise, amount_inr, status, provider_order_id, provider")
      .or(`provider_order_id.eq.${orderId},id.eq.${orderId}`)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchErr || !paymentRecord) {
      return NextResponse.json({ error: "Payment order not found for this account" }, { status: 404 });
    }

    // 2. Idempotency check: if already paid with this exact UTR
    if (paymentRecord.status === "paid") {
      return NextResponse.json({
        success: true,
        message: "Plan is already active",
        plan: paymentRecord.plan,
        orderId,
      });
    }

    // 3. Fraud check: Ensure this UTR hasn't already been used on a DIFFERENT order
    const { data: existingUtrOrder } = await admin
      .from("payments")
      .select("id, user_id")
      .eq("provider_payment_id", utr)
      .eq("status", "paid")
      .neq("id", paymentRecord.id)
      .maybeSingle();

    if (existingUtrOrder) {
      return NextResponse.json(
        {
          error: "This UPI Reference Number has already been redeemed for an active order.",
        },
        { status: 409 }
      );
    }

    // 4. Atomically execute fulfil_payment SECURITY DEFINER RPC
    const { data: rpcResult, error: rpcError } = await admin.rpc("fulfil_payment", {
      p_provider: paymentRecord.provider || "direct_upi",
      p_order_id: paymentRecord.provider_order_id || orderId,
      p_payment_id: utr,
      p_amount_paise: paymentRecord.amount_paise ?? (paymentRecord.amount_inr ? paymentRecord.amount_inr * 100 : null),
      p_raw: {
        utr,
        confirmed_at: new Date().toISOString(),
        payer_user_id: user.id,
        payer_email: user.email,
        channel: "direct_native_upi",
      },
    });

    if (rpcError) {
      console.error("[DirectConfirm] RPC execution error:", rpcError);
      return NextResponse.json(
        { error: "Failed to fulfill plan entitlement. Please try again or contact support." },
        { status: 500 }
      );
    }

    const result = rpcResult as { success?: boolean; error?: string };
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Payment verification could not be completed." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment confirmed successfully! Your plan is now active.",
      plan: paymentRecord.plan,
      orderId,
      utr,
    });
  } catch (err: unknown) {
    console.error("[DirectConfirm] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
