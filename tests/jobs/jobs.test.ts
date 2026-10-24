import { describe, it, expect } from "vitest";
import {
  ALL_JOB_LISTINGS,
  getJobListingById,
  calculateDeterministicMatchScore,
} from "@/lib/jobs/listings";
import { GET as handleGoRedirect } from "@/app/go/[listingId]/route";

describe("Phase G: Jobs Search, Deterministic Match, and Safe Outbound Apply", () => {
  it("contains verified curated job listings with legitimate sources", () => {
    expect(ALL_JOB_LISTINGS.length).toBeGreaterThanOrEqual(10);
    ALL_JOB_LISTINGS.forEach((job) => {
      expect(job.title).toBeTruthy();
      expect(job.company).toBeTruthy();
      expect(job.url).toMatch(/^https:\/\//);
      expect(job.tags.length).toBeGreaterThan(0);
    });
  });

  it("calculates deterministic, explainable match scores without hallucination", () => {
    const job = getJobListingById("job_razorpay_02");
    expect(job).toBeDefined();

    if (job) {
      // Candidate with TypeScript, Next.js, and PostgreSQL
      const candidateSkills = ["TypeScript", "Next.js", "PostgreSQL", "Docker"];
      const match = calculateDeterministicMatchScore(job, candidateSkills);

      expect(match.score).toBeGreaterThanOrEqual(70);
      expect(match.matchedKeywords).toContain("TypeScript");
      expect(match.matchedKeywords).toContain("Next.js");
      expect(match.matchedKeywords).toContain("PostgreSQL");
      expect(match.missingKeywords).toContain("Node.js");

      // Verify deterministic reproducibility (same inputs must yield identical scores)
      const repeatMatch = calculateDeterministicMatchScore(job, candidateSkills);
      expect(repeatMatch.score).toBe(match.score);
      expect(repeatMatch.matchedKeywords).toEqual(match.matchedKeywords);
    }
  });

  it("safe outbound redirect /go/[listingId] redirects via 302 to employer URL with referrer policy", async () => {
    const request = new Request("http://localhost:3000/go/job_swiggy_01");
    const response = await handleGoRedirect(request, {
      params: Promise.resolve({ listingId: "job_swiggy_01" }),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("careers.swiggy.com");
    expect(response.headers.get("referrer-policy")).toBe("no-referrer-when-downgrade");
  });

  it("safe outbound redirect rejects unknown listing ID safely to /dashboard/jobs", async () => {
    const request = new Request("http://localhost:3000/go/malicious_unknown_id");
    const response = await handleGoRedirect(request, {
      params: Promise.resolve({ listingId: "malicious_unknown_id" }),
    });

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toContain("/dashboard/jobs");
  });
});
