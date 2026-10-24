import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { ALL_STUDIO_TEMPLATES, getStudioTemplateById } from "@/lib/templates/manifest";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/blog/posts";

describe("Phase H: SEO, Sitemaps, Robots, and Public Discovery", () => {
  it("sitemap includes root, templates, blog, all categories, all templates, and all blog posts", () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThanOrEqual(50);

    const urls = entries.map((e) => e.url);

    // Core routes
    expect(urls.some((u) => u.endsWith("/templates"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/blog"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/brand"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/terms"))).toBe(true);

    // Category routes
    expect(urls.some((u) => u.endsWith("/templates/presentation"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/templates/resume"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/templates/banner"))).toBe(true);
    expect(urls.some((u) => u.endsWith("/templates/certificate"))).toBe(true);

    // Individual templates
    ALL_STUDIO_TEMPLATES.forEach((tmpl) => {
      expect(urls.some((u) => u.includes(`/templates/${tmpl.kind}/${tmpl.slug}`))).toBe(true);
    });

    // Blog articles
    BLOG_POSTS.forEach((post) => {
      expect(urls.some((u) => u.includes(`/blog/${post.slug}`))).toBe(true);
    });
  });

  it("robots.txt disallows private routes including /go/, /api/, /dashboard/, and allows public routes", () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;

    expect(rules).toBeDefined();
    expect(rules?.allow).toBe("/");

    const disallow = Array.isArray(rules?.disallow) ? rules.disallow : [rules?.disallow];
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/dashboard/");
    expect(disallow).toContain("/print/");
    expect(disallow).toContain("/go/");
    expect(disallow).toContain("/auth/");

    expect(config.sitemap).toContain("/sitemap.xml");
  });

  it("web manifest matches Studio Pivot branding and palette tokens", () => {
    const m = manifest();
    expect(m.name).toContain("Xenvra Studio");
    expect(m.short_name).toBe("Xenvra Studio");
    expect(m.theme_color).toBe("#5A4032");
    expect(m.background_color).toBe("#E6EEF4");
  });

  it("all 5 launch blog posts contain comprehensive content without placeholders", () => {
    expect(BLOG_POSTS.length).toBe(5);

    BLOG_POSTS.forEach((post) => {
      expect(post.slug).toBeTruthy();
      expect(post.title.length).toBeGreaterThan(15);
      expect(post.seoDescription.length).toBeGreaterThan(20);
      expect(post.author.name).toBeTruthy();
      expect(post.content.length).toBeGreaterThanOrEqual(1);

      post.content.forEach((sec) => {
        expect(sec.heading).toBeTruthy();
        expect(sec.body.length).toBeGreaterThanOrEqual(1);
      });
    });

    expect(getBlogPostBySlug("ats-resume-guide-india")).toBeDefined();
    expect(getBlogPostBySlug("10-slide-pitch-deck-structure")).toBeDefined();
    expect(getBlogPostBySlug("college-viva-presentation-defense")).toBeDefined();
  });

  it("all studio templates have valid slugs, kind mappers, and SEO descriptions", () => {
    expect(ALL_STUDIO_TEMPLATES.length).toBeGreaterThanOrEqual(30);

    ALL_STUDIO_TEMPLATES.forEach((tmpl) => {
      expect(tmpl.slug).toBeTruthy();
      expect(tmpl.kind).toBeTruthy();
      expect(tmpl.seoDescription).toBeTruthy();
      expect(tmpl.dimensions.width).toBeGreaterThan(0);
      expect(tmpl.dimensions.height).toBeGreaterThan(0);

      const retrieved = getStudioTemplateById(tmpl.slug);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(tmpl.id);
    });
  });
});
