import Link from "next/link";
import { TEMPLATES } from "@/components/templates/registry";
import { Layout, Lock } from "lucide-react";

export default function TemplatesPage() {
  const categories = ["modern", "minimal", "ats", "professional"] as const;

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
          Template Gallery
        </h1>
        <p className="mt-1 text-text-secondary">
          Choose a template to start building your resume.
        </p>
      </div>

      {categories.map((cat) => {
        const templates = TEMPLATES.filter((t) => t.category === cat);
        if (templates.length === 0) return null;
        return (
          <div key={cat} className="mb-10">
            <h2 className="mb-4 text-lg font-semibold capitalize text-text-primary">
              {cat}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/builder?template=${t.id}`}
                  className="group relative rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent/30 hover:shadow-md"
                >
                  {!t.free && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      <Lock className="h-3 w-3" /> PRO
                    </div>
                  )}
                  <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-surface-tertiary">
                    <Layout className="h-10 w-10 text-text-tertiary transition-colors group-hover:text-accent" />
                  </div>
                  <h3 className="font-semibold text-text-primary">{t.name}</h3>
                  <p className="mt-1 text-sm text-text-secondary">{t.description}</p>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
