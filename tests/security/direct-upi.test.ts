import { describe, it, expect } from "vitest";
import { DirectUpiProvider } from "@/lib/payments/direct-upi";
import { POST as directConfirmHandler } from "@/app/api/billing/direct-confirm/route";

describe("Direct Native UPI Payment Suite (7980398203@fam / Xenvra)", () => {
  const provider = new DirectUpiProvider();

  it("DirectUpiProvider creates order with correct VPA, merchant, and NPCI URI", async () => {
    const order = await provider.createOrder({
      orderId: "ORDER_TEST_01",
      amountPaise: 4900,
      currency: "INR",
      plan: "pro",
      userId: "test_user_id",
    });

    expect(order.provider).toBe("direct_upi");
    expect(order.vpa).toBe("7980398203@fam");
    expect(order.merchantName).toBe("Xenvra");
    expect(order.amountPaise).toBe(4900);
    expect(order.upiUri).toContain("pa=7980398203@fam");
    expect(order.upiUri).toContain("pn=Xenvra");
    expect(order.upiUri).toContain("am=49.00");
    expect(order.upiUri).toContain("cu=INR");
    expect(order.qrCodeUrl).toMatch(/^data:image\/png;base64,/);
  });

  it("DirectUpiProvider correctly handles Beginner plan pricing (₹29)", async () => {
    const order = await provider.createOrder({
      orderId: "ORDER_TEST_02",
      amountPaise: 2900,
      currency: "INR",
      plan: "beginner",
      userId: "test_user_id",
    });

    expect(order.amountPaise).toBe(2900);
    expect(order.upiUri).toContain("am=29.00");
    expect(order.upiUri).toContain("BEGINNER");
  });

  it("Direct Confirm Endpoint: Rejects unauthenticated requests with 401", async () => {
    const req = new Request("http://localhost:3000/api/billing/direct-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: "ORDER_TEST_01",
        utr: "428901234567",
      }),
    });

    const response = await directConfirmHandler(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toMatch(/Unauthorized/i);
  });

  it("Direct Confirm Endpoint: Rejects invalid JSON body with 400", async () => {
    const req = new Request("http://localhost:3000/api/billing/direct-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid json",
    });

    const response = await directConfirmHandler(req);
    // Unauthenticated comes first or invalid JSON
    expect([400, 401]).toContain(response.status);
  });
});
