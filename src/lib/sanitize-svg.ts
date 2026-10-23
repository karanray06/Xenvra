/**
 * Xenvra High-Security SVG Sanitizer
 * Strips script tags, event handlers, foreignObject, javascript URIs, and dangerous elements.
 */

export function sanitizeSvg(rawSvg: string): string {
  if (!rawSvg || typeof rawSvg !== "string") return "";

  // 1. Enforce max input length (1MB cap)
  if (rawSvg.length > 1024 * 1024) {
    throw new Error("SVG payload exceeds maximum permissible size of 1MB.");
  }

  // 2. Reject XML entity declarations (Billion Laughs / XXE attack prevention)
  if (/<!ENTITY/i.test(rawSvg) || /<!DOCTYPE/i.test(rawSvg)) {
    rawSvg = rawSvg.replace(/<!DOCTYPE[^>]*>/gi, "").replace(/<!ENTITY[^>]*>/gi, "");
  }

  let cleaned = rawSvg;

  // 3. Remove <script> and </script> and everything inside
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 4. Remove <foreignObject> tags and contents (prevents embedding arbitrary HTML/JS)
  cleaned = cleaned.replace(/<foreignObject\b[^<]*(?:(?!<\/foreignObject>)<[^<]*)*<\/foreignObject>/gi, "");

  // 5. Remove dangerous tags: iframe, object, embed, applet, meta, link
  cleaned = cleaned.replace(/<(iframe|object|embed|applet|meta|link)\b[^>]*\/?>/gi, "");

  // 6. Strip all on* event handler attributes (e.g. onload, onerror, onclick, onmouseover)
  cleaned = cleaned.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // 7. Neutralize javascript: or data: URIs inside href, xlink:href, or src
  cleaned = cleaned.replace(/(href|xlink:href|src)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1=""');
  cleaned = cleaned.replace(/(href|xlink:href|src)\s*=\s*["']\s*data:text\/html[^"']*["']/gi, '$1=""');

  return cleaned.trim();
}
