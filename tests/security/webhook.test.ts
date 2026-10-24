import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "crypto";
import { handleWebhookRequest } from "@/app/api/billing/webhook/route";

describe("Security Test Suite: Payment Webhook Hardening (Phase A)", () => {
  const secret = "test_wh_secret_mock_1234567890abcdef";

  beforeEach(() => {
    vi.stubEnv("YOUPI_WEBHOOK_SECRET", secret);
    vi.stubEnv("NODE_ENV", "production");
  });

  function createValidSignature(body: string, s: string = secret): string {
    return crypto.createHmac("sha256", s).update(body).digest("hex");
  }

  it("C2 Fix: Rejects forged webhook with MISSING signature header", async () => {
    const payload = JSON.stringify({
      event: "payment.success",
      orderId: "ORDER_123",
      amount: 49,
      metadata: { userId: "victim_user_id", plan: "pro" },
    });

    const request = new Request("http://localhost:3000/api/billing/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });

    const response = await handleWebhookRequest(request, "youpi");
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toMatch(/Missing required signature/i);
  });

  it("C2 Fix: Rejects forged webhook with WRONG HMAC signature", async () => {
    const payload = JSON.stringify({
      event: "payment.success",
      orderId: "ORDER_123",
      amount: 49,
    });

    const request = new Request("http://localhost:3000/api/billing/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gateway-signature": "forged_invalid_signature_hex_value",
      },
      body: payload,
    });

    const response = await handleWebhookRequest(request, "youpi");
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toMatch(/Invalid webhook signature/i);
  });

  it("C2 Fix: Prevents timing attacks and length mismatch exceptions safely", async () => {
    const payload = JSON.stringify({ event: "order.paid", orderId: "ORDER_123" });

    // Varying lengths of attacker signatures: 1 char, short string, 200 chars
    for (const badSig of ["x", "short", "a".repeat(200)]) {
      const request = new Request("http://localhost:3000/api/billing/webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gateway-signature": badSig,
        },
        body: payload,
      });

      const response = await handleWebhookRequest(request, "youpi");
      // Must return 400 rejection, never crash or throw 500 unhandled
      expect(response.status).toBe(400);
    }
  });

  it("Replay Protection: Rejects webhook with STALE timestamp (> 5 minutes old)", async () => {
    const payload = JSON.stringify({
      event: "payment.success",
      orderId: "ORDER_123",
      amount: 49,
    });
    const validSig = createValidSignature(payload);
    const staleTimestamp = Date.now() - 10 * 60 * 1000; // 10 minutes ago

    const request = new Request("http://localhost:3000/api/billing/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gateway-signature": validSig,
        "x-gateway-timestamp": staleTimestamp.toString(),
      },
      body: payload,
    });

    const response = await handleWebhookRequest(request, "youpi");
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toMatch(/Timestamp out of allowed window/i);
  });

  it("Unknown/non-fulfilment events acknowledge with 200 no-op without granting entitlements", async () => {
    const payload = JSON.stringify({
      event: "payment.pending_review",
      id: "evt_test_123",
      orderId: "ORDER_123",
    });
    const validSig = createValidSignature(payload);

    const request = new Request("http://localhost:3000/api/billing/webhook", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-gateway-signature": validSig,
      },
      body: payload,
    });

    const response = await handleWebhookRequest(request, "youpi");
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.received).toBe(true);
    expect(data.processed).toBeUndefined(); // Did not fulfill
  });
});
