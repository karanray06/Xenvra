import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Sparkles,
  Shield,
  Download,
  PenTool,
  Layout,
  ArrowRight,
  Check,
  ChevronDown,
  Bot,
  Target,
  Zap,
} from "lucide-react";

// ===== Navbar =====
function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-surface/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logos/xenvra-icon.png"
            alt="Xenvra"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <Image
            src="/logos/xenvra-wordmark.png"
            alt="Xenvra"
            width={90}
            height={22}
            className="hidden object-contain sm:block"
          />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-text-secondary transition-colors hover:text-text-primary sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-accent-hover hover:shadow-md"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

// ===== Hero =====
function Hero() {
  return (
    <section className="relative overflow-hidden bg-surface pb-20 pt-16 sm:pt-24">
      {/* Background gradients */}
      <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-brand-100/40 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-brand-50/60 blur-3xl" />

      <div className="relative mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-accent">
          <Sparkles className="h-4 w-4" />
          AI-Powered Resume Builder
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-text-primary sm:text-5xl md:text-6xl lg:text-7xl">
          Build a Professional Resume{" "}
          <span className="bg-gradient-to-r from-accent to-brand-700 bg-clip-text text-transparent">
            That Gets Results
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">
          Create polished, ATS-friendly resumes in minutes. Choose from
          professionally designed templates, get AI writing assistance, and
          export to PDF.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent/30"
          >
            Create My Resume
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-7 py-3.5 text-base font-semibold text-text-primary shadow-sm transition-all hover:border-border-strong hover:shadow-md"
          >
            Learn More
          </a>
        </div>

        {/* Social Proof — honest version */}
        <p className="mt-12 text-sm text-text-tertiary">
          Free to start · No credit card required · Export to PDF instantly
        </p>
      </div>
    </section>
  );
}

