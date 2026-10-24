import { NextResponse } from "next/server";
import { getJobListingById } from "@/lib/jobs/listings";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const { listingId } = await params;
  const listing = getJobListingById(listingId);

  if (!listing) {
    // If unknown listing ID, redirect safely to dashboard jobs
    return NextResponse.redirect(new URL("/dashboard/jobs", request.url), 302);
  }

  // Validate that destination URL is valid HTTPS (no open redirect / javascript: / file:)
  try {
    const destUrl = new URL(listing.url);
    if (destUrl.protocol !== "https:") {
      return NextResponse.redirect(new URL("/dashboard/jobs", request.url), 302);
    }

    // Log outbound employer redirect
    console.log(`[Job Outbound Redirect] User applying to listing ${listing.id} (${listing.company} - ${listing.title})`);

    const response = NextResponse.redirect(destUrl.toString(), 302);
    response.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
    response.headers.set("X-Content-Type-Options", "nosniff");
    return response;
  } catch {
    return NextResponse.redirect(new URL("/dashboard/jobs", request.url), 302);
  }
}
