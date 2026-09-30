"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Shield,
  Mail,
  Loader2,
  AlertCircle,
} from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const authError = searchParams.get("error");

  const supabase = createClient();

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMagicLinkSent(true);
    }

    setLoading(false);
  }

  return (
    <div className="animate-slide-up">
      {/* Logo */}
      <Link href="/" className="mb-12 inline-flex items-center gap-3">
        <Image
          src="/logos/xenvra-icon.png"
          alt="Xenvra"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <Image
          src="/logos/xenvra-wordmark.png"
          alt="Xenvra"
          width={100}
          height={24}
          className="object-contain"
        />
      </Link>

      {/* Heading */}
      <h1 className="mb-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
        Welcome to Xenvra
      </h1>
      <p className="mb-10 text-base leading-relaxed text-text-secondary">
        Sign in to create, edit, and manage your professional resumes.
      </p>

      {/* Error Banner */}
      {(error || authError) && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error || "Authentication failed. Please try again."}
        </div>
      )}

      {/* Magic Link Sent */}
      {magicLinkSent ? (
        <div className="rounded-xl border border-success/20 bg-success-light p-6 text-center">
          <Mail className="mx-auto mb-3 h-10 w-10 text-success" />
          <h2 className="mb-2 text-lg font-semibold text-text-primary">
            Check your email
          </h2>
          <p className="mb-4 text-sm text-text-secondary">
            We sent a sign-in link to{" "}
            <span className="font-medium text-text-primary">{email}</span>
          </p>
          <button
            onClick={() => setMagicLinkSent(false)}
            className="text-sm font-medium text-accent hover:text-accent-hover"
          >
            Use a different email
          </button>
        </div>
      ) : (
        <>
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-surface px-4 py-3.5 text-sm font-semibold text-text-primary shadow-sm transition-all hover:border-border-strong hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09A6.97 6.97 0 0 1 5.49 12c0-.72.13-1.43.35-2.09V7.07H2.18A11.01 11.01 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wider text-text-tertiary">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-text-secondary"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              Send magic link
            </button>
          </form>

          {/* Features list */}
          <div className="mt-10 space-y-3">
            {[
              { icon: FileText, text: "Professional resume templates" },
              { icon: Sparkles, text: "AI-powered writing assistant" },
              { icon: Shield, text: "Your data stays private" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm text-text-secondary"
              >
                <Icon className="h-4 w-4 text-accent" />
                {text}
              </div>
            ))}
          </div>

          {/* Terms */}
          <p className="mt-8 text-center text-xs text-text-tertiary">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="underline hover:text-text-secondary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline hover:text-text-secondary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left — Login Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-16 lg:px-20 xl:max-w-[580px]">
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Right — Decorative Visual */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 lg:flex">
        {/* Gradient blob */}
        <div className="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-brand-300/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-brand-400/20 blur-3xl" />

        {/* Floating resume cards */}
        <div className="relative flex items-center justify-center">
          <div className="absolute -translate-x-10 -rotate-6 opacity-60">
            <div className="h-[420px] w-[300px] rounded-2xl bg-white/80 shadow-xl backdrop-blur" />
          </div>
          <div className="translate-x-10 rotate-3">
            <div className="flex h-[420px] w-[300px] flex-col rounded-2xl bg-white p-8 shadow-2xl">
              {/* Mock resume skeleton */}
              <div className="mb-5 h-14 w-14 rounded-full bg-brand-100" />
              <div className="mb-3 h-6 w-36 rounded bg-brand-100" />
              <div className="mb-6 h-4 w-24 rounded bg-surface-tertiary" />
              <div className="mb-5 h-px bg-border" />
              <div className="space-y-3">
                <div className="h-3 w-full rounded bg-surface-tertiary" />
                <div className="h-3 w-5/6 rounded bg-surface-tertiary" />
                <div className="h-3 w-4/6 rounded bg-surface-tertiary" />
              </div>
              <div className="mt-6 space-y-3">
                <div className="h-3 w-full rounded bg-surface-tertiary" />
                <div className="h-3 w-5/6 rounded bg-surface-tertiary" />
              </div>
              <div className="mt-auto flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-16 rounded-full bg-brand-50"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
