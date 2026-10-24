/**
 * Standard Payment Gateway Provider Interface
 * Direct Native UPI Gateway (7980398203@fam / Xenvra)
 */

export interface CreateOrderOptions {
  orderId: string;
  amountPaise: number; // In paise (e.g. 2900 for ₹29, 4900 for ₹49)
  currency?: string; // Default: 'INR'
  plan: "beginner" | "pro";
  userId: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentOrder {
  orderId: string;
  provider: "direct_upi" | "youpi";
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  plan: string;
  upiUri?: string;
  qrCodeUrl?: string;
  vpa?: string;
  merchantName: string;
  expiresAt: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  orderId?: string;
  paymentId?: string;
  amountPaise?: number;
  status: "paid" | "failed" | "needs_review" | "ignored";
  error?: string;
}

export interface OrderStatusResult {
  orderId: string;
  status: "created" | "awaiting_payment" | "processing" | "paid" | "failed" | "expired" | "needs_review";
  paid: boolean;
  amountPaise?: number;
}

export interface PaymentProvider {
  name: "direct_upi" | "youpi";
  createOrder(options: CreateOrderOptions): Promise<PaymentOrder>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult>;
  fetchOrderStatus(orderId: string): Promise<OrderStatusResult>;
  refund?(paymentId: string, amountPaise?: number): Promise<{ success: boolean; refundId?: string; error?: string }>;
}

import { DirectUpiProvider } from "./direct-upi";
import { YoupiGatewayProvider } from "./youpi";

export function getPaymentProvider(providerName?: string): PaymentProvider {
  const chosen = (providerName || process.env.PAYMENT_PROVIDER || "direct_upi").toLowerCase();

  if (chosen === "youpi") {
    return new YoupiGatewayProvider();
  }
  return new DirectUpiProvider();
}
