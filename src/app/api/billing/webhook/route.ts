import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

function verifyHmacSignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  try {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuf = Buffer.from(signature, "utf8");
    const expBuf = Buffer.from(expected, "utf8");
    if (sigBuf.length !== expBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

export async function handleWebhookRequest(request: Request, providerParam?: string) {
  try {
    const provider = (providerParam || "youpi").toLowerCase();
    const rawBody = await request.text();

    if (!rawBody || rawBody.trim().length === 0) {
      return NextResponse.json({ error: "Empty request body" }, { status: 400 });
    }

    // 1. Signature & Timestamp Header Validation
    let signature: string | null = null;
    let secret = "";

    if (provider === "razorpay") {
      signature = request.headers.get("x-razorpay-signature");
      secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    } else {
      // YouPI / generic provider
      signature =
        request.headers.get("x-gateway-signature") ||
        request.headers.get("x-youpi-signature") ||
        request.headers.get("x-signature");
      secret = process.env.YOUPI_WEBHOOK_SECRET || "";

      // Check replay timestamp window if provided
      const timestampHeader =
        request.headers.get("x-gateway-timestamp") ||
        request.headers.get("x-webhook-timestamp");
      if (timestampHeader) {
        const reqTime = parseInt(timestampHeader, 10);
        const currentTime = Date.now();
        // Reject if timestamp is older than 5 minutes (300,000 ms) or from future (> 1 min)
        if (isNaN(reqTime) || currentTime - reqTime > 5 * 60 * 1000 || reqTime - currentTime > 60 * 1000) {
          console.warn("[Security] Webhook rejected: Stale timestamp or clock skew", { reqTime, currentTime });
          return NextResponse.json({ error: "Timestamp out of allowed window" }, { status: 400 });
        }
      }
    }

    // MANDATORY REQUIREMENT: Must reject if signature is missing or secret is not configured
    if (!signature) {
      console.warn(`[Security] Webhook rejected: Missing signature header for provider '${provider}'`);
      return NextResponse.json({ error: "Missing required signature header" }, { status: 400 });
    }

    if (!secret) {
      console.error(`[Configuration Error] Webhook secret not configured for provider '${provider}'`);
      return NextResponse.json(
        { error: "Webhook verification unavailable on server" },
        { status: 500 }
      );
    }

    // Verify HMAC with timing-safe comparison
    const isSignatureValid = verifyHmacSignature(rawBody, signature, secret);
    if (!isSignatureValid) {
      console.warn(`[Security] Webhook rejected: Invalid HMAC signature for provider '${provider}'`);
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    // Parse payload safely
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    // Extract event details
    const eventType = String(payload.event || payload.type || "");
    const eventId = String(payload.id || payload.eventId || `evt_${Date.now()}`);

    // Check event types
    const successEvents = [
      "payment.success",
      "payment.captured",
      "order.paid",
      "payment_captured",
    ];

    if (!successEvents.includes(eventType)) {
      // Unknown or non-success events return 200 no-op to acknowledge receipt
      console.log(`[Webhook] Acknowledging non-fulfilment event: ${eventType} (ID: ${eventId})`);
      return NextResponse.json({ ok: true, received: true, eventId });
    }

    // Extract order ID, payment reference, and amount
    let orderId = "";
    let paymentId = "";
    let amountPaise: number | undefined;

    if (provider === "razorpay") {
      const pPayload = payload.payload as Record<string, unknown> | undefined;
      const paymentEntity = (pPayload?.payment as Record<string, unknown> | undefined)?.entity as Record<string, unknown> | undefined;
      orderId = String(paymentEntity?.order_id || "");
      paymentId = String(paymentEntity?.id || "");
      if (typeof paymentEntity?.amount === "number") {
        amountPaise = paymentEntity.amount;
      }
    } else {
      orderId = String(payload.orderId || payload.order_id || "");
      paymentId = String(payload.utr || payload.referenceId || payload.paymentId || "");
      if (typeof payload.amountPaise === "number") {
        amountPaise = payload.amountPaise;
      } else if (typeof payload.amount === "number") {
        amountPaise = Math.round(payload.amount * 100);
      }
    }

    if (!orderId) {
      console.warn(`[Webhook] Missing order ID in payload (ID: ${eventId})`);
      return NextResponse.json({ error: "Missing order ID in webhook payload" }, { status: 400 });
    }

    if (!paymentId) {
      paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    }

    // Call atomic fulfil_payment RPC via admin client (Service Role)
    const admin = createAdminClient();
    const { data: fulfilResult, error: rpcError } = await admin.rpc("fulfil_payment", {
      p_provider: provider,
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_amount_paise: amountPaise ?? null,
      p_raw: { eventId, eventType, provider },
    });

    if (rpcError) {
      console.error(`[Webhook] RPC fulfil_payment failure for order ${orderId}:`, rpcError);
      return NextResponse.json({ error: "Failed to process payment fulfillment" }, { status: 500 });
    }

    if (fulfilResult && !fulfilResult.success) {
      console.warn(`[Webhook] Payment fulfillment rejected by rule for order ${orderId}:`, fulfilResult.error);
      return NextResponse.json({ error: fulfilResult.error }, { status: 422 });
    }

    // Log ONLY event id and order id, never secrets or raw body
    console.log(`[Webhook] Payment successfully fulfilled for order: ${orderId}, eventId: ${eventId}`);

    return NextResponse.json({
      ok: true,
      processed: true,
      orderId,
      eventId,
    });
  } catch (err: unknown) {
    console.error("[Webhook] Unhandled error:", err);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return handleWebhookRequest(request, "youpi");
}
