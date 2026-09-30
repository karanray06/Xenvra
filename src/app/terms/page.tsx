import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Terms of Service — Xenvra",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2">
        <Image src="/logos/xenvra-icon.png" alt="Xenvra" width={28} height={28} className="rounded-md" />
        <Image src="/logos/xenvra-wordmark.png" alt="Xenvra" width={70} height={18} className="object-contain" />
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-text-primary">Terms of Service</h1>
      <p className="mb-4 text-sm text-text-tertiary">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="prose prose-sm max-w-none text-text-secondary">
        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">1. Acceptance</h2>
        <p>By using Xenvra (&quot;the Service&quot;), you agree to these Terms. If you do not agree, please do not use the Service.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">2. The Service</h2>
        <p>Xenvra is an AI-powered resume builder that helps you create, edit, and export professional resumes. We provide templates, AI writing assistance, and PDF export functionality.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">3. Accounts</h2>
        <p>You must create an account to use the Service. You are responsible for maintaining the security of your account credentials. You must be at least 13 years old to use the Service.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">4. Your Content</h2>
        <p>You own all resume content you create. We do not claim ownership of your data. We store your data securely and do not sell or share it with third parties for advertising purposes.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">5. Payments</h2>
        <p>Paid plans are 30-day passes purchased via Razorpay. Prices are in INR. Plans do not auto-renew. See our Refund Policy for details on refunds.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">6. AI Disclaimer</h2>
        <p>AI-generated suggestions are meant as writing assistance only. You are responsible for verifying the accuracy of all content in your resume. The AI does not invent qualifications, certifications, or employment history.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">7. Termination</h2>
        <p>You may delete your account at any time. We reserve the right to suspend accounts that violate these terms. Upon deletion, all your data will be permanently removed.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">8. Contact</h2>
        <p>For questions about these terms, email <a href="mailto:support@kareixo.me" className="text-accent hover:underline">support@kareixo.me</a>.</p>
      </div>
    </div>
  );
}
