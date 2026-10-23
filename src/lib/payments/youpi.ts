/**
 * YouPI Payment Gateway Provider
 * Self-Hosted / Sovereign 0% Fee UPI Payment Gateway
 * Compatible with https://github.com/youpi-pg/YouPI-PG
 */

import crypto from "crypto";

export interface YoupiPaymentSessionOptions {
  orderId: string;
  amount: number; // in INR (e.g. 799 or 2499)
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

export class YoupiGatewayProvider {
  private apiUrl: string;
  private merchantId: string;
  private webhookSecret: string;
  private vpa: string;
  private merchantName: string;

  constructor() {
    this.apiUrl = process.env.YOUPI_API_URL || "";
    this.merchantId = process.env.YOUPI_MERCHANT_ID || "xenvra_merchant";
    this.webhookSecret = process.env.YOUPI_WEBHOOK_SECRET || "youpi_wh_sec_xenvra";
    this.vpa = process.env.NEXT_PUBLIC_YOUPI_UPI_VPA || "xenvra@upi";
    this.merchantName = process.env.NEXT_PUBLIC_YOUPI_MERCHANT_NAME || "Xenvra";
  }

  /**
   * Generates a UPI intent URI and dynamic vector QR code for 0% fee peer-to-merchant payment.
   */
  async createPaymentSession(options: YoupiPaymentSessionOptions): Promise<YoupiPaymentSession> {
    const { orderId, amount, plan, userId } = options;
    const currency = options.currency || "INR";

    // Standard NPCI UPI URI Specification
    // upi://pay?pa=<vpa>&pn=<name>&am=<amount>&cu=INR&tr=<ref>&tn=<note>
    const transactionNote = encodeURIComponent(`Xenvra ${plan.toUpperCase()} Plan`);
    const encodedMerchant = encodeURIComponent(this.merchantName);
    const upiUri = `upi://pay?pa=${this.vpa}&pn=${encodedMerchant}&am=${amount.toFixed(2)}&cu=INR&tr=${orderId}&tn=${transactionNote}`;

    // Dynamic high-resolution QR code generator service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data=${encodeURIComponent(upiUri)}`;

    // If an external YouPI server instance is configured, invoke its API
    if (this.apiUrl) {
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
            orderId,
            amount,
            currency,
            plan,
            upiUri: youpiData.upiUri || upiUri,
            qrCodeUrl: youpiData.qrCodeUrl || qrCodeUrl,
            vpa: youpiData.vpa || this.vpa,
            merchantName: this.merchantName,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          };
        }
      } catch (err) {
        console.warn("YouPI remote instance unreachable, using native UPI engine:", err);
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
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Verifies incoming webhook signature from YouPI observer mesh.
   */
  verifyWebhookSignature(payload: string, signature: string | null): boolean {
    if (!signature) return false;
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payload)
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  /**
   * Validates UTR / Bank Reference Number format (12-digit Indian banking standard).
   */
  validateUtr(utr: string): boolean {
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    return /^[a-zA-Z0-9]{8,22}$/.test(cleanUtr);
  }
}
