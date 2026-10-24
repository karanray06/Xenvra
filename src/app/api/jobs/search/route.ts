import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanInfo } from "@/lib/plan-limits";
import { ALL_JOB_LISTINGS, calculateDeterministicMatchScore } from "@/lib/jobs/listings";
import { z } from "zod";

const jobSearchSchema = z.object({
  query: z.string().min(1).max(100),
  location: z.string().default("India"),
  remote: z.boolean().default(false),
  experienceLevel: z.enum(["intern", "fresher", "junior", "mid", "senior", "all"]).default("all"),
  resumeId: z.string().uuid().optional(),
});

export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  source: string;
  sourceUrl?: string;
  postedDate: string;
  url: string;
  description: string;
  experienceLevel: string;
  remoteType: string;
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  tags: string[];
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parseResult = jobSearchSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { query, location, remote, experienceLevel, resumeId } = parseResult.data;
    const planInfo = await getUserPlanInfo(user.id);

    // Fetch user resume if supplied to calculate match score
    let resumeSkills: string[] = [];
    if (resumeId) {
      const { data: resume } = await supabase
        .from("resumes")
        .select("data")
        .eq("id", resumeId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (resume?.data) {
        const rData = resume.data as unknown as { skills?: Array<string | { name?: string }> };
        resumeSkills = (rData.skills || [])
          .map((s) => (typeof s === "string" ? s.toLowerCase() : (s?.name ? String(s.name).toLowerCase() : "")))
          .filter(Boolean);
      }
    }

    // Filter jobs matching query and filters
    const qLower = query.toLowerCase();
    const locLower = location.toLowerCase();

    let matches = ALL_JOB_LISTINGS.filter((job) => {
      // Query filter
      if (query !== "all" && query.trim() !== "") {
        const inTitle = job.title.toLowerCase().includes(qLower);
        const inCompany = job.company.toLowerCase().includes(qLower);
        const inDesc = job.description.toLowerCase().includes(qLower);
        const inTags = job.tags.some((t) => t.toLowerCase().includes(qLower));
        if (!inTitle && !inCompany && !inDesc && !inTags) return false;
      }

      // Location filter
      if (locLower !== "all" && locLower !== "india") {
        if (!job.location.toLowerCase().includes(locLower)) return false;
      }

      // Remote filter
      if (remote && job.remoteType !== "remote") {
        return false;
      }

      // Experience filter
      if (experienceLevel !== "all" && job.experienceLevel !== experienceLevel) {
        return false;
      }

      return true;
    });

    if (matches.length === 0) {
      matches = ALL_JOB_LISTINGS;
    }

    // Calculate deterministic ATS match score for each job
    const scoredJobs: NormalizedJob[] = matches.map((job) => {
      const { score, matchedKeywords, missingKeywords } = calculateDeterministicMatchScore(
        job,
        resumeSkills
      );

      return {
        ...job,
        matchScore: score,
        matchedKeywords,
        missingKeywords,
      };
    });

    // Sort by match score descending
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Plan tier gating: Pro gets full results; Free/Beginner gets 3 preview items
    const isPro = planInfo.planId === "pro";
    const visibleJobs = isPro ? scoredJobs : scoredJobs.slice(0, 3);

    return NextResponse.json({
      jobs: visibleJobs,
      totalCount: scoredJobs.length,
      isPro,
      lockedCount: isPro ? 0 : Math.max(0, scoredJobs.length - 3),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Job search error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
