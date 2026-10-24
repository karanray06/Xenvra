import { build10SlideDeck } from "./deck-builder";
import type { StudioDocument } from "@/lib/schemas/studio";

export interface PresentationTemplateMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: "pitch" | "campus" | "business" | "creative" | "marketing";
  description: string;
  tags: string[];
  tier: "free" | "pro";
  fontHeading: string;
  fontBody: string;
  themes: ("mocha" | "ice" | "lavender" | "charcoal")[];
  getDoc: (theme?: "mocha" | "ice" | "lavender" | "charcoal") => StudioDocument;
}

// 1. Startup Pitch Deck
export const startupPitchDeck: PresentationTemplateMeta = {
  id: "deck-startup-pitch",
  slug: "startup-pitch-deck",
  title: "Startup Pitch Deck (10 Slides)",
  subtitle: "Investor-ready 10-slide narrative for angel, pre-seed and seed rounds.",
  category: "pitch",
  description: "Classic venture deck anatomy: Problem, Solution, TAM, Business Model, Traction, and Vision.",
  tags: ["startup", "pitch", "investor", "seed", "venture"],
  tier: "free",
  fontHeading: "Plus Jakarta Sans",
  fontBody: "Inter",
  themes: ["mocha", "ice", "lavender", "charcoal"],
  getDoc: (theme = "mocha") =>
    build10SlideDeck({
      id: "deck-startup-pitch",
      title: "Building the Next-Gen Digital Economy",
      subtitle: "A scalable platform delivering 10x workflow velocity for creators and developers.",
      theme,
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      primaryColor: "#5A4032",
      accentColor: "#DCD3F2",
      textColor: "#241915",
      surfaceColor: "#F6F1EE",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Startup Pitch",
        description: "Investor presentation deck for seed-stage ventures.",
        tags: ["startup", "seed"],
      },
    }),
};

// 2. Marketing Plan Deck
export const marketingPlanDeck: PresentationTemplateMeta = {
  id: "deck-marketing-plan",
  slug: "growth-marketing-plan",
  title: "Growth Marketing Plan",
  subtitle: "Omnichannel acquisition, CAC/LTV payback, and viral distribution loops.",
  category: "marketing",
  description: "Comprehensive go-to-market and growth strategy slides with conversion funnels.",
  tags: ["marketing", "growth", "cac", "funnel", "sales"],
  tier: "free",
  fontHeading: "Poppins",
  fontBody: "Montserrat",
  themes: ["ice", "mocha", "lavender"],
  getDoc: (theme = "ice") =>
    build10SlideDeck({
      id: "deck-marketing-plan",
      title: "Strategic Growth & Acquisition Engine",
      subtitle: "Scaling digital performance, customer lifetime value, and brand affinity.",
      theme,
      fontHeading: "Poppins",
      fontBody: "Montserrat",
      primaryColor: "#241915",
      accentColor: "#5A4032",
      textColor: "#241915",
      surfaceColor: "#E6EEF4",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Marketing Strategy",
        description: "Growth marketing campaign overview and KPI tracking.",
        tags: ["marketing", "growth"],
      },
    }),
};

// 3. Consulting / Strategy Deck
export const consultingStrategyDeck: PresentationTemplateMeta = {
  id: "deck-consulting-strategy",
  slug: "consulting-strategy-presentation",
  title: "Management Consulting & Advisory",
  subtitle: "Executive advisory framework, operational bottlenecks, and restructuring.",
  category: "business",
  description: "Corporate strategy layout with structured analytical columns and executive briefings.",
  tags: ["consulting", "strategy", "corporate", "advisory", "executive"],
  tier: "pro",
  fontHeading: "DM Serif Display",
  fontBody: "Inter",
  themes: ["charcoal", "mocha", "ice"],
  getDoc: (theme = "charcoal") =>
    build10SlideDeck({
      id: "deck-consulting-strategy",
      title: "Enterprise Transformation & Operational Excellence",
      subtitle: "Data-driven diagnosis and restructuring roadmap for high-growth organizations.",
      theme,
      fontHeading: "DM Serif Display",
      fontBody: "Inter",
      primaryColor: "#5A4032",
      accentColor: "#C9CCD1",
      textColor: "#241915",
      surfaceColor: "#F5F9FB",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Advisory",
        description: "High-level management consulting presentation.",
        tags: ["consulting", "executive"],
      },
    }),
};

