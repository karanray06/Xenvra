import crypto from "crypto";
import QRCode from "qrcode";
import type {
  PaymentProvider,
  CreateOrderOptions,
  PaymentOrder,
  WebhookVerificationResult,
  OrderStatusResult,
} from "./provider";

export class RazorpayProvider implements PaymentProvider {
  name = "razorpay" as const;
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;
  private merchantName: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    this.merchantName = process.env.NEXT_PUBLIC_MERCHANT_NAME || "Xenvra";

    if (
      process.env.NODE_ENV === "production" &&
      process.env.PAYMENT_PROVIDER === "razorpay" &&
      (!this.keyId || !this.keySecret || !this.webhookSecret)
    ) {
      throw new Error(
        "RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and RAZORPAY_WEBHOOK_SECRET must be configured in production."
      );
    }
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrder> {
    const { orderId, amountPaise, currency = "INR", plan, userId, customerEmail } = options;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    let providerOrderId = `order_${orderId}`;

    // If Razorpay API credentials are configured, call the Razorpay Orders API
    if (this.keyId && this.keySecret) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
        const res = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: amountPaise,
            currency,
            receipt: orderId.slice(0, 40),
            notes: {
              userId,
              plan,
              customerEmail: customerEmail || "",
            },
          }),
        });

        if (res.ok) {
          const rzpData = (await res.json()) as { id: string };
          providerOrderId = rzpData.id;
        } else {
          console.warn("[Razorpay API] Orders call returned error status, using formatted order ID:", res.status);
        }
      } catch (err) {
        console.error("[Razorpay API] Orders call exception:", err);
      }
    }

    // Standard NPCI UPI URI Specification
    const amountInr = (amountPaise / 100).toFixed(2);
    const transactionNote = encodeURIComponent(`Xenvra ${plan.toUpperCase()} Plan`);
    const encodedMerchant = encodeURIComponent(this.merchantName);
    const vpa = process.env.NEXT_PUBLIC_UPI_VPA || "xenvra@upi";
    const upiUri = `upi://pay?pa=${vpa}&pn=${encodedMerchant}&am=${amountInr}&cu=INR&tr=${providerOrderId}&tn=${transactionNote}`;

    // Generate local QR code without third-party leak
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
      console.error("[Razorpay] QR generation failed:", err);
    }

    return {
      orderId,
      provider: "razorpay",
      providerOrderId,
      amountPaise,
      currency,
      plan,
      upiUri,
      qrCodeUrl,
      vpa,
      merchantName: this.merchantName,
      expiresAt,
      keyId: this.keyId || "rzp_test_placeholder",
    };
  }

  async verifyWebhook(rawBody: string, headers: Headers): Promise<WebhookVerificationResult> {
    const signature = headers.get("x-razorpay-signature");

    if (!signature) {
      return {
        isValid: false,
        status: "ignored",
        error: "Missing required x-razorpay-signature header",
      };
    }

    if (!this.webhookSecret) {
      return {
        isValid: false,
        status: "ignored",
        error: "RAZORPAY_WEBHOOK_SECRET not configured on server",
      };
    }

    // Verify HMAC signature using timingSafeEqual
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
          error: "Invalid Razorpay HMAC signature",
        };
      }
    } catch {
      return {
        isValid: false,
        status: "ignored",
        error: "Signature comparison error",
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
        error: "Malformed JSON payload",
      };
    }

    const event = String(payload.event || "");

    // Events that signify payment capture / success
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = (payload.payload as Record<string, unknown>)?.payment as
        | { entity?: { id?: string; order_id?: string; amount?: number } }
        | undefined;
      const orderEntity = (payload.payload as Record<string, unknown>)?.order as
        | { entity?: { id?: string; amount?: number } }
        | undefined;

      const paymentId = paymentEntity?.entity?.id;
      const orderId = paymentEntity?.entity?.order_id || orderEntity?.entity?.id;
      const amountPaise = paymentEntity?.entity?.amount || orderEntity?.entity?.amount;

      return {
        isValid: true,
        orderId: orderId ? String(orderId) : undefined,
        paymentId: paymentId ? String(paymentId) : undefined,
        amountPaise: typeof amountPaise === "number" ? amountPaise : undefined,
        status: "paid",
      };
    }

    if (event === "payment.failed") {
      const paymentEntity = (payload.payload as Record<string, unknown>)?.payment as
        | { entity?: { id?: string; order_id?: string } }
        | undefined;
      return {
        isValid: true,
        orderId: paymentEntity?.entity?.order_id,
        paymentId: paymentEntity?.entity?.id,
        status: "failed",
      };
    }

    // Acknowledge other events (e.g. refund.processed, dispute, etc.)
    return {
      isValid: true,
      status: "ignored",
    };
  }

  async fetchOrderStatus(orderId: string): Promise<OrderStatusResult> {
    if (this.keyId && this.keySecret) {
      try {
        const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
        const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
          headers: { Authorization: `Basic ${auth}` },
        });

        if (res.ok) {
          const data = (await res.json()) as { status: string; amount?: number };
          const isPaid = data.status === "paid";
          return {
            orderId,
            status: isPaid ? "paid" : (data.status as OrderStatusResult["status"]),
            paid: isPaid,
            amountPaise: data.amount,
          };
        }
      } catch (err) {
        console.error("[Razorpay] Order status fetch error:", err);
      }
    }

    return {
      orderId,
      status: "awaiting_payment",
      paid: false,
    };
  }
}
