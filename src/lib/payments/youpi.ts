/**
 * YouPI Payment Gateway Provider
 * Self-Hosted / Sovereign UPI Payment Gateway conforming to PaymentProvider interface.
 */

import crypto from "crypto";
import QRCode from "qrcode";
import type {
  PaymentProvider,
  CreateOrderOptions,
  PaymentOrder,
  WebhookVerificationResult,
  OrderStatusResult,
} from "./provider";

export interface YoupiPaymentSessionOptions {
  orderId: string;
  amount: number; // in INR (e.g. 29 or 49)
  currency?: string;
  plan: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
}

export interface YoupiPaymentSession {
  orderId: string;
  amount: number;
  currency: string;
  plan: string;
  upiUri: string;
  qrCodeUrl: string;
  vpa: string;
  merchantName: string;
  expiresAt: string;
}

export class YoupiGatewayProvider implements PaymentProvider {
  name = "youpi" as const;
  private apiUrl: string;
  private merchantId: string;
  private webhookSecret: string;
  private vpa: string;
  private merchantName: string;

  constructor() {
    this.apiUrl = process.env.YOUPI_API_URL || "";
    this.merchantId = process.env.YOUPI_MERCHANT_ID || "";
    this.webhookSecret = process.env.YOUPI_WEBHOOK_SECRET || "";
    this.vpa = process.env.NEXT_PUBLIC_YOUPI_UPI_VPA || "xenvra@upi";
    this.merchantName = process.env.NEXT_PUBLIC_YOUPI_MERCHANT_NAME || "Xenvra";

    if (
      process.env.NODE_ENV === "production" &&
      !this.webhookSecret &&
      process.env.PAYMENT_PROVIDER === "youpi"
    ) {
      throw new Error("YOUPI_WEBHOOK_SECRET must be configured in production when YouPI is enabled.");
    }
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrder> {
    const amountInr = options.amountPaise / 100;
    const session = await this.createPaymentSession({
      orderId: options.orderId,
      amount: amountInr,
      currency: options.currency || "INR",
      plan: options.plan,
      userId: options.userId,
      customerEmail: options.customerEmail,
      customerName: options.customerName,
    });

    return {
      orderId: session.orderId,
      provider: "youpi",
      providerOrderId: session.orderId,
      amountPaise: options.amountPaise,
      currency: session.currency,
      plan: session.plan,
      upiUri: session.upiUri,
      qrCodeUrl: session.qrCodeUrl,
      vpa: session.vpa,
      merchantName: session.merchantName,
      expiresAt: session.expiresAt,
    };
  }

  /**
   * Generates a UPI intent URI and dynamic vector/data-URI QR code locally (no third-party data leak).
   */
  async createPaymentSession(options: YoupiPaymentSessionOptions): Promise<YoupiPaymentSession> {
    const { orderId, amount, plan, userId } = options;
    const currency = options.currency || "INR";

    // Standard NPCI UPI URI Specification
    const transactionNote = encodeURIComponent(`Xenvra ${plan.toUpperCase()} Plan`);
    const encodedMerchant = encodeURIComponent(this.merchantName);
    const upiUri = `upi://pay?pa=${this.vpa}&pn=${encodedMerchant}&am=${amount.toFixed(2)}&cu=INR&tr=${orderId}&tn=${transactionNote}`;

    // Generate QR code locally as a Data URL (SVG/PNG) without calling external API
    let qrCodeUrl = "";
    try {
      qrCodeUrl = await QRCode.toDataURL(upiUri, {
        width: 280,
        margin: 2,
        color: {
          dark: "#241915",
          light: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error("Local QR code generation failed:", err);
      qrCodeUrl = "";
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    // If an external YouPI server instance is configured, invoke its API
    if (this.apiUrl && this.webhookSecret) {
      try {
        const res = await fetch(`${this.apiUrl.replace(/\/$/, "")}/api/v1/payments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-merchant-id": this.merchantId,
            Authorization: `Bearer ${this.webhookSecret}`,
          },
          body: JSON.stringify({
            orderId,
            amount: amount.toFixed(2),
            currency,
            metadata: { plan, userId },
          }),
        });

        if (res.ok) {
          const youpiData = await res.json();
          return {
            orderId: youpiData.orderId || orderId,
            amount,
            currency,
            plan,
            upiUri: youpiData.upiUri || upiUri,
            qrCodeUrl: youpiData.qrCodeUrl || qrCodeUrl,
            vpa: youpiData.vpa || this.vpa,
            merchantName: this.merchantName,
            expiresAt: youpiData.expiresAt || expiresAt,
          };
        }
      } catch (err) {
        console.warn("External YouPI API unreachable, falling back to sovereign direct session:", err);
      }
    }

    return {
      orderId,
      amount,
      currency,
      plan,
      upiUri,
      qrCodeUrl,
      vpa: this.vpa,
      merchantName: this.merchantName,
      expiresAt,
    };
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    const signature =
      headers.get("x-gateway-signature") ||
      headers.get("x-youpi-signature") ||
      headers.get("x-signature");

    if (!signature) {
      return {
        isValid: false,
        status: "ignored",
        error: "Missing required signature header",
      };
    }

    if (!this.webhookSecret) {
      return {
        isValid: false,
        status: "ignored",
        error: "YOUPI_WEBHOOK_SECRET not configured on server",
      };
    }

    // Verify timestamp to prevent replay attacks
    const timestampHeader =
      headers.get("x-gateway-timestamp") || headers.get("x-webhook-timestamp");
    if (timestampHeader) {
      const reqTime = parseInt(timestampHeader, 10);
      const currentTime = Date.now();
      if (
        isNaN(reqTime) ||
        currentTime - reqTime > 5 * 60 * 1000 ||
        reqTime - currentTime > 60 * 1000
      ) {
        return {
          isValid: false,
          status: "ignored",
          error: "Timestamp out of allowed window",
        };
      }
    }

    // Verify HMAC
    try {
      const expected = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(rawBody)
        .digest("hex");
      const sigBuf = Buffer.from(signature, "utf8");
      const expBuf = Buffer.from(expected, "utf8");

      if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
        return {
          isValid: false,
          status: "ignored",
          error: "Invalid HMAC signature",
        };
      }
    } catch {
      return {
        isValid: false,
        status: "ignored",
        error: "Signature evaluation error",
      };
    }

    // Parse payload
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return {
        isValid: false,
        status: "ignored",
        error: "Malformed JSON",
      };
    }

    const event = String(payload.event || payload.type || "");
    const orderId = String(payload.orderId || payload.order_id || "");
    const paymentId = String(payload.paymentId || payload.payment_id || `pay_${Date.now()}`);
    const amountInr = Number(payload.amount || payload.amount_inr || 0);
    const amountPaise = Math.round(amountInr * 100);

    if (
      event === "payment.success" ||
      event === "payment.captured" ||
      event === "order.paid" ||
      event === "payment_captured"
    ) {
      return {
        isValid: true,
        orderId,
        paymentId,
        amountPaise,
        status: "paid",
      };
    }

    return {
      isValid: true,
      status: "ignored",
    };
  }

  async fetchOrderStatus(orderId: string): Promise<OrderStatusResult> {
    return {
      orderId,
      status: "awaiting_payment",
      paid: false,
    };
  }
}
