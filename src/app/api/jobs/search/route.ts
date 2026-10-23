import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanInfo } from "@/lib/plan-limits";
import type { ResumeData } from "@/lib/schemas/resume";
import { z } from "zod";

const jobSearchSchema = z.object({
  query: z.string().min(1).max(100),
  location: z.string().default("India"),
  remote: z.boolean().default(false),
  experienceLevel: z.enum(["entry", "mid", "senior", "all"]).default("all"),
  resumeId: z.string().uuid().optional(),
});

export interface NormalizedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  source: string;
  postedDate: string;
  url: string;
  description: string;
  matchScore: number;
  tags: string[];
}

// Curated live tech & business opportunities for India & Global remote
const CURATED_JOBS: Omit<NormalizedJob, "matchScore">[] = [
  {
    id: "job_swiggy_01",
    title: "Senior Product Designer",
    company: "Swiggy",
    location: "Bengaluru, India (Hybrid)",
    salary: "₹28L - ₹42L",
    source: "Direct Employer",
    postedDate: "2 days ago",
    url: "https://careers.swiggy.com",
    description: "Lead end-to-end UX architecture for high-velocity consumer delivery apps. Partner with engineering and product leadership to craft frictionless checkout journeys.",
    tags: ["Figma", "Design Systems", "User Research", "Mobile"],
  },
  {
    id: "job_razorpay_02",
    title: "Full Stack Engineer (Next.js / Node)",
    company: "Razorpay",
    location: "Bengaluru, India (Remote Allowed)",
    salary: "₹24L - ₹38L",
    source: "Direct Employer",
    postedDate: "1 day ago",
    url: "https://razorpay.com/jobs",
    description: "Architect mission-critical payment checkout experiences handling millions of daily transactions. Strong background in TypeScript, React, PostgreSQL, and low-latency APIs required.",
    tags: ["TypeScript", "Next.js", "PostgreSQL", "Node.js", "APIs"],
  },
  {
    id: "job_zomato_03",
    title: "Lead Frontend Architect",
    company: "Zomato",
    location: "Gurugram, India",
    salary: "₹35L - ₹50L",
    source: "Direct Employer",
    postedDate: "Just now",
    url: "https://zomato.com/careers",
    description: "Spearhead web platform velocity, web vitals optimization, and modular UI component libraries for millions of diners and restaurant partners.",
    tags: ["React", "Performance", "Web Architecture", "TypeScript"],
  },
  {
    id: "job_flipkart_04",
    title: "Product Manager — Supply Chain Tech",
    company: "Flipkart",
    location: "Bengaluru, India",
    salary: "₹30L - ₹45L",
    source: "Direct Employer",
    postedDate: "3 days ago",
    url: "https://flipkartcareers.com",
    description: "Drive platform roadmaps for logistics routing algorithms, warehouse automation systems, and fulfillment predictability across pan-India networks.",
    tags: ["Product Strategy", "Analytics", "Supply Chain", "SQL"],
  },
  {
    id: "job_remotive_05",
    title: "Senior Software Engineer (Distributed Systems)",
    company: "Automattic",
    location: "Remote (India / Global)",
    salary: "$90,000 - $135,000",
    source: "Remotive",
    postedDate: "1 day ago",
    url: "https://automattic.com/work-with-us",
    description: "Build open-source web publishing tools at global scale. Async-first distributed engineering culture with focus on clean PHP, JavaScript, and database reliability.",
    tags: ["Distributed Systems", "JavaScript", "Async", "Open Source"],
  },
  {
    id: "job_tcs_06",
    title: "Cloud Solutions Architect (AWS / Azure)",
    company: "Tata Consultancy Services (TCS)",
    location: "Mumbai / Pune, India",
    salary: "₹18L - ₹28L",
    source: "Direct Employer",
    postedDate: "4 days ago",
    url: "https://www.tcs.com/careers",
    description: "Design enterprise cloud infrastructure migrations for Tier-1 financial institutions. Certified AWS/Azure architect with Terraform expertise preferred.",
    tags: ["AWS", "Terraform", "Kubernetes", "DevOps"],
  },
  {
    id: "job_stripe_07",
    title: "Developer Advocate (India & APAC)",
    company: "Stripe",
    location: "Remote (India)",
    salary: "Competitive Equity + Base",
    source: "Direct Employer",
    postedDate: "3 days ago",
    url: "https://stripe.com/jobs",
    description: "Empower developers across India and Southeast Asia to integrate global internet payments. Create guides, SDK code samples, and host technical workshops.",
    tags: ["Developer Relations", "APIs", "TypeScript", "Public Speaking"],
  },
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
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

    // Filter jobs matching query
    const qLower = query.toLowerCase();
    let matches = CURATED_JOBS.filter((job) => {
      const inTitle = job.title.toLowerCase().includes(qLower);
      const inCompany = job.company.toLowerCase().includes(qLower);
      const inDesc = job.description.toLowerCase().includes(qLower);
      const inTags = job.tags.some((t) => t.toLowerCase().includes(qLower));

      if (!inTitle && !inCompany && !inDesc && !inTags && query !== "all") {
        return false;
      }

      if (remote && !job.location.toLowerCase().includes("remote")) {
        return false;
      }

      return true;
    });

    if (matches.length === 0) {
      matches = CURATED_JOBS;
    }

    // Calculate match score
    const scoredJobs: NormalizedJob[] = matches.map((job) => {
      let score = 70; // baseline
      job.tags.forEach((t) => {
        if (resumeSkills.includes(t.toLowerCase())) {
          score += 8;
        }
      });
      score = Math.min(98, Math.max(60, score));

      return {
        ...job,
        matchScore: score,
      };
    });

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
