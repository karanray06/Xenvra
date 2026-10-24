import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { TemplateRenderer } from "@/components/templates/template-renderer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Print Resume - Xenvra",
  robots: { index: false, follow: false },
};

export default async function PrintResumePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ autoprint?: string }>;
}) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/print/${id}`)}`);
  }

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !resume) {
    notFound();
  }

  // Check plan entitlement for watermark & template access
  const { data: entitlement } = await supabase
    .from("entitlements")
    .select("plan, status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  const isPaid =
    entitlement?.status === "active" &&
    (entitlement.plan === "beginner" || entitlement.plan === "pro") &&
    (!entitlement.current_period_end ||
      new Date(entitlement.current_period_end) > new Date());

  const { getTemplateById } = await import("@/components/templates/registry");
  const template = getTemplateById(resume.template_id || "modern-1");
  if (template && !template.free && !isPaid) {
    redirect(`/dashboard/billing?error=${encodeURIComponent(`The ${template.name} template requires an active Beginner or Pro plan.`)}`);
  }

  const autoPrint = searchParams.autoprint === "true";

  return (
    <html lang="en">
      <head>
        <title>{(resume.title || "Resume").replace(/[<>:"/\\|?*]/g, "_")}</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @page { size: A4; margin: 0; }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #resume-preview {
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 auto;
            position: relative;
            background: #ffffff;
            box-sizing: border-box;
          }
        ` }} />
      </head>
      <body>
        <div id="resume-preview" className="relative w-[210mm] bg-white overflow-hidden">
          <TemplateRenderer templateId={resume.template_id || "modern-1"} data={resume.data} />

          {!isPaid && (
            <>
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                  userSelect: "none",
                  overflow: "hidden",
                  opacity: 0.08,
                }}
              >
                <span
                  style={{
                    transform: "rotate(-35deg)",
                    fontSize: "4rem",
                    fontWeight: 900,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    color: "#0F172A",
                  }}
                >
                  Made with Xenvra
                </span>
              </div>
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: "16px",
                  right: "24px",
                  fontSize: "11px",
                  letterSpacing: "0.05em",
                  color: "#64748B",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
              >
                Made with <strong style={{ color: "#0F172A" }}>Xenvra</strong>
              </div>
            </>
          )}
        </div>

        {autoPrint && (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.addEventListener('load', () => setTimeout(() => window.print(), 300));`,
            }}
          />
        )}
      </body>
    </html>
  );
}
