import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { GET as getOrderStatus } from "@/app/api/billing/status/route";

describe("Security Test Suite: Client Fulfilment Bypass Removal (C1, C4)", () => {
  it("C1 Fix: Confirms /api/billing/verify route file has been completely DELETED", () => {
    const verifyRoutePath = path.join(
      process.cwd(),
      "src",
      "app",
      "api",
      "billing",
      "verify",
      "route.ts"
    );
    expect(fs.existsSync(verifyRoutePath)).toBe(false);
  });

  it("C4 Fix: Confirms billing-client.tsx contains zero fake card inputs or auto_confirm triggers", () => {
    const billingClientPath = path.join(
      process.cwd(),
      "src",
      "components",
      "billing",
      "billing-client.tsx"
    );
    const content = fs.readFileSync(billingClientPath, "utf8");

    // Must not contain fake card fields
    expect(content).not.toContain("CARD_FAM_");
    expect(content).not.toContain("auto_confirm: true");
    expect(content).not.toContain("I Have Paid — Unlock Pro Immediately");
    expect(content).not.toContain("Cardholder Name");
  });

  it("Status Endpoint: Unauthenticated requests to /api/billing/status are rejected with 401", async () => {
    // Mock request without auth
    const req = new Request("http://localhost:3000/api/billing/status?order_id=ORDER_123");
    const response = await getOrderStatus(req);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toMatch(/Unauthorized/i);
  });
});
