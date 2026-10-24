export interface BlogPost {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  category: "Resume & ATS" | "Presentations" | "Campus & Viva" | "Personal Brand" | "Job Search";
  readTime: string;
  publishedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  summary: string;
  content: {
    heading: string;
    body: string[];
    tips?: string[];
  }[];
  relatedTemplateSlug?: string;
  relatedTemplateKind?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ats-resume-guide-india",
    title: "The Definitive ATS Resume Guide for Indian Freshers & Tech Professionals (2026)",
    seoTitle: "ATS Resume Guide for Freshers & Tech Careers in India (2026)",
    seoDescription:
      "A complete guide to passing automated applicant tracking systems (Workday, Taleo, Greenhouse) at top Indian IT, startups, and product companies.",
    category: "Resume & ATS",
    readTime: "7 min read",
    publishedAt: "2026-10-24",
    author: {
      name: "Karan Ray",
      role: "Lead Platform Architect, Xenvra",
      avatar: "/logos/xenvra-icon.svg",
    },
    summary:
      "Why 75% of qualified engineering and business resumes are rejected before human eyes ever see them in India, and how vector text extraction changes the game.",
    content: [
      {
        heading: "1. The Reality of Automated Screening in India",
        body: [
          "Recruitment teams at companies like TCS, Infosys, Swiggy, and Razorpay receive upwards of 2,000 resumes per entry and mid-level job posting. To manage this volume, modern recruitment departments rely on Applicant Tracking Systems (ATS) such as Workday, Greenhouse, Taleo, and Darwinbox.",
          "These engines parse incoming documents into structured JSON objects containing candidate contact details, universities, degrees, skills, and chronological work history. If an ATS cannot extract your skills cleanly, your profile is assigned a low relevance score and archived automatically.",
        ],
        tips: [
          "Never save your resume as a flattened image (JPEG/PNG) or export from basic graphic apps that render text into unextractable canvas blobs.",
          "Stick to universal section titles: 'Work Experience', 'Education', 'Projects', and 'Technical Skills'. Obscure headings like 'My Journey' confuse parsers.",
        ],
      },
      {
        heading: "2. The Vector ATS Advantage: Why Layout Choice Matters",
        body: [
          "A widespread myth among Indian job seekers is that you must use an unstyled 1995 Times New Roman Word document to pass ATS filters. This is untrue. Modern parsers handle dual-column layouts and styled typography effortlessly — provided the underlying PDF stream contains true selectable vector text.",
          "When you export from Xenvra Studio, text elements are compiled directly into native PDF stream operands rather than flattened raster images. You achieve the visual prestige of a Canva-grade design while retaining 100% computational readability for recruitment software.",
        ],
      },
      {
        heading: "3. The X-Y-Z Metric Formula for Engineering Bullet Points",
        body: [
          "Recruiters and ATS semantic algorithms prioritize quantified achievements over passive responsibility statements. Use Google's recommended X-Y-Z formula: 'Accomplished [X], as measured by [Y], by doing [Z]'.",
          "For example, instead of writing 'Worked on backend microservices', write: 'Reduced payment webhook processing latency by 34% (from 420ms to 275ms) by implementing Redis caching and idempotent database locks'.",
        ],
        tips: [
          "Include both spelled-out terms and industry acronyms (e.g. 'AWS (Amazon Web Services)', 'Continuous Integration / Continuous Deployment (CI/CD)').",
          "Ensure your mobile number includes the country code (+91) and your email address is clickable.",
        ],
      },
    ],
    relatedTemplateSlug: "resume-modern-1",
    relatedTemplateKind: "resume",
  },
  {
    slug: "10-slide-pitch-deck-structure",
    title: "How to Structure a Winning 10-Slide Pitch Deck for Investors and Hackathons",
    seoTitle: "The 10-Slide Pitch Deck Formula for Startups and Hackathons",
    seoDescription:
      "Master Guy Kawasaki's proven 10-slide anatomy: Problem, Solution, Market Size, Traction, Business Model, and Financials with modern vector layouts.",
    category: "Presentations",
    readTime: "6 min read",
    publishedAt: "2026-10-24",
    author: {
      name: "Xenvra Design Team",
      role: "Studio Design System",
      avatar: "/logos/xenvra-icon.svg",
    },
    summary:
      "Investors spend an average of 2 minutes and 42 seconds reviewing a seed-stage pitch deck. Here is how to structure each slide for maximum clarity.",
    content: [
      {
        heading: "1. The Universal 10-Slide Deck Anatomy",
        body: [
          "Whether you are pitching angel investors in Bengaluru or presenting your project at a 48-hour national hackathon, brevity is your greatest asset. Overly long 30-slide presentations dilute your core value proposition and cause audience fatigue.",
          "Every flagship presentation deck in Xenvra is structured around the 10 core slides that venture capital analysts evaluate: Cover, Problem, Solution, Market/Research, Product/Business Model, Traction/Proof, Strategy/GTM, Team, Roadmap, and Contact.",
        ],
      },
      {
        heading: "2. The Big-Number Slide: Proving Real Market Pull",
        body: [
          "Slide 4 (Market) and Slide 6 (Traction) should never be dense paragraphs of text. Instead, highlight 2 to 3 decisive numbers with 48pt+ typography: Total Addressable Market (TAM), monthly active users, or percentage growth rate.",
          "In Xenvra Studio, every deck includes calibrated 'Big Number' stat cards built with our Mocha Brown and Ice Silver palette tokens, ensuring your key milestones immediately anchor viewer attention.",
        ],
        tips: [
          "Limit each slide to one core takeaway. If a slide requires two minutes to explain, it contains too much information.",
          "Use team photo frames to humanize the founders. Drop circular portraits and add 1-line credentials.",
        ],
      },
      {
        heading: "3. Exporting to Native PowerPoint (PPTX) Without Broken Layouts",
        body: [
          "One of the biggest frustrations with online slide builders is downloading a PPTX only to discover that every slide is a flattened image where you cannot fix a typo. Xenvra exports true native PPTX objects: editable text boxes, vector shapes, and real image layers.",
          "You can fine-tune text right before stepping onto the stage in PowerPoint, Google Slides, or Apple Keynote.",
        ],
      },
    ],
    relatedTemplateSlug: "deck-startup-pitch",
    relatedTemplateKind: "deck",
  },
  {
    slug: "college-viva-presentation-defense",
    title: "College Project & Viva Defense: The Essential Slide-by-Slide Presentation Checklist",
    seoTitle: "College Project Viva Defense Presentation Checklist",
    seoDescription:
      "A pragmatic slide guide for B.Tech, BCA, MCA, and MBA final-year project viva presentations. Impress external examiners with clean visual structure.",
    category: "Campus & Viva",
    readTime: "5 min read",
    publishedAt: "2026-10-24",
    author: {
      name: "Xenvra Academic Editorial",
      role: "Campus Programs",
      avatar: "/logos/xenvra-icon.svg",
    },
    summary:
      "How to design a final-year project defense deck that satisfies strict academic criteria while looking polished, professional, and visually engaging.",
    content: [
      {
        heading: "1. What External Examiners Actually Look For",
        body: [
          "External evaluators and university viva panels see dozens of student project presentations in a single afternoon. Most presentations fail due to common errors: walls of microscopic text copied from project reports, cluttered diagrams, and lack of clear problem framing.",
          "A successful defense deck demonstrates three things quickly: (1) You understand the problem domain, (2) Your system architecture is technically sound, and (3) You have verified results or benchmarks.",
        ],
      },
      {
        heading: "2. Slide Anatomy for Engineering & Computer Science Vivas",
        body: [
          "Recommended 10-slide sequence for academic defense: (1) Title with Guide & University details, (2) Literature Survey & Gap, (3) Problem Statement & Objectives, (4) Proposed System Architecture, (5) Technology Stack, (6) Key Algorithms / Implementation, (7) Live Demo / Screenshots, (8) Performance Analysis / Test Results, (9) Future Enhancements, and (10) Conclusion & References.",
        ],
        tips: [
          "Use high-contrast backgrounds (Ice Silver or Pure White) so your slides remain easily legible on dim campus projectors.",
          "Replace low-res screenshots with vector flowchart blocks available in the Xenvra Studio Elements panel.",
        ],
      },
    ],
    relatedTemplateSlug: "deck-college-viva",
    relatedTemplateKind: "deck",
  },
  {
    slug: "linkedin-banner-branding-guide",
    title: "LinkedIn Banner Dimensions and Personal Branding Guide for Tech Careers",
    seoTitle: "LinkedIn Banner Dimensions & Strategy for Developers & Designers",
    seoDescription:
      "Master the 1584×396 px LinkedIn banner format. Safe zones, mobile screen differences, typography hierarchy, and portfolio links.",
    category: "Personal Brand",
    readTime: "4 min read",
    publishedAt: "2026-10-24",
    author: {
      name: "Karan Ray",
      role: "Lead Platform Architect, Xenvra",
      avatar: "/logos/xenvra-icon.svg",
    },
    summary:
      "Your LinkedIn profile header is prime visual real estate. Learn how to place your headline, tech stack, and portfolio links without getting cut off by profile avatars.",
    content: [
      {
        heading: "1. The 1584 × 396 Ratio and the Desktop vs. Mobile Safe Zone",
        body: [
          "LinkedIn recommends a background banner dimension of 1584 × 396 pixels (a 4:1 aspect ratio). However, because LinkedIn repositions your circular profile photo on mobile apps compared to desktop browsers, nearly 25% of the bottom-left area is obscured.",
          "Placing your email address, GitHub handle, or value proposition in the lower-left corner guarantees that mobile recruiters will never see it. All typography and logos must be positioned across the upper-right quadrant.",
        ],
        tips: [
          "Keep critical text and branding within the central 1200 × 280 pixel safe zone.",
          "Export your banner at 2x resolution (3168 × 792) to avoid blurry rendering on Retina and 4K displays.",
        ],
      },
    ],
    relatedTemplateSlug: "banner-software-engineer",
    relatedTemplateKind: "banner",
  },
  {
    slug: "job-search-tracker-strategy",
    title: "How to Systematically Track and Tailor 50+ Job Applications Without Burning Out",
    seoTitle: "Job Search Tracker Strategy: Tailoring & Kanban Follow-Ups",
    seoDescription:
      "Stop tracking job applications in messy spreadsheets. Learn how to organize your application funnel, tailor keyword packages, and follow up efficiently.",
    category: "Job Search",
    readTime: "6 min read",
    publishedAt: "2026-10-24",
    author: {
      name: "Xenvra Career Editorial",
      role: "Talent Strategy",
      avatar: "/logos/xenvra-icon.svg",
    },
    summary:
      "Applying to 10 tailored roles produces significantly higher interview conversion rates than sending 200 generic resumes. Here is how to manage the funnel.",
    content: [
      {
        heading: "1. The High-Volume Trap vs. The Tailored Pipeline",
        body: [
          "Sending the identical generic PDF to 100 job listings on LinkedIn or Naukri rarely yields interviews. Top applicants treat their job search like an outbound sales pipeline: Saved → Applied → In Review → Interviewing → Offered.",
          "When you identify a high-priority listing, use the JD Tailor feature inside Xenvra to analyze the job description's critical keywords against your resume skills before submitting.",
        ],
      },
      {
        heading: "2. Using the Xenvra Jobs Kanban Tracker",
        body: [
          "The Xenvra Jobs Tracker allows you to drag and drop applications across recruitment stages with automated follow-up reminders. When you apply through our secure `/go/[listingId]` gateway, your card is automatically logged with the exact resume and cover letter version used.",
        ],
      },
    ],
    relatedTemplateSlug: "cover-tech-lead",
    relatedTemplateKind: "cover_letter",
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