// 4. Product Launch Deck
export const productLaunchDeck: PresentationTemplateMeta = {
  id: "deck-product-launch",
  slug: "product-launch-keynote",
  title: "Product Launch Keynote",
  subtitle: "Feature deep-dive, system architecture, and customer onboarding roadmap.",
  category: "pitch",
  description: "High-energy engineering and product announcement deck with mock frames.",
  tags: ["product", "keynote", "engineering", "saas", "launch"],
  tier: "free",
  fontHeading: "Space Grotesk",
  fontBody: "JetBrains Mono",
  themes: ["lavender", "mocha", "charcoal"],
  getDoc: (theme = "lavender") =>
    build10SlideDeck({
      id: "deck-product-launch",
      title: "Introducing Xenvra Engine v2.0",
      subtitle: "The breakthrough vector architecture engineered for sub-millisecond precision.",
      theme,
      fontHeading: "Space Grotesk",
      fontBody: "JetBrains Mono",
      primaryColor: "#5A4032",
      accentColor: "#7B66B8",
      textColor: "#241915",
      surfaceColor: "#EEEAF9",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Product Launch",
        description: "Technical product unveiling slides.",
        tags: ["product", "launch"],
      },
    }),
};

// 5. College Project / Viva Deck
export const collegeVivaDeck: PresentationTemplateMeta = {
  id: "deck-college-viva",
  slug: "college-project-viva-defense",
  title: "College Project & Viva Defense",
  subtitle: "Academic viva presentation for engineering, CS, and university capstones.",
  category: "campus",
  description: "Academic defense anatomy: Problem formulation, literature survey, methodology, test results, and conclusions.",
  tags: ["college", "viva", "thesis", "engineering", "academic", "project"],
  tier: "free",
  fontHeading: "Plus Jakarta Sans",
  fontBody: "Inter",
  themes: ["ice", "mocha", "charcoal"],
  getDoc: (theme = "ice") =>
    build10SlideDeck({
      id: "deck-college-viva",
      title: "Final Year Capstone: Distributed Vector Design System",
      subtitle: "Investigation and implementation of zero-latency collaborative canvas engines.",
      theme,
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      primaryColor: "#5A4032",
      accentColor: "#DCD3F2",
      textColor: "#241915",
      surfaceColor: "#E6EEF4",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "College Viva",
        description: "Capstone project defense slides.",
        tags: ["college", "viva"],
      },
    }),
};

// 6. Hackathon Demo Day Deck
export const hackathonDemoDeck: PresentationTemplateMeta = {
  id: "deck-hackathon-demo",
  slug: "hackathon-demo-day-3min",
  title: "Hackathon Demo Day (3-Minute Pitch)",
  subtitle: "High-octane demo presentation built to win hackathon judging panels.",
  category: "campus",
  description: "Speed-pitch layout: Problem, live demo screenshot, tech stack, API integrations, and future vision.",
  tags: ["hackathon", "demo", "competition", "prototype", "developer"],
  tier: "free",
  fontHeading: "Space Grotesk",
  fontBody: "Inter",
  themes: ["charcoal", "lavender", "mocha"],
  getDoc: (theme = "charcoal") =>
    build10SlideDeck({
      id: "deck-hackathon-demo",
      title: "Hackathon Demo: 36-Hour Prototype to Production",
      subtitle: "Solving real-world career application friction with verifiable AI tooling.",
      theme,
      fontHeading: "Space Grotesk",
      fontBody: "Inter",
      primaryColor: "#5A4032",
      accentColor: "#DCD3F2",
      textColor: "#241915",
      surfaceColor: "#F5F9FB",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Hackathon",
        description: "Winning hackathon demo day slide deck.",
        tags: ["hackathon", "demo"],
      },
    }),
};

// 7. Business Proposal / Sales Deck
export const businessProposalDeck: PresentationTemplateMeta = {
  id: "deck-business-proposal",
  slug: "b2b-sales-proposal",
  title: "B2B Sales & Commercial Proposal",
  subtitle: "Client discovery, bespoke enterprise solutions, pricing packages, and SLA terms.",
  category: "business",
  description: "Professional client pitch layout tailored to enterprise procurement and contract wins.",
  tags: ["b2b", "sales", "proposal", "contract", "enterprise"],
  tier: "pro",
  fontHeading: "DM Serif Display",
  fontBody: "Lora",
  themes: ["mocha", "ice", "charcoal"],
  getDoc: (theme = "mocha") =>
    build10SlideDeck({
      id: "deck-business-proposal",
      title: "Strategic Commercial Partnership Proposal",
      subtitle: "Delivering institutional capability, compliance guarantees, and scalable adoption.",
      theme,
      fontHeading: "DM Serif Display",
      fontBody: "Lora",
      primaryColor: "#5A4032",
      accentColor: "#C9CCD1",
      textColor: "#241915",
      surfaceColor: "#F6F1EE",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Commercial Proposal",
        description: "B2B commercial partnership proposal.",
        tags: ["proposal", "sales"],
      },
    }),
};

