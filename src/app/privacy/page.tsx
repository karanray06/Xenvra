import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy — Xenvra",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2">
        <Image src="/logos/xenvra-icon.svg" alt="Xenvra" width={28} height={28} className="rounded-md" />
        <Image src="/logos/xenvra-wordmark.svg" alt="Xenvra" width={74} height={18} className="object-contain" />
      </Link>

      <h1 className="mb-6 text-3xl font-bold text-text-primary">Privacy Policy</h1>
      <p className="mb-4 text-sm text-text-tertiary">Last updated: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="prose prose-sm max-w-none text-text-secondary space-y-4">
        <h2 className="text-lg font-semibold text-text-primary mt-8 mb-2">1. Data We Collect</h2>
        <p>We collect only the personal information required to deliver our resume building and AI services: your verified email address and full name (received from Google OAuth or email magic link), resume text and structured documents you create, and operational metrics (page hits, feature actions). We do NOT collect GPS location, financial credentials, credit card numbers, or biometric data.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">2. Purpose &amp; Lawful Basis</h2>
        <p>Your data is processed strictly to furnish resume compilation, PDF/DOCX generation, ATS scoring, and AI rewriting. We do NOT sell, lease, or monetize your personal or professional data to recruiters, marketers, or data brokers.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">3. Data Retention &amp; Storage Isolation</h2>
        <p>Your data is hosted in encrypted PostgreSQL databases via Supabase, with strict Row-Level Security (RLS) ensuring that your records are accessible only to your authenticated identity. Active account documents are retained until you elect to delete them. In accordance with zero-log principles, resume content is never emitted into persistent application runtime logs.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">4. AI Processing &amp; Cross-Border Transfers</h2>
        <p>When you explicitly trigger AI enhancement or cover letter generation, your drafted text is securely transmitted via TLS 1.3 to our LLM inference providers (Groq Inc. and OpenAI) located in the United States/EU. Such transmission is stateless and processed for transient generation only. We prohibit our AI providers from using your resume text to train foundation models.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">5. Cookies &amp; Local Storage</h2>
        <p>We employ only strictly necessary HTTP-only authentication session cookies managed via Supabase SSR. We do not use third-party advertising cookies, cross-site tracking pixels, or marketing beacons.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">6. Children&apos;s Privacy</h2>
        <p>Xenvra is intended for professionals and job seekers who have reached the age of majority (18 years or older). We do not knowingly solicit or collect personal information from minors.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">7. Account Deletion &amp; Data Erasure</h2>
        <p>You maintain complete ownership of your data. You may execute permanent account deletion at any time in Settings. Deletion irreversibly cascades across all database tables (profiles, resumes, cover letters, tracker items, versions, and payment history), removing your data from active storage immediately.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">8. Data Breach Notification</h2>
        <p>In the unlikely event of a verified data breach impacting your personal information, Xenvra will notify affected users via their registered email address without undue delay, outlining the nature of the event and recommended remedial steps.</p>

        <h2 className="text-lg font-semibold text-text-primary mt-6 mb-2">9. Indian DPDP Act (2023) Compliance &amp; Grievance Officer</h2>
        <p>In alignment with the Digital Personal Data Protection Act (DPDP Act, 2023), Indian data principals hold rights of access, correction, erasure, and grievance redressal. For any statutory requests, data corrections, or security disclosures, contact our designated Grievance Officer at <a href="mailto:xenvra.official@gmail.com" className="text-accent font-semibold hover:underline">xenvra.official@gmail.com</a> (Subject: <em>DPDP Grievance Officer</em>).</p>
      </div>
    </div>
  );
}
