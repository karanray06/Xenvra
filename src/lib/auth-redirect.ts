/**
 * Validates and sanitizes a redirect path.
 * Accepts `next` only if it starts with a single `/` and NOT `//` or `/\`.
 * All other inputs (protocols, relative domains, null/empty) default to `/dashboard`.
 */
export function getSafeRedirectPath(next: string | null | undefined): string {
  if (!next || typeof next !== "string") {
    return "/dashboard";
  }

  // Must start with single '/', and NOT '//' or '/\'
  if (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")) {
    return next;
  }

  return "/dashboard";
}
