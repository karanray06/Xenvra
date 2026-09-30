import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy — Xenvra",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2">
        <Image src="/logos/xenvra-icon.png" alt="Xenvra" width={28} height={28} className="rounded-md" />
        <Image src="/logos/xenvra-wordmark.png" alt="Xenvra" width={70} height={18} className="object-contain" />
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-text-primary">Privacy Policy</h1>
      <p className="mb-4 text-sm text-text-tertiary">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="prose prose-sm max-w-none text-text-secondary">
        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">1. Data We Collect</h2>
        <p>We collect: your email address and name (from your login provider), resume content you create, and basic usage analytics (page views, feature usage). We do NOT collect: browsing history, location data, or data from other apps.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">2. How We Use Your Data</h2>
        <p>Your data is used solely to provide the Service: storing your resumes, rendering templates, providing AI suggestions, and processing payments. We never sell your data.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">3. Data Storage</h2>
        <p>Your data is stored securely in Supabase (PostgreSQL) with row-level security policies. Only you can access your resume data. We do not store resume content in application logs.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">4. AI Processing</h2>
        <p>When you use AI features, your resume content is sent to our LLM provider for processing. We do not store AI conversation logs containing your resume content beyond the current session.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">5. Third-Party Services</h2>
        <p>We use: Supabase (auth &amp; database), Vercel (hosting), Razorpay (payments), and an LLM provider (AI features). Each has its own privacy policy.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">6. Account Deletion</h2>
        <p>You can delete your account at any time from Settings. This permanently deletes all your resumes, profile data, and payment history. This action is irreversible.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-3">7. Contact</h2>
        <p>For privacy questions, email <a href="mailto:support@kareixo.me" className="text-accent hover:underline">support@kareixo.me</a>.</p>
      </div>
    </div>
  );
}
