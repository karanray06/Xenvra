import "server-only";
import Razorpay from "razorpay";
import crypto from "crypto";
import type { PaymentProvider } from "./provider";

export class RazorpayProvider implements PaymentProvider {
  private razorpay: Razorpay;
  private webhookSecret: string;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(input: {
    userId: string;
    plan: "beginner" | "pro";
    amountInr: number;
  }): Promise<{ orderId: string; clientConfig: unknown }> {
    const amountInPaise = Math.round(input.amountInr * 100);
    const receipt = `rcpt_${input.userId.substring(0, 8)}_${Date.now().toString().slice(-6)}`;

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        userId: input.userId,
        plan: input.plan,
      },
    });

    return {
      orderId: order.id,
      clientConfig: {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Xenvra",
        description: `${input.plan.toUpperCase()} Plan (30-day pass)`,
        order_id: order.id,
      },
    };
  }

  async verifyAndFulfil(
    payload: { razorpay_order_id: string; razorpay_payment_id: string; userId?: string; plan?: string },
    signature: string
  ): Promise<{ userId: string; plan: string; paymentId: string }> {
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const actualBuf = Buffer.from(signature, "utf8");

    if (
      expectedBuf.length !== actualBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, actualBuf)
    ) {
      throw new Error("Invalid Razorpay payment signature");
    }

    return {
      userId: payload.userId || "",
      plan: payload.plan || "pro",
      paymentId: payload.razorpay_payment_id,
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    if (!this.webhookSecret) return false;
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    const expectedBuf = Buffer.from(expected, "utf8");
    const actualBuf = Buffer.from(signature, "utf8");

    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
  }

  async refund(paymentId: string): Promise<void> {
    await this.razorpay.payments.refund(paymentId, {});
  }
}
