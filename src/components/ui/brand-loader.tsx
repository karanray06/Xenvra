"use client";

import Image from "next/image";

interface BrandLoaderProps {
  message?: string;
}

export function BrandLoader({ message = "Loading Xenvra..." }: BrandLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-[#E6EEF4] text-[#5A4032]"
    >
      <div className="relative flex flex-col items-center">
        {/* Subtle pulsing background glow (respects reduced motion) */}
        <div className="absolute -inset-4 rounded-full bg-[#DCD3F2]/60 blur-xl motion-safe:animate-pulse" />

        {/* Logo container */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#5A4032] p-4 shadow-lg shadow-[#5A4032]/15">
          <Image
            src="/logos/xenvra-icon.svg"
            alt="Xenvra"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
          />
        </div>

        {/* Message */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-sm font-semibold tracking-wide text-[#5A4032]/90">
            {message}
          </p>
          <div className="flex gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5A4032]/40 motion-safe:animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#5A4032]/60 motion-safe:animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#5A4032] motion-safe:animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}
