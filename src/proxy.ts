import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  type RateLimitCategory,
} from "@/lib/rate-limit";

function getCategoryForPath(pathname: string): RateLimitCategory {
  if (pathname.startsWith("/api/auth")) return "auth";
  if (pathname.startsWith("/api/billing")) return "billing";
  if (
    pathname.startsWith("/api/ai") ||
    pathname.startsWith("/api/cover-letter") ||
    pathname.startsWith("/api/tailor")
  ) {
    return "ai";
  }
  if (pathname.startsWith("/api/upload") || pathname.includes("/upload")) return "upload";
  return "general";
}

export async function proxy(request: NextRequest) {
  // Apply tiered rate limiting to all API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const category = getCategoryForPath(request.nextUrl.pathname);
    const limitResult = await checkRateLimit(ip, category);

    if (!limitResult.success) {
      return createRateLimitResponse(limitResult);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (logos, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|logos/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
