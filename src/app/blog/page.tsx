import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { getAppBaseUrl } from "@/lib/env";
import { BookOpen, Clock, ArrowRight, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Career & Design Guides — Xenvra Studio",
  description:
    "Actionable career guides, ATS resume engineering breakdowns, 10-slide pitch deck frameworks, and college project viva presentation defense checklists.",
  alternates: {
    canonical: `${getAppBaseUrl()}/blog`,
  },
  openGraph: {
    title: "Career & Design Guides — Xenvra Studio",
    description:
      "Actionable career guides, ATS resume engineering breakdowns, and pitch deck frameworks.",
    url: `${getAppBaseUrl()}/blog`,
    images: [
      {
        url: `/api/og?title=${encodeURIComponent("Career & Design Guides")}&kind=Guides&badge=${encodeURIComponent("5 Launch Articles")}`,
        width: 1200,
        height: 630,
        alt: "Xenvra Career Guides",
      },
    ],
  },
};

export default function BlogIndexPage() {
  const baseUrl = getAppBaseUrl();

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
        ],
      },
      {
        "@type": "Blog",
        name: "Xenvra Career & Design Guides",
        description:
          "Practical, high-impact career guides on ATS optimization, startup pitch presentations, and campus viva defenses.",
        url: `${baseUrl}/blog`,
        blogPost: BLOG_POSTS.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          description: post.seoDescription,
          url: `${baseUrl}/blog/${post.slug}`,
          datePublished: post.publishedAt,
          author: {
            "@type": "Person",
            name: post.author.name,
          },
        })),
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
        {/* Hero */}
        <section className="border-b border-[#C9CCD1] bg-[#E6EEF4] py-16 sm:py-20 text-center relative overflow-hidden">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#DCD3F2] px-3.5 py-1 text-xs font-bold text-[#5A4032] mb-5 shadow-2xs">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Career & Design Editorial</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-[#241915] max-w-3xl mx-auto leading-tight">
              Actionable Guides for Career & Campus Work
            </h1>
            <p className="mt-4 text-sm sm:text-base text-[#5E534D] max-w-2xl mx-auto leading-relaxed">
              No generic fluff. Proven advice on passing ATS algorithms, engineering investor-ready 10-slide decks, defending college project vivas, and standing out on LinkedIn.
            </p>
          </div>
        </section>

        {/* Posts Grid */}
        <section className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col justify-between rounded-2xl border border-[#C9CCD1] bg-white p-6 shadow-2xs transition-all hover:border-[#5A4032] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="rounded-md bg-[#E6EEF4] px-2.5 py-0.5 font-bold text-[#5A4032] uppercase tracking-wider text-[10px]">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-[#8A8F98]">
                      <Clock className="h-3 w-3" /> {post.readTime}
                    </span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-lg font-bold text-[#241915] group-hover:text-[#5A4032] transition-colors leading-snug">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mt-2.5 text-xs text-[#5E534D] leading-relaxed line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#C9CCD1] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-[#5E534D]">
                    <div className="w-6 h-6 rounded-full bg-[#E6EEF4] flex items-center justify-center text-[#5A4032]">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-[#241915]">{post.author.name}</span>
                  </div>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 font-bold text-[#5A4032] hover:underline"
                  >
                    <span>Read Guide</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
