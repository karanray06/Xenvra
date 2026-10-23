export interface PaymentProvider {
  createOrder(input: {
    userId: string;
    plan: "beginner" | "pro";
    amountInr: number;
  }): Promise<{ orderId: string; clientConfig: unknown }>;
  verifyAndFulfil(
    payload: unknown,
    signature: string
  ): Promise<{ userId: string; plan: string; paymentId: string }>;
  refund(paymentId: string): Promise<void>;
}
