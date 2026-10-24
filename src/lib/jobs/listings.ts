export interface JobSource {
  name: string;
  attribution: string;
  url: string;
}

export interface JobListing {
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
  experienceLevel: "intern" | "fresher" | "junior" | "mid" | "senior";
  remoteType: "remote" | "hybrid" | "on-site";
  tags: string[];
}

export const JOB_SOURCES: Record<string, JobSource> = {
  direct: { name: "Direct Employer", attribution: "Verified Career Portal", url: "https://xenvra.com" },
  remotive: { name: "Remotive", attribution: "Remotive Public Job Feed", url: "https://remotive.com" },
  arbeitnow: { name: "Arbeitnow", attribution: "Arbeitnow Job Board", url: "https://arbeitnow.com" },
  adzuna: { name: "Adzuna India", attribution: "Adzuna Career Search", url: "https://adzuna.in" },
};

export const ALL_JOB_LISTINGS: JobListing[] = [
  {
    id: "job_swiggy_01",
    title: "Senior Product Designer",
    company: "Swiggy",
    location: "Bengaluru, India",
    salary: "₹28L - ₹42L",
    source: "Direct Employer",
    sourceUrl: "https://careers.swiggy.com",
    postedDate: "2 days ago",
    url: "https://careers.swiggy.com",
    description: "Lead end-to-end UX architecture for high-velocity consumer delivery apps. Partner with engineering and product leadership to craft frictionless checkout journeys.",
    experienceLevel: "mid",
    remoteType: "hybrid",
    tags: ["Figma", "Design Systems", "User Research", "Mobile", "UI/UX"],
  },
  {
    id: "job_razorpay_02",
    title: "Full Stack Engineer (Next.js / Node)",
    company: "Razorpay",
    location: "Bengaluru, India",
    salary: "₹24L - ₹38L",
    source: "Direct Employer",
    sourceUrl: "https://razorpay.com/jobs",
    postedDate: "1 day ago",
    url: "https://razorpay.com/jobs",
    description: "Architect mission-critical payment checkout experiences handling millions of daily transactions. Strong background in TypeScript, React, PostgreSQL, and low-latency APIs required.",
    experienceLevel: "mid",
    remoteType: "remote",
    tags: ["TypeScript", "Next.js", "PostgreSQL", "Node.js", "APIs", "React"],
  },
  {
    id: "job_zomato_03",
    title: "Lead Frontend Architect",
    company: "Zomato",
    location: "Gurugram, India",
    salary: "₹35L - ₹50L",
    source: "Direct Employer",
    sourceUrl: "https://zomato.com/careers",
    postedDate: "Just now",
    url: "https://zomato.com/careers",
    description: "Spearhead web platform velocity, web vitals optimization, and modular UI component libraries for millions of diners and restaurant partners.",
    experienceLevel: "senior",
    remoteType: "hybrid",
    tags: ["React", "Performance", "Web Architecture", "TypeScript", "TailwindCSS"],
  },
  {
    id: "job_flipkart_04",
    title: "Product Manager — Supply Chain Tech",
    company: "Flipkart",
    location: "Bengaluru, India",
    salary: "₹30L - ₹45L",
    source: "Direct Employer",
    sourceUrl: "https://flipkartcareers.com",
    postedDate: "3 days ago",
    url: "https://flipkartcareers.com",
    description: "Drive platform roadmaps for logistics routing algorithms, warehouse automation systems, and fulfillment predictability across pan-India networks.",
    experienceLevel: "mid",
    remoteType: "on-site",
    tags: ["Product Strategy", "Analytics", "Supply Chain", "SQL", "Agile"],
  },
  {
    id: "job_remotive_05",
    title: "Senior Software Engineer (Distributed Systems)",
    company: "Automattic",
    location: "Remote (India / Global)",
    salary: "$90,000 - $135,000",
    source: "Remotive",
    sourceUrl: "https://remotive.com",
    postedDate: "1 day ago",
    url: "https://automattic.com/work-with-us",
    description: "Build open-source web publishing tools at global scale. Async-first distributed engineering culture with focus on clean PHP, JavaScript, and database reliability.",
    experienceLevel: "senior",
    remoteType: "remote",
    tags: ["Distributed Systems", "JavaScript", "Async", "Open Source", "PHP"],
  },
  {
    id: "job_tcs_06",
    title: "Cloud Solutions Architect (AWS / Azure)",
    company: "Tata Consultancy Services (TCS)",
    location: "Mumbai / Pune, India",
    salary: "₹18L - ₹28L",
    source: "Direct Employer",
    sourceUrl: "https://www.tcs.com/careers",
    postedDate: "4 days ago",
    url: "https://www.tcs.com/careers",
    description: "Design enterprise cloud infrastructure migrations for Tier-1 financial institutions. Certified AWS/Azure architect with Terraform expertise preferred.",
    experienceLevel: "mid",
    remoteType: "hybrid",
    tags: ["AWS", "Azure", "Cloud Architecture", "Terraform", "DevOps"],
  },
  {
    id: "job_cred_07",
    title: "Backend Engineer (Go / Microservices)",
    company: "CRED",
    location: "Bengaluru, India",
    salary: "₹32L - ₹50L",
    source: "Direct Employer",
    sourceUrl: "https://cred.club/careers",
    postedDate: "1 day ago",
    url: "https://cred.club/careers",
    description: "Build high-throughput transaction processing pipelines, reward ledgers, and credit card management systems in Go with Kafka and DynamoDB.",
    experienceLevel: "mid",
    remoteType: "hybrid",
    tags: ["Go", "Kafka", "Microservices", "DynamoDB", "Distributed Systems"],
  },
  {
    id: "job_zerodha_08",
    title: "Frontend Developer (Vue / WebGL)",
    company: "Zerodha",
    location: "Bengaluru, India",
    salary: "₹20L - ₹35L",
    source: "Direct Employer",
    sourceUrl: "https://zerodha.com/careers",
    postedDate: "5 days ago",
    url: "https://zerodha.com/careers",
    description: "Work on Kite web trading platform. Performance-critical financial visualizations, charts, WebSockets, and low-latency market ticker displays.",
    experienceLevel: "junior",
    remoteType: "on-site",
    tags: ["JavaScript", "Vue", "WebGL", "WebSockets", "Finance"],
  },
  {
    id: "job_infosys_09",
    title: "Associate Software Engineer (Java / Spring)",
    company: "Infosys",
    location: "Hyderabad / Chennai, India",
    salary: "₹7L - ₹12L",
    source: "Direct Employer",
    sourceUrl: "https://www.infosys.com/careers",
    postedDate: "3 days ago",
    url: "https://www.infosys.com/careers",
    description: "Develop enterprise microservices, REST APIs, and database migrations for Fortune 500 client accounts. Great launchpad for freshers and junior developers.",
    experienceLevel: "fresher",
    remoteType: "hybrid",
    tags: ["Java", "Spring Boot", "SQL", "REST APIs", "Git"],
  },
  {
    id: "job_arbeit_10",
    title: "Product Designer (SaaS & Design Systems)",
    company: "Pitch",
    location: "Remote (Global)",
    salary: "€65,000 - €85,000",
    source: "Arbeitnow",
    sourceUrl: "https://arbeitnow.com",
    postedDate: "2 days ago",
    url: "https://pitch.com/jobs",
    description: "Craft modern presentation design workflows, vector shape toolbars, and template galleries. Prior experience building collaborative canvas tools is a plus.",
    experienceLevel: "mid",
    remoteType: "remote",
    tags: ["Figma", "Design Systems", "Canvas", "UI/UX", "Product Design"],
  },
];

export function getJobListingById(id: string): JobListing | undefined {
  return ALL_JOB_LISTINGS.find((j) => j.id === id);
}

export function calculateDeterministicMatchScore(job: JobListing, resumeSkills: string[]): {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
} {
  const normalizedResumeSkills = resumeSkills.map((s) => s.trim().toLowerCase());
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  job.tags.forEach((tag) => {
    const tagLower = tag.toLowerCase();
    const isMatch = normalizedResumeSkills.some(
      (skill) => skill === tagLower || skill.includes(tagLower) || tagLower.includes(skill)
    );
    if (isMatch) {
      matchedKeywords.push(tag);
    } else {
      missingKeywords.push(tag);
    }
  });

  // Score baseline calculation
  const totalTags = job.tags.length || 1;
  const matchRatio = matchedKeywords.length / totalTags;
  const score = Math.round(55 + matchRatio * 43); // Ranges from 55% to 98%

  return {
    score: Math.min(98, Math.max(55, score)),
    matchedKeywords,
    missingKeywords,
  };
}