// ===== Features =====
function Features() {
  const features = [
    {
      icon: Bot,
      title: "AI Writing Assistant",
      description:
        "Get help writing bullet points, summaries, and skill descriptions. The AI suggests improvements while preserving your real experience.",
    },
    {
      icon: Target,
      title: "ATS Score Checker",
      description:
        "Real-time feedback on your resume's ATS compatibility. Check keyword coverage, formatting, and section completeness.",
    },
    {
      icon: Layout,
      title: "Professional Templates",
      description:
        "Multiple professionally designed templates across categories: Modern, Minimal, ATS-Simple, Two-Column, and more.",
    },
    {
      icon: Shield,
      title: "Private & Secure",
      description:
        "Your resume data is stored securely with row-level security. Only you can access your information.",
    },
    {
      icon: Download,
      title: "PDF Export",
      description:
        "Export pixel-perfect PDFs that look exactly like the preview. Your resume is ready to send to employers.",
    },
    {
      icon: Zap,
      title: "Fast & Simple",
      description:
        "No complex setup required. Sign in, pick a template, fill in your details, and download. It just works.",
    },
  ];

  return (
    <section
      id="features"
      className="bg-surface-secondary py-20 sm:py-28"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Everything you need to land the job
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Powerful tools to help you create a standout resume, backed by real
            AI — not smoke and mirrors.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-surface p-7 shadow-sm transition-all hover:border-accent/20 hover:shadow-md"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-accent transition-colors group-hover:bg-brand-100">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2.5 text-lg font-semibold text-text-primary">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== How It Works =====
function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Layout,
      title: "Choose a Template",
      description:
        "Browse our collection of ATS-friendly, professionally designed resume templates and pick one that fits your style.",
    },
    {
      number: "2",
      icon: PenTool,
      title: "Add Your Details",
      description:
        "Fill in your experience, education, and skills. Use our AI assistant to help write compelling descriptions.",
    },
    {
      number: "3",
      icon: Download,
      title: "Download & Apply",
      description:
        "Preview your resume in real-time, then export it as a polished PDF ready for job applications.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Three steps to your new resume
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Getting started takes less than two minutes.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative rounded-2xl border border-border bg-surface p-8 text-center shadow-sm"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-accent">
                {step.number}
              </div>
              <h3 className="mb-3 text-xl font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== Pricing Preview =====
function PricingPreview() {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Get started with the basics",
      features: [
        "1 resume",
        "3 templates",
        "PDF export (with watermark)",
        "Basic ATS score",
        "~5 AI actions/day",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Beginner",
      price: "₹29",
      period: "30-day pass",
      description: "More power, more templates",
      features: [
        "3 resumes",
        "All templates",
        "PDF export (no watermark)",
        "Full ATS score",
        "~30 AI actions/day",
        "5 JD tailorings/month",
        "3 cover letters/month",
      ],
      cta: "Coming Soon",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹49",
      period: "30-day pass",
      description: "Everything, unlimited",
      features: [
        "Unlimited resumes",
        "All templates + early access",
        "PDF + DOCX export",
        "Unlimited AI actions",
        "Unlimited JD tailoring",
        "Unlimited cover letters",
        "Version history",
        "Application tracker",
        "Public profile with analytics",
      ],
      cta: "Coming Soon",
      popular: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="bg-surface-secondary py-20 sm:py-28"
    >
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Simple, affordable pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
            Start free, upgrade when you need more. 30-day passes, no
            auto-renewal surprises.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-surface p-7 shadow-sm ${
                plan.popular
                  ? "border-accent shadow-md ring-1 ring-accent/20"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-xs font-semibold text-white">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold text-text-primary">
                {plan.name}
              </h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-text-primary">
                  {plan.price}
                </span>
                <span className="text-sm text-text-tertiary">
                  /{plan.period}
                </span>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                {plan.description}
              </p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-text-secondary"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-all ${
                  plan.popular
                    ? "bg-accent text-white shadow-sm hover:bg-accent-hover"
                    : "border border-border bg-surface text-text-primary hover:bg-surface-tertiary"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== FAQ =====
function FAQ() {
  const faqs = [
    {
      q: "Is Xenvra free to use?",
      a: "Yes! You can create one resume with 3 templates and export to PDF for free. Paid plans unlock more resumes, all templates, and enhanced AI features.",
    },
    {
      q: "Will my resume pass ATS systems?",
      a: "Our templates are designed with ATS compatibility in mind. We also provide a real-time ATS score checker that analyzes your resume for keyword coverage, formatting, and section completeness.",
    },
    {
      q: "How does the AI assistant work?",
      a: "The AI helps you write bullet points, summaries, and descriptions based on your real experience. It never invents metrics or facts — if your content lacks specifics, it will ask you for the real numbers.",
    },
    {
      q: "Is my data private?",
      a: "Absolutely. Your resume data is stored securely with row-level security in our database. Only you can access your information, and we never share or sell your data.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept UPI, cards, and netbanking via Razorpay. All prices are in INR. Plans are 30-day passes with no auto-renewal — you buy exactly when you need it.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Plans are 30-day passes that don't auto-renew, so there's nothing to cancel. You simply stop purchasing when you no longer need premium features.",
    },
  ];

  return (
    <section id="faq" className="bg-surface py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-xl border border-border bg-surface shadow-sm"
            >
              <summary className="flex cursor-pointer items-center justify-between p-5 text-left text-base font-semibold text-text-primary [&::-webkit-details-marker]:hidden">
                {faq.q}
                <ChevronDown className="h-5 w-5 shrink-0 text-text-tertiary transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border px-5 pb-5 pt-4 text-sm leading-relaxed text-text-secondary">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// ===== CTA =====
function CTASection() {
  return (
    <section className="bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 py-20 sm:py-28">
      <div className="mx-auto max-w-screen-xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to build your resume?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-200">
          Start for free, no credit card needed. Your resume could be ready
          in under 10 minutes.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand-900 shadow-lg transition-all hover:bg-brand-50 hover:shadow-xl"
        >
          Get Started Free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
}

// ===== Footer =====
function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-12">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logos/xenvra-icon.png"
              alt="Xenvra"
              width={28}
              height={28}
              className="rounded-md"
            />
            <Image
              src="/logos/xenvra-wordmark.png"
              alt="Xenvra"
              width={70}
              height={18}
              className="object-contain"
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-text-tertiary">
            <Link
              href="/terms"
              className="transition-colors hover:text-text-secondary"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="transition-colors hover:text-text-secondary"
            >
              Privacy
            </Link>
            <Link
              href="/refund"
              className="transition-colors hover:text-text-secondary"
            >
              Refund Policy
            </Link>
            <a
              href="mailto:support@kareixo.me"
              className="transition-colors hover:text-text-secondary"
            >
              Contact
            </a>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-text-tertiary">
          © {new Date().getFullYear()} Xenvra. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

// ===== Landing Page =====
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <PricingPreview />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
