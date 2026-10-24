import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { getAppBaseUrl } from "@/lib/env";
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
  title: "Xenvra — AI-Powered Resume Builder",
  description:
    "Build professional, ATS-friendly resumes with AI assistance. Choose from multiple templates, get real-time feedback, and export to PDF.",
  keywords: [
    "resume builder",
    "AI resume",
    "ATS-friendly resume",
    "professional resume",
    "resume templates",
  ],
  openGraph: {
    title: "Xenvra — AI-Powered Resume Builder",
    description:
      "Build professional, ATS-friendly resumes with AI assistance. Resumes, refined.",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Xenvra — Resumes, refined.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Xenvra — AI-Powered Resume Builder",
    description: "Resumes, refined. Build ATS-friendly resumes in minutes.",
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
        {children}
      </body>
    </html>
  );
}
