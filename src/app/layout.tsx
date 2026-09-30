import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
      "Build professional, ATS-friendly resumes with AI assistance.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
