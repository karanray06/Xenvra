import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { YoupiGatewayProvider } from "@/lib/payments/youpi";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-gateway-signature") ||
      request.headers.get("x-youpi-signature") ||
      request.headers.get("x-razorpay-signature");

    const youpi = new YoupiGatewayProvider();
    const isValid = youpi.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      // If signature is missing or invalid in local dev, allow safe inspection or reject in prod
      if (process.env.NODE_ENV === "production" && signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
      }
    }

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const admin = createAdminClient();
    const eventType = event.event || event.type || "payment.success";
    const orderId =
      event.orderId ||
      event.order_id ||
      event.payload?.payment?.entity?.order_id ||
      event.data?.orderId;
    const utr =
      event.utr ||
      event.referenceId ||
      event.payload?.payment?.entity?.id ||
      `UTR_${Date.now()}`;

    if (!orderId) {
      return NextResponse.json({ ok: true, message: "No order ID in payload" });
    }

    if (
      eventType === "payment.success" ||
      eventType === "payment.captured" ||
      eventType === "order.paid"
    ) {
      // Idempotency check: see if already marked completed
      const { data: existingPayment } = await admin
        .from("payments")
        .select("id, user_id, plan, status")
        .eq("razorpay_order_id", orderId)
        .maybeSingle();

      if (existingPayment?.status === "completed") {
        return NextResponse.json({ ok: true, message: "Payment already processed" });
      }

      const userId = existingPayment?.user_id || event.metadata?.userId;
      const plan = existingPayment?.plan || event.metadata?.plan || "pro";

      if (!userId) {
        console.error("Webhook could not resolve userId for order:", orderId);
        return NextResponse.json({ ok: true });
      }

      // Get plan duration
      const { data: planRecord } = await admin
        .from("plans")
        .select("duration_days")
        .eq("id", plan)
        .maybeSingle();

      const durationDays = planRecord?.duration_days || 30;

      // Mark payment completed
      await admin
        .from("payments")
        .update({
          razorpay_payment_id: utr,
          status: "completed",
        })
        .eq("razorpay_order_id", orderId);

      // Fetch current entitlement to extend if already active
      const { data: existingEnt } = await admin
        .from("entitlements")
        .select("current_period_end, status")
        .eq("user_id", userId)
        .maybeSingle();

      const now = new Date();
      let baseTime = now;
      if (
        existingEnt?.status === "active" &&
        existingEnt.current_period_end &&
        new Date(existingEnt.current_period_end) > now
      ) {
        baseTime = new Date(existingEnt.current_period_end);
      }

      const expiryDate = new Date(baseTime.getTime() + durationDays * 24 * 60 * 60 * 1000);

      // Upsert active entitlement
      await admin
        .from("entitlements")
        .upsert(
          {
            user_id: userId,
            plan,
            status: "active",
            current_period_end: expiryDate.toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook handler failed";
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
