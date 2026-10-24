import QRCode from "qrcode";
import type {
  PaymentProvider,
  CreateOrderOptions,
  PaymentOrder,
  WebhookVerificationResult,
  OrderStatusResult,
} from "./provider";

export class DirectUpiProvider implements PaymentProvider {
  name = "direct_upi" as const;
  public vpa: string;
  public merchantName: string;

  constructor() {
    this.vpa = process.env.NEXT_PUBLIC_UPI_VPA || process.env.NEXT_PUBLIC_YOUPI_UPI_VPA || "7980398203@fam";
    this.merchantName = process.env.NEXT_PUBLIC_MERCHANT_NAME || "Xenvra";
  }

  async createOrder(options: CreateOrderOptions): Promise<PaymentOrder> {
    const { orderId, amountPaise, currency = "INR", plan } = options;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const providerOrderId = `upi_${orderId}`;

    const amountInr = (amountPaise / 100).toFixed(2);
    const transactionNote = encodeURIComponent(`Xenvra ${plan.toUpperCase()} Plan`);
    const encodedMerchant = encodeURIComponent(this.merchantName);

    // Standard NPCI UPI URI Scheme
    const upiUri = `upi://pay?pa=${this.vpa}&pn=${encodedMerchant}&am=${amountInr}&cu=${currency}&tr=${providerOrderId}&tn=${transactionNote}`;

    // Generate high-contrast, localized QR code in brand charcoal ink
    let qrCodeUrl = "";
    try {
      qrCodeUrl = await QRCode.toDataURL(upiUri, {
        width: 320,
        margin: 2,
        color: {
          dark: "#241915",
          light: "#FFFFFF",
        },
      });
    } catch (err) {
      console.error("[DirectUPI] QR Code generation error:", err);
    }

    return {
      orderId,
      provider: "direct_upi",
      providerOrderId,
      amountPaise,
      currency,
      plan,
      upiUri,
      qrCodeUrl,
      vpa: this.vpa,
      merchantName: this.merchantName,
      expiresAt,
    };
  }

  async verifyWebhook(_rawBody: string, _headers: Headers): Promise<WebhookVerificationResult> {
    return {
      isValid: false,
      status: "ignored",
      error: "Direct UPI uses client-to-server UTR verification route, not third-party webhooks.",
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
