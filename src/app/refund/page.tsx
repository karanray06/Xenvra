import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Refund Policy — Xenvra",
};

export default function RefundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2">
        <Image src="/logos/xenvra-icon.png" alt="Xenvra" width={28} height={28} className="rounded-md" />
        <Image src="/logos/xenvra-wordmark.png" alt="Xenvra" width={70} height={18} className="object-contain" />
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-text-primary">Refund Policy</h1>
      <p className="mb-4 text-sm text-text-tertiary">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="prose prose-sm max-w-none text-text-secondary">
        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">Paid Plans</h2>
        <p>Xenvra paid plans are 30-day passes. They do not auto-renew. You purchase access for a fixed period.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">Refund Eligibility</h2>
        <p>You may request a full refund within 48 hours of purchase if you have not used any paid features (template unlocks, AI actions beyond free tier, or PDF exports without watermark).</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">How to Request a Refund</h2>
        <p>Email <a href="mailto:support@kareixo.me" className="text-accent hover:underline">support@kareixo.me</a> with your registered email and Razorpay payment ID. Refunds are processed within 5-7 business days.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">Non-Refundable</h2>
        <p>Refunds are not available after 48 hours or if paid features have been used. Partial refunds for unused days are not provided.</p>
      </div>
    </div>
  );
}
