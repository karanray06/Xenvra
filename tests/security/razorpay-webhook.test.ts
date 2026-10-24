import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { handleWebhookRequest } from "@/app/api/billing/webhook/route";
import { RazorpayProvider } from "@/lib/payments/razorpay";

describe("Phase F Security: Razorpay Webhook Hardening & Verification", () => {
  const razorpaySecret = "rzp_wh_secret_test_abcdef1234567890";

  beforeEach(() => {
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", razorpaySecret);
    vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_key123");
    vi.stubEnv("RAZORPAY_KEY_SECRET", "rzp_test_secret123");
    vi.stubEnv("NODE_ENV", "production");
  });

  function createValidSignature(body: string, s: string = razorpaySecret): string {
    return crypto.createHmac("sha256", s).update(body).digest("hex");
  }

  it("Rejects Razorpay webhook with MISSING x-razorpay-signature header", async () => {
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test123",
            order_id: "order_test123",
            amount: 4900,
          },
        },
      },
    });

    const request = new Request("http://localhost:3000/api/billing/webhook/razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    const response = await handleWebhookRequest(request, "razorpay");
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toMatch(/Missing required signature/i);
  });

  it("Rejects Razorpay webhook with WRONG HMAC signature", async () => {
    const payload = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: "pay_test123",
            order_id: "order_test123",
            amount: 4900,
          },
        },
      },
    });

    const request = new Request("http://localhost:3000/api/billing/webhook/razorpay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-razorpay-signature": "invalid_forged_razorpay_hmac_hex",
      },
      body: payload,
    });

    const response = await handleWebhookRequest(request, "razorpay");
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toMatch(/Invalid webhook signature/i);
  });

  it("RazorpayProvider.verifyWebhook correctly extracts orderId and paymentId on valid signature", async () => {
    const provider = new RazorpayProvider();
    const payload = JSON.stringify({
      event: "order.paid",
      payload: {
        order: {
          entity: {
            id: "order_rzp_999",
            amount: 4900,
            status: "paid",
          },
        },
        payment: {
          entity: {
            id: "pay_rzp_888",
            order_id: "order_rzp_999",
            amount: 4900,
          },
        },
      },
    });

    const validSig = createValidSignature(payload);
    const headers = new Headers({
      "x-razorpay-signature": validSig,
    });

    const result = await provider.verifyWebhook(payload, headers);
    expect(result.isValid).toBe(true);
    expect(result.status).toBe("paid");
    expect(result.orderId).toBe("order_rzp_999");
    expect(result.paymentId).toBe("pay_rzp_888");
    expect(result.amountPaise).toBe(4900);
  });

  it("RazorpayProvider.verifyWebhook handles non-fulfilment events safely", async () => {
    const provider = new RazorpayProvider();
    const payload = JSON.stringify({
      event: "payment.failed",
      payload: {
        payment: {
          entity: {
            id: "pay_failed_1",
            order_id: "order_failed_1",
          },
        },
      },
    });

    const validSig = createValidSignature(payload);
    const headers = new Headers({
      "x-razorpay-signature": validSig,
    });

    const result = await provider.verifyWebhook(payload, headers);
    expect(result.isValid).toBe(true);
    expect(result.status).toBe("failed");
    expect(result.orderId).toBe("order_failed_1");
  });
});
