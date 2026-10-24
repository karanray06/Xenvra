import { NextResponse } from "next/server";
import { z } from "zod";

export interface ParseJsonResult<T> {
  data?: T;
  errorResponse?: NextResponse;
}

/**
 * Safely parses request body as JSON with optional Zod schema validation.
 */
export async function parseJson<T>(
  request: Request,
  schema?: z.ZodType<T>
): Promise<ParseJsonResult<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      errorResponse: NextResponse.json(
        { error: "Malformed or invalid JSON payload" },
        { status: 400 }
      ),
    };
  }

  if (schema) {
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      return {
        errorResponse: NextResponse.json(
          {
            error: "Validation failed",
            details: parseResult.error.format(),
          },
          { status: 400 }
        ),
      };
    }
    return { data: parseResult.data };
  }

  return { data: body as T };
}

/**
 * Checks Origin and Sec-Fetch-Site headers on cookie-authenticated mutating requests
 * to guard against cross-origin state-changing attacks.
 */
export function verifyMutationOrigin(request: Request): boolean {
  // If not a mutating request, pass
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") {
    return true;
  }

  const origin = request.headers.get("origin");
  const secFetchSite = request.headers.get("sec-fetch-site");

  // If Sec-Fetch-Site is present, cross-site is forbidden on mutating endpoints
  if (secFetchSite && secFetchSite === "cross-site") {
    return false;
  }

  // If Origin header is present, verify against allowed hosts
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const host = request.headers.get("host") || "";
      if (originUrl.host === host) {
        return true;
      }
      // Allow localhost in dev
      if (
        process.env.NODE_ENV !== "production" &&
        (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1")
      ) {
        return true;
      }
      // Production domain check
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
      if (appUrl && origin.includes(appUrl.replace(/^https?:\/\//, ""))) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  return true;
}
