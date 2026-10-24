import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/blog/posts";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getAppBaseUrl } from "@/lib/env";
import {
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: "Blog — Xenvra Studio" };

  const baseUrl = getAppBaseUrl();
  return {
    title: `${post.seoTitle} — Xenvra Studio`,
    description: post.seoDescription,
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.seoTitle} — Xenvra Studio`,
      description: post.seoDescription,
      url: `${baseUrl}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(post.title)}&kind=${encodeURIComponent(post.category)}&badge=${encodeURIComponent(post.readTime)}`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const baseUrl = getAppBaseUrl();
  const canonicalUrl = `${baseUrl}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: baseUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${baseUrl}/blog`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.seoDescription,
        datePublished: post.publishedAt,
        url: canonicalUrl,
        author: {
          "@type": "Person",
          name: post.author.name,
          jobTitle: post.author.role,
        },
        publisher: {
          "@type": "Organization",
          name: "Xenvra Studio",
          url: baseUrl,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#F5F9FB] flex flex-col text-[#241915]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PublicHeader />

      <main className="flex-1">
        {/* Breadcrumb Bar */}
        <div className="border-b border-[#C9CCD1] bg-[#E6EEF4]/60 py-3">
          <div className="mx-auto max-w-screen-md px-4 sm:px-6 flex items-center gap-2 text-xs text-[#5E534D]">
            <Link href="/" className="hover:text-[#241915]">
              Home
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-[#241915]">
              Blog
            </Link>
            <span>/</span>
            <span className="font-bold text-[#5A4032] truncate">{post.category}</span>
          </div>
        </div>

        {/* Article Container */}
        <article className="mx-auto max-w-screen-md px-4 py-12 sm:px-6 space-y-8">
          {/* Article Header */}
          <header className="space-y-4 border-b border-[#C9CCD1] pb-8">
            <div className="flex items-center gap-2 text-xs font-bold text-[#5A4032]">
              <span className="rounded-md bg-[#DCD3F2] px-2.5 py-0.5 uppercase tracking-wider text-[10px]">
                {post.category}
              </span>
              <span className="text-[#8A8F98]">·</span>
              <span className="flex items-center gap-1 text-[#5E534D]">
                <Clock className="h-3 w-3" /> {post.readTime}
              </span>
              <span className="text-[#8A8F98]">·</span>
              <span className="flex items-center gap-1 text-[#5E534D]">
                <Calendar className="h-3 w-3" /> {post.publishedAt}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#241915] leading-tight">
              {post.title}
            </h1>

            <p className="text-sm sm:text-base text-[#5E534D] leading-relaxed italic bg-[#E6EEF4]/70 p-4 rounded-xl border border-[#C9CCD1]">
              &ldquo;{post.summary}&rdquo;
            </p>

            {/* Author Byline */}
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#5A4032] flex items-center justify-center text-white font-bold text-sm">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-bold text-[#241915]">{post.author.name}</p>
                <p className="text-[11px] text-[#8A8F98]">{post.author.role}</p>
              </div>
            </div>
          </header>

          {/* Article Sections */}
          <div className="space-y-10 text-sm leading-relaxed text-[#241915]">
            {post.content.map((sec, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl font-bold text-[#241915] tracking-tight">
                  {sec.heading}
                </h2>
                {sec.body.map((p, pIdx) => (
                  <p key={pIdx} className="text-[#5E534D] leading-relaxed">
                    {p}
                  </p>
                ))}

                {sec.tips && sec.tips.length > 0 && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2 mt-3">
                    <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wider">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Actionable Takeaways
                    </h4>
                    <ul className="space-y-1.5 text-xs text-emerald-950 pl-5 list-disc">
                      {sec.tips.map((tip, tIdx) => (
                        <li key={tIdx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Contextual In-Article Studio CTA */}
          <div className="rounded-2xl border border-[#C9CCD1] bg-[#E6EEF4] p-8 text-center space-y-4 my-10 shadow-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#DCD3F2] px-3 py-0.5 text-xs font-bold text-[#5A4032]">
              <Sparkles className="h-3 w-3" /> Built for Immediate Execution
            </div>
            <h3 className="text-2xl font-bold text-[#241915]">
              Ready to Design Your Documents in Minutes?
            </h3>
            <p className="text-xs text-[#5E534D] max-w-lg mx-auto">
              Start with pre-calibrated templates engineered in our 5-colour brand system. Vector ATS export, editable PowerPoint decks, and drag-and-drop photo frames.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5A4032] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#483328]"
              >
                <span>Launch Xenvra Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {post.relatedTemplateSlug && (
                <Link
                  href={`/templates/${post.relatedTemplateKind || "presentation"}/${post.relatedTemplateSlug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#C9CCD1] bg-white px-4 py-2.5 text-xs font-bold text-[#241915] hover:bg-[#F5F9FB]"
                >
                  <span>View Matching Template</span>
                </Link>
              )}
            </div>
          </div>
        </article>
      </main>

      <PublicFooter />
    </div>
  );
}
