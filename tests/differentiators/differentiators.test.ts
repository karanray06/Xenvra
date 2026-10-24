import { describe, it, expect } from "vitest";
import {
  applyCareerDataBinding,
  resolveProfileField,
  DEFAULT_CAREER_PROFILE,
} from "@/lib/studio/career-kit";
import { validateStudioDocumentATS } from "@/lib/studio/ats-validator";
import {
  parseRecipientCSV,
  cloneDocumentWithRecipient,
  generateBulkCertificatesZIP,
} from "@/lib/studio/bulk-generator";
import { getStudioTemplateById } from "@/lib/templates/manifest";
import type { StudioDocument, TextElement } from "@/lib/schemas/studio";

describe("Phase I: Studio Differentiators", () => {
  describe("Career Kit & Data Binding", () => {
    it("resolves personal and experience fields correctly", () => {
      expect(resolveProfileField(DEFAULT_CAREER_PROFILE, "personal.fullName")).toBe(
        DEFAULT_CAREER_PROFILE.fullName
      );
      expect(resolveProfileField(DEFAULT_CAREER_PROFILE, "personal.email")).toBe(
        DEFAULT_CAREER_PROFILE.email
      );
      expect(resolveProfileField(DEFAULT_CAREER_PROFILE, "experience[0].company")).toBe(
        DEFAULT_CAREER_PROFILE.experience[0].company
      );
      expect(resolveProfileField(DEFAULT_CAREER_PROFILE, "experience[0].bullets")).toContain("•");
      expect(resolveProfileField(DEFAULT_CAREER_PROFILE, "skills.all")).toContain("TypeScript");
    });

    it("applies career data-binding onto studio document text elements", () => {
      const template = getStudioTemplateById("resume-modern-1");
      expect(template).toBeDefined();

      const doc = template!.getDoc();
      const { doc: boundDoc, boundCount } = applyCareerDataBinding(doc, DEFAULT_CAREER_PROFILE);

      expect(boundCount).toBeGreaterThanOrEqual(1);
      const textNodes = boundDoc.pages[0].elements.filter((el): el is TextElement => el.type === "text");
      const hasBoundContent = textNodes.some((el) => el.content.includes("15M+ requests"));
      expect(hasBoundContent).toBe(true);
    });
  });

  describe("Live ATS Score & Vector Text Layer Validator", () => {
    it("scores standard resume templates above 80 with extractable vector layer", () => {
      const template = getStudioTemplateById("resume-modern-1");
      expect(template).toBeDefined();

      const doc = template!.getDoc();
      const result = validateStudioDocumentATS(doc);

      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.isExtractable).toBe(true);
      expect(result.grade).toMatch(/A|A\+/);
      expect(result.sectionsDetected.experience).toBe(true);
      expect(result.checklist.some((c) => c.id === "extractable" && c.status === "pass")).toBe(
        true
      );
    });

    it("warns when sections are missing in an empty document", () => {
      const emptyDoc: StudioDocument = {
        schemaVersion: 1,
        pages: [
          {
            id: "page-1",
            name: "Page 1",
            width: 794,
            height: 1123,
            background: "#FFFFFF",
            elements: [],
          },
        ],
      };

      const result = validateStudioDocumentATS(emptyDoc);
      expect(result.score).toBeLessThan(50);
      expect(result.isExtractable).toBe(false);
      expect(result.checklist.some((c) => c.status === "fail")).toBe(true);
    });
  });

  describe("Bulk Certificate Generator", () => {
    it("parses CSV with names, roles, events and dates", () => {
      const csv = `Name,Role,Event,Date\nAarav Sharma,First Place,HackX 2026,24 Oct 2026\nAnanya Verma,Runner Up,HackX 2026,24 Oct 2026`;
      const recipients = parseRecipientCSV(csv);

      expect(recipients.length).toBe(2);
      expect(recipients[0].name).toBe("Aarav Sharma");
      expect(recipients[0].role).toBe("First Place");
      expect(recipients[0].event).toBe("HackX 2026");
      expect(recipients[1].name).toBe("Ananya Verma");
    });

    it("interpolates recipient data into cloned certificate document", () => {
      const template = getStudioTemplateById("cert-hackathon-winner");
      expect(template).toBeDefined();

      const doc = template!.getDoc();
      const customized = cloneDocumentWithRecipient(doc, {
        name: "Devendra Patel",
        role: "Grand Winner",
        event: "Smart India Hackathon",
        date: "24 October 2026",
      });

      const textNodes = customized.pages[0].elements.filter((el): el is TextElement => el.type === "text");
      const hasRecipientName = textNodes.some((el) => el.content.includes("Devendra Patel"));
      expect(hasRecipientName).toBe(true);
    });

    it("generates a downloadable zip containing personalized vector PDFs", async () => {
      const template = getStudioTemplateById("cert-hackathon-winner");
      expect(template).toBeDefined();

      const doc = template!.getDoc();
      const recipients = [
        { name: "Winner One", role: "Gold Medal" },
        { name: "Winner Two", role: "Silver Medal" },
      ];

      const { blob, count } = await generateBulkCertificatesZIP(doc, recipients, true);
      expect(count).toBe(2);
      expect(blob.size).toBeGreaterThan(1000);
      expect(blob.type).toBe("application/zip");
    });
  });
});
