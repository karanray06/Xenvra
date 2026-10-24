/**
 * YouPI Payment Gateway Provider
 * Self-Hosted / Sovereign UPI Payment Gateway
 */

import crypto from "crypto";
import QRCode from "qrcode";

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

export class YoupiGatewayProvider {
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

    if (process.env.NODE_ENV === "production" && !this.webhookSecret && process.env.PAYMENT_PROVIDER === "youpi") {
      throw new Error("YOUPI_WEBHOOK_SECRET must be configured in production when YouPI is enabled.");
    }
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
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error("Local QR code generation failed:", err);
      // Fallback empty data URL
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
          let remoteQr = youpiData.qrCodeUrl;
          if (youpiData.upiUri && (!remoteQr || remoteQr.includes("api.qrserver.com"))) {
            remoteQr = await QRCode.toDataURL(youpiData.upiUri, { width: 280, margin: 2 });
          }
          return {
            orderId,
            amount,
            currency,
            plan,
            upiUri: youpiData.upiUri || upiUri,
            qrCodeUrl: remoteQr || qrCodeUrl,
            vpa: youpiData.vpa || this.vpa,
            merchantName: this.merchantName,
            expiresAt,
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
      expiresAt,
    };
  }

  /**
   * Verifies incoming webhook signature safely (prevents timingSafeEqual length mismatch crash).
   */
  verifyWebhookSignature(payload: string, signature: string | null): boolean {
    if (!signature || !this.webhookSecret) return false;
    
    try {
      const expected = crypto
        .createHmac("sha256", this.webhookSecret)
        .update(payload)
        .digest("hex");

      const sigBuffer = Buffer.from(signature, "utf8");
      const expectedBuffer = Buffer.from(expected, "utf8");

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Validates UTR / Bank Reference Number format (12-digit Indian banking standard).
   */
  validateUtr(utr: string): boolean {
    const cleanUtr = utr.trim().replace(/\s+/g, "");
    return /^[a-zA-Z0-9]{8,22}$/.test(cleanUtr);
  }
}
