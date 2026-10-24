import Link from "next/link";
import Image from "next/image";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#C9CCD1] bg-[#E6EEF4] py-14">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-[#C9CCD1]">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logos/xenvra-icon.svg"
                alt="Xenvra"
                width={32}
                height={32}
                className="rounded-lg shadow-2xs"
              />
              <span className="text-lg font-bold text-[#241915]">Xenvra Studio</span>
            </Link>
            <p className="text-xs text-[#5E534D] leading-relaxed">
              Modern design studio for career and campus documents. Resumes, 10-slide pitch decks, viva presentations, certificates, and LinkedIn banners.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5A4032]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Vector ATS-Readable Export & Native PPTX
            </div>
          </div>

          {/* Col 2: Templates */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#241915]">Templates</h4>
            <ul className="space-y-2 text-xs text-[#5E534D]">
              <li>
                <Link href="/templates/deck" className="hover:text-[#5A4032] transition-colors">
                  Pitch & Viva Decks (10)
                </Link>
              </li>
              <li>
                <Link href="/templates/resume" className="hover:text-[#5A4032] transition-colors">
                  ATS Resumes (10)
                </Link>
              </li>
              <li>
                <Link href="/templates/banner" className="hover:text-[#5A4032] transition-colors">
                  LinkedIn Banners (4)
                </Link>
              </li>
              <li>
                <Link href="/templates/certificate" className="hover:text-[#5A4032] transition-colors">
                  Award Certificates (4)
                </Link>
              </li>
              <li>
                <Link href="/templates/card" className="hover:text-[#5A4032] transition-colors">
                  Business Cards (4)
                </Link>
              </li>
              <li>
                <Link href="/templates/cover_letter" className="hover:text-[#5A4032] transition-colors">
                  Cover Letters (4)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Guides */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#241915]">Resources</h4>
            <ul className="space-y-2 text-xs text-[#5E534D]">
              <li>
                <Link href="/blog" className="hover:text-[#5A4032] transition-colors">
                  All Career Guides
                </Link>
              </li>
              <li>
                <Link href="/blog/ats-resume-guide-india" className="hover:text-[#5A4032] transition-colors">
                  ATS Resume Guide (India)
                </Link>
              </li>
              <li>
                <Link href="/blog/10-slide-pitch-deck-structure" className="hover:text-[#5A4032] transition-colors">
                  10-Slide Pitch Deck Formula
                </Link>
              </li>
              <li>
                <Link href="/blog/college-viva-presentation-defense" className="hover:text-[#5A4032] transition-colors">
                  College Viva Defense Checklist
                </Link>
              </li>
              <li>
                <Link href="/blog/linkedin-banner-branding-guide" className="hover:text-[#5A4032] transition-colors">
                  LinkedIn Banner Dimensions
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#241915]">Company</h4>
            <ul className="space-y-2 text-xs text-[#5E534D]">
              <li>
                <Link href="/brand" className="hover:text-[#5A4032] transition-colors">
                  Brand Kit & Colors
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings#billing" className="hover:text-[#5A4032] transition-colors">
                  Pricing Plans (Free, ₹29, ₹49)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#5A4032] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#5A4032] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#5A4032] transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <a href="mailto:xenvra.official@gmail.com" className="hover:text-[#5A4032] transition-colors">
                  Support (xenvra.official@gmail.com)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A8F98]">
          <p>© {new Date().getFullYear()} Xenvra. Crafted with the 5-colour official brand system.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px]">
            Ice Silver · Mocha Brown · Platinum Silver · Pale Lavender · Charcoal Ink
          </p>
        </div>
      </div>
    </footer>
  );
}
