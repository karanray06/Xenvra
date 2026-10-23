import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanInfo } from "@/lib/plan-limits";
import type { ResumeData } from "@/lib/schemas/resume";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user plan entitlement
    const planInfo = await getUserPlanInfo(user.id);
    if (planInfo.planId === "free") {
      return NextResponse.json(
        {
          error: "DOCX export is available on Beginner and Pro plans. Please upgrade on the Billing page.",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    // Fetch resume
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("title, data")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const data = resume.data as ResumeData;
    const contact = data.contact || {};

    const docChildren: Paragraph[] = [];

    // Header: Full Name
    docChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: contact.fullName || "Untitled Resume",
            bold: true,
            size: 32, // 16pt
            font: "Calibri",
            color: "1A1D20",
          }),
        ],
      })
    );

    // Job Title Subheader (if present)
    if (contact.title) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: contact.title,
              bold: true,
              size: 24, // 12pt
              font: "Calibri",
              color: "5A4032", // Mocha Brown
            }),
          ],
        })
      );
    }

    // Contact info row
    const contactItems: string[] = [];
    if (contact.email) contactItems.push(contact.email);
    if (contact.phone) contactItems.push(contact.phone);
    if (contact.location) contactItems.push(contact.location);
    if (contact.linkedin) contactItems.push(contact.linkedin);
    if (contact.website) contactItems.push(contact.website);

    if (contactItems.length > 0) {
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          border: {
            bottom: {
              color: "C9CCD1",
              space: 4,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
          children: [
            new TextRun({
              text: contactItems.join("  •  "),
              size: 19, // 9.5pt
              font: "Calibri",
              color: "555555",
            }),
          ],
        })
      );
    }

    // Helper for section headings
    const addSectionHeader = (title: string) => {
      docChildren.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 100 },
          border: {
            bottom: {
              color: "5A4032",
              space: 2,
              style: BorderStyle.SINGLE,
              size: 10,
            },
          },
          children: [
            new TextRun({
              text: title.toUpperCase(),
              bold: true,
              size: 22, // 11pt
              font: "Calibri",
              color: "5A4032",
            }),
          ],
        })
      );
    };

    // Summary Section
    if (data.summary && data.summary.trim()) {
      addSectionHeader("Professional Summary");
      docChildren.push(
        new Paragraph({
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: data.summary,
              size: 21, // 10.5pt
              font: "Calibri",
              color: "333333",
            }),
          ],
        })
      );
    }

    // Experience Section
    if (data.experience && data.experience.length > 0) {
      addSectionHeader("Work Experience");
      data.experience.forEach((exp) => {
        // Job Title and Date
        docChildren.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({
                text: exp.jobTitle || "Role",
                bold: true,
                size: 22,
                font: "Calibri",
                color: "1A1D20",
              }),
              new TextRun({
                text: `  |  ${exp.company || "Company"}`,
                italics: true,
                size: 21,
                font: "Calibri",
                color: "444444",
              }),
              new TextRun({
                text: `\t${exp.startDate || ""} – ${
                  exp.currentlyWorking ? "Present" : exp.endDate || ""
                }`,
                bold: true,
                size: 20,
                font: "Calibri",
                color: "666666",
              }),
            ],
          })
        );

        if (exp.location) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: exp.location,
                  italics: true,
                  size: 18,
                  font: "Calibri",
                  color: "777777",
                }),
              ],
            })
          );
        }

        const highlights = exp.highlights && exp.highlights.length > 0
          ? exp.highlights
          : (exp.description || "").split("\n").filter((l) => l.trim().length > 0);

        highlights.forEach((h) => {
          docChildren.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [
                new TextRun({
                  text: h.replace(/^[•\-\*]\s*/, ""),
                  size: 20,
                  font: "Calibri",
                  color: "333333",
                }),
              ],
            })
          );
        });
      });
    }

    // Education Section
    if (data.education && data.education.length > 0) {
      addSectionHeader("Education");
      data.education.forEach((edu) => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: `${edu.degree || "Degree"}${edu.field ? ` in ${edu.field}` : ""}`,
                bold: true,
                size: 21,
                font: "Calibri",
                color: "1A1D20",
              }),
              new TextRun({
                text: `  |  ${edu.school || "Institution"}`,
                italics: true,
                size: 20,
                font: "Calibri",
                color: "444444",
              }),
              new TextRun({
                text: `\t${edu.startDate || ""} – ${edu.endDate || ""}`,
                size: 19,
                font: "Calibri",
                color: "666666",
              }),
            ],
          })
        );
        if (edu.gpa) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: `GPA: ${edu.gpa}`,
                  size: 18,
                  font: "Calibri",
                  color: "666666",
                }),
              ],
            })
          );
        }
      });
    }

    // Skills Section
    if (data.skills && data.skills.length > 0) {
      addSectionHeader("Technical & Professional Skills");
      docChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 140 },
          children: [
            new TextRun({
              text: data.skills.join("  •  "),
              size: 20,
              font: "Calibri",
              color: "333333",
            }),
          ],
        })
      );
    }

    // Projects Section
    if (data.projects && data.projects.length > 0) {
      addSectionHeader("Key Projects");
      data.projects.forEach((proj) => {
        docChildren.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({
                text: proj.name || "Project",
                bold: true,
                size: 21,
                font: "Calibri",
                color: "1A1D20",
              }),
              proj.technologies && proj.technologies.length > 0
                ? new TextRun({
                    text: `  (${proj.technologies.join(", ")})`,
                    italics: true,
                    size: 19,
                    font: "Calibri",
                    color: "5A4032",
                  })
                : new TextRun({ text: "" }),
            ],
          })
        );
        if (proj.description) {
          docChildren.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: proj.description,
                  size: 20,
                  font: "Calibri",
                  color: "333333",
                }),
              ],
            })
          );
        }
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1080, // 0.75 in
                right: 1080,
                bottom: 1080,
                left: 1080,
              },
            },
          },
          children: docChildren,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeTitle = (resume.title || "Resume").replace(/[^a-zA-Z0-9_\-\s]/g, "");

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          safeTitle
        )}.docx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate DOCX";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
