import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as cronExpireHandler } from "@/app/api/cron/expire/route";
import { checkRateLimit, RATE_LIMIT_BUDGETS } from "@/lib/rate-limit";
import { verifyMutationOrigin } from "@/lib/api-utils";

describe("Security Test Suite: Plan Gates, Cron Hardening, and Rate Limiting (Phase A)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Cron Fail-Closed Security", () => {
    it("Rejects request when CRON_SECRET is missing or empty (fails closed)", async () => {
      vi.stubEnv("CRON_SECRET", "");

      const req = new Request("http://localhost:3000/api/cron/expire", {
        headers: { Authorization: "Bearer some_token" },
      });

      const response = await cronExpireHandler(req);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toMatch(/Cron service unavailable/i);
    });

    it("Rejects request when Authorization token does not match CRON_SECRET", async () => {
      vi.stubEnv("CRON_SECRET", "super_secret_cron_key_98765");

      const req = new Request("http://localhost:3000/api/cron/expire", {
        headers: { Authorization: "Bearer wrong_token" },
      });

      const response = await cronExpireHandler(req);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toMatch(/Unauthorized/i);
    });
  });

  describe("Tiered Rate Limiter Security", () => {
    it("Enforces auth category limit (10 requests/minute)", async () => {
      const budget = RATE_LIMIT_BUDGETS.auth;
      expect(budget.maxRequests).toBe(10);

      const testId = `user_auth_${Date.now()}`;
      // Execute 10 requests: all must succeed
      for (let i = 0; i < 10; i++) {
        const res = await checkRateLimit(testId, "auth");
        expect(res.success).toBe(true);
      }

      // 11th request must be blocked
      const blockedRes = await checkRateLimit(testId, "auth");
      expect(blockedRes.success).toBe(false);
      expect(blockedRes.remaining).toBe(0);
    });

    it("Enforces AI category limit (20 requests/minute)", async () => {
      const budget = RATE_LIMIT_BUDGETS.ai;
      expect(budget.maxRequests).toBe(20);

      const testId = `user_ai_${Date.now()}`;
      for (let i = 0; i < 20; i++) {
        const res = await checkRateLimit(testId, "ai");
        expect(res.success).toBe(true);
      }

      // 21st request must be blocked
      const blockedRes = await checkRateLimit(testId, "ai");
      expect(blockedRes.success).toBe(false);
    });
  });

  describe("Origin and CSRF Defense", () => {
    it("Blocks cross-site mutating requests when Sec-Fetch-Site is cross-site", () => {
      const req = new Request("http://localhost:3000/api/applications", {
        method: "POST",
        headers: {
          "sec-fetch-site": "cross-site",
          origin: "https://evil-attacker.com",
        },
      });

      const isAllowed = verifyMutationOrigin(req);
      expect(isAllowed).toBe(false);
    });

    it("Allows same-origin mutating requests", () => {
      const req = new Request("http://localhost:3000/api/applications", {
        method: "POST",
        headers: {
          host: "localhost:3000",
          origin: "http://localhost:3000",
          "sec-fetch-site": "same-origin",
        },
      });

      const isAllowed = verifyMutationOrigin(req);
      expect(isAllowed).toBe(true);
    });
  });
});
