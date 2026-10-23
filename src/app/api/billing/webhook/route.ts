import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { RazorpayProvider } from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
    }

    const provider = new RazorpayProvider();
    const isValid = provider.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const admin = createAdminClient();

    switch (event.event) {
      case "payment.captured":
      case "order.paid": {
        const paymentEntity = event.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        const paymentId = paymentEntity?.id;

        if (!orderId) {
          return NextResponse.json({ ok: true, message: "No order ID in payload" });
        }

        // Idempotency check: see if already marked completed
        const { data: existingPayment } = await admin
          .from("payments")
          .select("id, user_id, plan, status")
          .eq("razorpay_order_id", orderId)
          .maybeSingle();

        if (existingPayment?.status === "completed") {
          return NextResponse.json({ ok: true, message: "Payment already processed" });
        }

        const userId = existingPayment?.user_id || paymentEntity?.notes?.userId;
        const plan = existingPayment?.plan || paymentEntity?.notes?.plan || "pro";

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
            razorpay_payment_id: paymentId,
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

        break;
      }

      case "payment.failed": {
        const paymentEntity = event.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;
        if (orderId) {
          await admin
            .from("payments")
            .update({ status: "failed" })
            .eq("razorpay_order_id", orderId);
        }
        break;
      }

      case "refund.processed": {
        const paymentEntity = event.payload?.payment?.entity;
        const paymentId = paymentEntity?.id;

        if (paymentId) {
          const { data: paymentRecord } = await admin
            .from("payments")
            .update({ status: "refunded" })
            .eq("razorpay_payment_id", paymentId)
            .select("user_id")
            .maybeSingle();

          if (paymentRecord?.user_id) {
            // Downgrade entitlement back to free
            await admin
              .from("entitlements")
              .update({
                plan: "free",
                status: "cancelled",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", paymentRecord.user_id);
          }
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook handler failed";
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
