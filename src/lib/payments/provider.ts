/**
 * Standard Payment Gateway Provider Interface
 * All payment integrations (Razorpay, YouPI) conform to this unified abstraction.
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
  provider: "razorpay" | "youpi";
  providerOrderId: string;
  amountPaise: number;
  currency: string;
  plan: string;
  upiUri?: string;
  qrCodeUrl?: string;
  vpa?: string;
  merchantName: string;
  expiresAt: string;
  keyId?: string; // For client-side Razorpay modal initialization if used
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
  name: "razorpay" | "youpi";
  createOrder(options: CreateOrderOptions): Promise<PaymentOrder>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult>;
  fetchOrderStatus(orderId: string): Promise<OrderStatusResult>;
  refund?(paymentId: string, amountPaise?: number): Promise<{ success: boolean; refundId?: string; error?: string }>;
}

import { RazorpayProvider } from "./razorpay";
import { YoupiGatewayProvider } from "./youpi";

export function getPaymentProvider(providerName?: string): PaymentProvider {
  const chosen = (providerName || process.env.PAYMENT_PROVIDER || "razorpay").toLowerCase();
  if (chosen === "youpi") {
    return new YoupiGatewayProvider();
  }
  return new RazorpayProvider();
}
