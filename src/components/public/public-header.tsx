import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#C9CCD1]/50 bg-[#E6EEF4]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logos/xenvra-icon.svg"
            alt="Xenvra"
            width={34}
            height={34}
            className="rounded-lg shadow-2xs"
            priority
          />
          <span className="text-xl font-bold tracking-tight text-[#241915]">
            Xenvra <span className="text-xs font-semibold uppercase tracking-wider text-[#5A4032] ml-1 bg-[#DCD3F2] px-2 py-0.5 rounded-full">Studio</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex text-sm font-medium text-[#5E534D]">
          <Link href="/templates" className="transition-colors hover:text-[#241915]">
            Templates
          </Link>
          <Link href="/templates/presentation" className="transition-colors hover:text-[#241915]">
            Decks
          </Link>
          <Link href="/templates/resume" className="transition-colors hover:text-[#241915]">
            Resumes
          </Link>
          <Link href="/blog" className="transition-colors hover:text-[#241915]">
            Career Guides
          </Link>
          <Link href="/dashboard/settings#billing" className="transition-colors hover:text-[#241915]">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-[#5E534D] transition-colors hover:text-[#241915] sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-xl bg-[#5A4032] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#483328] hover:shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#DCD3F2]" />
            Open Studio
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
