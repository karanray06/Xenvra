import "server-only";
import type { PaymentProvider } from "./provider";

/**
 * Hyperswitch Payment Provider Stub
 *
 * To activate Hyperswitch in production:
 * 1. Self-host Hyperswitch Router via Docker / AWS ECS (see https://github.com/juspay/hyperswitch).
 * 2. Configure Hyperswitch API keys: `HYPERSWITCH_API_KEY`, `HYPERSWITCH_PUBLISHABLE_KEY`.
 * 3. Replace the Razorpay checkout modal with the `@juspay/hyperswitch-web` React SDK.
 * 4. Point Hyperswitch webhooks to `/api/billing/webhook` and map payload events to `verifyAndFulfil`.
 */
export class HyperswitchProvider implements PaymentProvider {
  async createOrder(): Promise<{ orderId: string; clientConfig: unknown }> {
    throw new Error(
      "HyperswitchProvider is not deployed yet. Please use RazorpayProvider or configure your self-hosted Hyperswitch router."
    );
  }

  async verifyAndFulfil(): Promise<{ userId: string; plan: string; paymentId: string }> {
    throw new Error("HyperswitchProvider is not deployed yet.");
  }

  async refund(): Promise<void> {
    throw new Error("HyperswitchProvider is not deployed yet.");
  }
}
