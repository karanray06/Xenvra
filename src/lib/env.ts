import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required in production"),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  VERCEL_URL: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_YOUPI_UPI_VPA: z.string().optional(),
  NEXT_PUBLIC_YOUPI_MERCHANT_NAME: z.string().optional(),
  YOUPI_API_URL: z.string().optional(),
  YOUPI_MERCHANT_ID: z.string().optional(),
  YOUPI_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  CRON_SECRET: z.string().min(1, "CRON_SECRET is required in production"),
});

export function validateEnv() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    // In local development, allow partial configuration with helpful warnings
    const result = envSchema.partial().safeParse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      VERCEL_URL: process.env.VERCEL_URL,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_YOUPI_UPI_VPA: process.env.NEXT_PUBLIC_YOUPI_UPI_VPA,
      NEXT_PUBLIC_YOUPI_MERCHANT_NAME: process.env.NEXT_PUBLIC_YOUPI_MERCHANT_NAME,
      YOUPI_API_URL: process.env.YOUPI_API_URL,
      YOUPI_MERCHANT_ID: process.env.YOUPI_MERCHANT_ID,
      YOUPI_WEBHOOK_SECRET: process.env.YOUPI_WEBHOOK_SECRET,
      RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
      CRON_SECRET: process.env.CRON_SECRET,
    });

    if (!result.success) {
      console.warn("⚠️ Dev environment variable validation warning:", result.error.format());
    }

    return result.data;
  }

  // In production, enforce required variables and fail closed
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_YOUPI_UPI_VPA: process.env.NEXT_PUBLIC_YOUPI_UPI_VPA,
    NEXT_PUBLIC_YOUPI_MERCHANT_NAME: process.env.NEXT_PUBLIC_YOUPI_MERCHANT_NAME,
    YOUPI_API_URL: process.env.YOUPI_API_URL,
    YOUPI_MERCHANT_ID: process.env.YOUPI_MERCHANT_ID,
    YOUPI_WEBHOOK_SECRET: process.env.YOUPI_WEBHOOK_SECRET,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
  });

  if (!result.success) {
    const formatted = JSON.stringify(result.error.format(), null, 2);
    console.error("FATAL: Missing required production environment variables:\n", formatted);
    throw new Error(`Production environment configuration error: Missing required variables: ${formatted}`);
  }

  return result.data;
}

/**
 * Returns the effective base URL for the app (handles custom domain, Vercel preview, localhost).
 */
export function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
