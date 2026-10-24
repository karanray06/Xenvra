import type { MetadataRoute } from "next";
import { getAppBaseUrl } from "@/lib/env";
import { ALL_STUDIO_TEMPLATES } from "@/lib/templates/manifest";
import { BLOG_POSTS } from "@/lib/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getAppBaseUrl();
  const lastModified = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/brand`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = [
    "presentation",
    "resume",
    "banner",
    "certificate",
    "card",
    "cover_letter",
  ].map((cat) => ({
    url: `${baseUrl}/templates/${cat}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const templateRoutes: MetadataRoute.Sitemap = ALL_STUDIO_TEMPLATES.map((t) => ({
    url: `${baseUrl}/templates/${t.kind}/${t.slug}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...coreRoutes, ...categoryRoutes, ...templateRoutes, ...blogRoutes];
}