// 8. Portfolio & Case Study Deck
export const portfolioCaseStudyDeck: PresentationTemplateMeta = {
  id: "deck-portfolio-casestudy",
  slug: "creative-design-casestudy",
  title: "Design Portfolio & Case Study",
  subtitle: "Design sprint walkthrough, user research, wireframes, and final production impact.",
  category: "creative",
  description: "Visual portfolio deck for UX designers, researchers, and creative technologists.",
  tags: ["portfolio", "casestudy", "ux", "designer", "creative"],
  tier: "free",
  fontHeading: "Playfair Display",
  fontBody: "Inter",
  themes: ["ice", "lavender", "mocha"],
  getDoc: (theme = "ice") =>
    build10SlideDeck({
      id: "deck-portfolio-casestudy",
      title: "End-to-End Product Design Case Study",
      subtitle: "From qualitative user interviews to shipping a world-class responsive interface.",
      theme,
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColor: "#241915",
      accentColor: "#5A4032",
      textColor: "#241915",
      surfaceColor: "#E6EEF4",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Case Study",
        description: "Comprehensive product design portfolio walk-through.",
        tags: ["portfolio", "creative"],
      },
    }),
};

// 9. Event / MUN / Conference Deck
export const eventMunDeck: PresentationTemplateMeta = {
  id: "deck-event-mun",
  slug: "mun-conference-summit-brief",
  title: "MUN & Global Conference Briefing",
  subtitle: "Diplomatic policy position papers, geopolitical crisis updates, and committee resolutions.",
  category: "campus",
  description: "Formal conference and symposium presentation deck for student delegates and summits.",
  tags: ["mun", "conference", "delegation", "summit", "campus"],
  tier: "pro",
  fontHeading: "Oswald",
  fontBody: "Inter",
  themes: ["mocha", "charcoal", "ice"],
  getDoc: (theme = "mocha") =>
    build10SlideDeck({
      id: "deck-event-mun",
      title: "Model United Nations: Committee on Global Innovation",
      subtitle: "Addressing ethical technology dissemination, student accessibility, and digital equity.",
      theme,
      fontHeading: "Oswald",
      fontBody: "Inter",
      primaryColor: "#5A4032",
      accentColor: "#DCD3F2",
      textColor: "#241915",
      surfaceColor: "#F6F1EE",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Diplomatic Summit",
        description: "Formal MUN conference briefing.",
        tags: ["mun", "summit"],
      },
    }),
};

// 10. Personal Brand / Interview Intro Deck
export const personalBrandDeck: PresentationTemplateMeta = {
  id: "deck-personal-brand",
  slug: "personal-brand-interview-deck",
  title: "Personal Brand & Executive Intro",
  subtitle: "High-impact 'About Me' presentation for leadership interviews and keynote speaking.",
  category: "creative",
  description: "Personal introduction deck: Career timeline, core superpowers, notable projects, and leadership philosophy.",
  tags: ["personal", "interview", "bio", "leadership", "intro"],
  tier: "free",
  fontHeading: "Bebas Neue",
  fontBody: "Plus Jakarta Sans",
  themes: ["charcoal", "mocha", "lavender"],
  getDoc: (theme = "charcoal") =>
    build10SlideDeck({
      id: "deck-personal-brand",
      title: "Executive Profile & Leadership Philosophy",
      subtitle: "Full-stack engineer, product builder, and technical mentor.",
      theme,
      fontHeading: "Bebas Neue",
      fontBody: "Plus Jakarta Sans",
      primaryColor: "#5A4032",
      accentColor: "#DCD3F2",
      textColor: "#241915",
      surfaceColor: "#F5F9FB",
      backgroundColor: "#FFFFFF",
      meta: {
        category: "Personal Intro",
        description: "Candidate intro slides for executive interviews.",
        tags: ["interview", "personal"],
      },
    }),
};

export const ALL_PRESENTATION_DECKS: PresentationTemplateMeta[] = [
  startupPitchDeck,
  marketingPlanDeck,
  consultingStrategyDeck,
  productLaunchDeck,
  collegeVivaDeck,
  hackathonDemoDeck,
  businessProposalDeck,
  portfolioCaseStudyDeck,
  eventMunDeck,
  personalBrandDeck,
];
