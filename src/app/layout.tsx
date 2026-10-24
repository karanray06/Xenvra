import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { getAppBaseUrl } from "@/lib/env";
import { NavigationProgressBar } from "@/components/navigation/progress-bar";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: "Xenvra Studio — Design Resumes, Decks & More — In Minutes",
  description:
    "Your career, beautifully designed. Ready-made templates for resumes, pitch decks, college vivas, and LinkedIn banners with ATS guidance and career profile sync.",
  keywords: [
    "design studio",
    "resume builder",
    "presentation decks",
    "pitch deck templates",
    "career design",
    "ATS resume",
    "college viva presentation",
    "LinkedIn banner generator",
  ],
  openGraph: {
    title: "Xenvra Studio — Design Resumes, Decks & More",
    description:
      "Your career, beautifully designed. Design resumes, presentation decks, project vivas, and career assets in minutes.",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Xenvra Studio — Your career, beautifully designed.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xenvra Studio — Design Resumes, Decks & More",
    description:
      "Your career, beautifully designed. Design resumes, presentation decks, project vivas, and career assets in minutes.",
    images: ["/api/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col bg-surface text-text-primary selection:bg-lav-200 selection:text-text-primary">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
