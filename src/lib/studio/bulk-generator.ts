import JSZip from "jszip";
import type { StudioDocument, TextElement } from "@/lib/schemas/studio";
import { generateDocumentPDFBlob } from "./export";

export interface BulkRecipient {
  name: string;
  role?: string;
  event?: string;
  date?: string;
  [key: string]: string | undefined;
}

export function parseRecipientCSV(csvText: string): BulkRecipient[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  // Parse header
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

  const recipients: BulkRecipient[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((v) => v.trim().replace(/^["']|["']$/g, ""));

    if (values.length === 0 || !values[0]) continue;

    const recipient: BulkRecipient = {
      name: "",
    };

    headers.forEach((header, colIdx) => {
      const val = values[colIdx] || "";
      if (header.includes("name")) recipient.name = val;
      else if (header.includes("role") || header.includes("title") || header.includes("rank")) recipient.role = val;
      else if (header.includes("event") || header.includes("competition") || header.includes("program")) recipient.event = val;
      else if (header.includes("date") || header.includes("year")) recipient.date = val;
      else recipient[header] = val;
    });

    if (recipient.name) {
      recipients.push(recipient);
    }
  }

  return recipients;
}

export function cloneDocumentWithRecipient(
  templateDoc: StudioDocument,
  recipient: BulkRecipient
): StudioDocument {
  const newPages = templateDoc.pages.map((page) => {
    const newElements = page.elements.map((el) => {
      if (el.type !== "text") return el;
      const textEl = el as TextElement;

      let content = textEl.content;

      // Replace placeholders
      if (
        (textEl.name && textEl.name.toLowerCase().includes("recipient")) ||
        content.includes("Alex Mercer") ||
        content.includes("{{name}}") ||
        content.includes("[Participant Name]") ||
        content.includes("Aarav Sharma")
      ) {
        content = recipient.name;
      }
      if (recipient.role && (content.includes("{{role}}") || content.includes("[Award Category]"))) {
        content = content
          .replace(/\{\{role\}\}/gi, recipient.role)
          .replace(/\[Award Category\]/gi, recipient.role);
      }
      if (recipient.event && (content.includes("{{event}}") || content.includes("[Event Name]"))) {
        content = content
          .replace(/\{\{event\}\}/gi, recipient.event)
          .replace(/\[Event Name\]/gi, recipient.event);
      }
      if (recipient.date && (content.includes("{{date}}") || content.includes("[Date]"))) {
        content = content
          .replace(/\{\{date\}\}/gi, recipient.date)
          .replace(/\[Date\]/gi, recipient.date);
      }

      // Check bind paths
      if (textEl.bind === "recipient.name" || textEl.bind === "personal.fullName") {
        content = recipient.name;
      } else if (textEl.bind === "recipient.role" && recipient.role) {
        content = recipient.role;
      } else if (textEl.bind === "recipient.event" && recipient.event) {
        content = recipient.event;
      }

      return {
        ...textEl,
        content,
      };
    });

    return {
      ...page,
      elements: newElements,
    };
  });

  return {
    ...templateDoc,
    pages: newPages,
  };
}

export async function generateBulkCertificatesZIP(
  templateDoc: StudioDocument,
  recipients: BulkRecipient[],
  isPro = true,
  onProgress?: (current: number, total: number) => void
): Promise<{ blob: Blob; count: number }> {
  const zip = new JSZip();
  const folder = zip.folder("certificates") || zip;

  for (let i = 0; i < recipients.length; i++) {
    const rec = recipients[i];
    const customizedDoc = cloneDocumentWithRecipient(templateDoc, rec);
    const pdfBlob = generateDocumentPDFBlob(customizedDoc, isPro);

    const safeFilename = `${rec.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-certificate.pdf`;
    folder.file(safeFilename, pdfBlob);

    if (onProgress) {
      onProgress(i + 1, recipients.length);
    }
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return {
    blob: zipBlob,
    count: recipients.length,
  };
}
