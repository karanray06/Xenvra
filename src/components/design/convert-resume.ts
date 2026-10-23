import type { ResumeData } from "@/lib/schemas/resume";
import type { DesignElement } from "./types";

export function convertResumeToDesignElements(data: ResumeData): DesignElement[] {
  const elements: DesignElement[] = [];
  let currentY = 40;
  let idCounter = 1;

  const nextId = (prefix: string) => `${prefix}_${idCounter++}`;

  // 1. Header Banner Background (Mocha Accent card)
  elements.push({
    id: nextId("rect"),
    type: "rect",
    name: "Header Banner",
    x: 40,
    y: currentY,
    width: 714,
    height: 110,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    fill: "#5A4032", // Mocha Brown
    borderRadius: 8,
  });

  // Candidate Name
  const fullName = data.contact?.fullName || "Your Full Name";
  elements.push({
    id: nextId("text"),
    type: "text",
    name: "Candidate Name",
    x: 60,
    y: currentY + 18,
    width: 500,
    height: 38,
    rotation: 0,
    opacity: 1,
    locked: false,
    hidden: false,
    fill: "transparent",
    text: fullName,
    fontFamily: "Plus Jakarta Sans, sans-serif",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "left",
    textColor: "#FFFFFF",
  });

  // Candidate Title / Headline
  if (data.contact?.title) {
    elements.push({
      id: nextId("text"),
      type: "text",
      name: "Job Title",
      x: 60,
      y: currentY + 58,
      width: 500,
      height: 24,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "transparent",
      text: data.contact.title,
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 14,
      fontWeight: "medium",
      textAlign: "left",
      textColor: "#E6EEF4", // Ice Silver
    });
  }

  // Contact Info Row
  const contactParts: string[] = [];
  if (data.contact?.email) contactParts.push(data.contact.email);
  if (data.contact?.phone) contactParts.push(data.contact.phone);
  if (data.contact?.location) contactParts.push(data.contact.location);
  if (data.contact?.linkedin) contactParts.push(data.contact.linkedin);

  if (contactParts.length > 0) {
    elements.push({
      id: nextId("text"),
      type: "text",
      name: "Contact Details",
      x: 60,
      y: currentY + 84,
      width: 674,
      height: 20,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "transparent",
      text: contactParts.join("   •   "),
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 10,
      fontWeight: "normal",
      textAlign: "left",
      textColor: "#DCD3F2", // Pale Lavender
    });
  }

  currentY += 130;

  // 2. Professional Summary Section
  if (data.summary && data.summary.trim()) {
    elements.push({
      id: nextId("text"),
      type: "text",
      name: "Summary Heading",
      x: 40,
      y: currentY,
      width: 250,
      height: 24,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "transparent",
      text: "PROFESSIONAL SUMMARY",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "left",
      textColor: "#5A4032",
    });

    elements.push({
      id: nextId("line"),
      type: "line",
      name: "Summary Divider",
      x: 40,
      y: currentY + 22,
      width: 714,
      height: 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "#C9CCD1", // Platinum Silver
    });

    elements.push({
      id: nextId("text"),
      type: "text",
      name: "Summary Paragraph",
      x: 40,
      y: currentY + 30,
      width: 714,
      height: 48,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "transparent",
      text: data.summary,
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 10.5,
      fontWeight: "normal",
      lineHeight: 1.4,
      textAlign: "left",
      textColor: "#2B2D31",
    });

    currentY += 90;
  }

  // 3. Work Experience Section
  if (data.experience && data.experience.length > 0) {
    elements.push({
      id: nextId("text"),
      type: "text",
      name: "Experience Heading",
      x: 40,
      y: currentY,
      width: 250,
      height: 24,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "transparent",
      text: "WORK EXPERIENCE",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "left",
      textColor: "#5A4032",
    });

    elements.push({
      id: nextId("line"),
      type: "line",
      name: "Experience Divider",
      x: 40,
      y: currentY + 22,
      width: 714,
      height: 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "#C9CCD1",
    });

    currentY += 32;

    data.experience.slice(0, 3).forEach((exp) => {
      // Role & Company
      elements.push({
        id: nextId("text"),
        type: "text",
        name: `${exp.jobTitle || "Role"} Title`,
        x: 40,
        y: currentY,
        width: 450,
        height: 20,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        fill: "transparent",
        text: `${exp.jobTitle || "Role"} — ${exp.company || "Company"}`,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "left",
        textColor: "#1A1D20",
      });

      // Date Range Badge
      const dateStr = `${exp.startDate || ""} – ${exp.currentlyWorking ? "Present" : exp.endDate || ""}`;
      elements.push({
        id: nextId("badge"),
        type: "badge",
        name: "Date Badge",
        x: 580,
        y: currentY - 2,
        width: 174,
        height: 18,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        fill: "#E6EEF4",
        borderRadius: 4,
        text: dateStr,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 9.5,
        fontWeight: "medium",
        textAlign: "center",
        textColor: "#5A4032",
      });

      currentY += 22;

      // Bullet points
      const bullets = exp.highlights && exp.highlights.length > 0
        ? exp.highlights
        : (exp.description || "").split("\n").filter((l) => l.trim().length > 0);

      bullets.slice(0, 3).forEach((b) => {
        elements.push({
          id: nextId("text"),
          type: "text",
          name: "Bullet Highlight",
          x: 55,
          y: currentY,
          width: 699,
          height: 28,
          rotation: 0,
          opacity: 1,
          locked: false,
          hidden: false,
          fill: "transparent",
          text: `•  ${b.replace(/^[•\-\*]\s*/, "")}`,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          fontSize: 10,
          fontWeight: "normal",
          lineHeight: 1.35,
          textAlign: "left",
          textColor: "#3D4148",
        });
        currentY += 28;
      });

      currentY += 8;
    });
  }

  // 4. Skills Section (Chips & Badges)
  if (data.skills && data.skills.length > 0) {
    elements.push({
      id: nextId("text"),
      type: "text",
      name: "Skills Heading",
      x: 40,
      y: currentY,
      width: 250,
      height: 24,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "transparent",
      text: "CORE COMPETENCIES & SKILLS",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "left",
      textColor: "#5A4032",
    });

    elements.push({
      id: nextId("line"),
      type: "line",
      name: "Skills Divider",
      x: 40,
      y: currentY + 22,
      width: 714,
      height: 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "#C9CCD1",
    });

    currentY += 34;

    let chipX = 40;
    let chipY = currentY;

    data.skills.slice(0, 14).forEach((skill) => {
      const chipWidth = Math.max(70, skill.length * 8.5 + 24);
      if (chipX + chipWidth > 754) {
        chipX = 40;
        chipY += 28;
      }

      elements.push({
        id: nextId("badge"),
        type: "badge",
        name: `Skill: ${skill}`,
        x: chipX,
        y: chipY,
        width: chipWidth,
        height: 22,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        fill: "#DCD3F2", // Pale Lavender
        borderRadius: 11,
        text: skill,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 10,
        fontWeight: "600",
        textAlign: "center",
        textColor: "#1A1D20",
      });

      chipX += chipWidth + 8;
    });

    currentY = chipY + 38;
  }

  // 5. Education Section
  if (data.education && data.education.length > 0) {
    elements.push({
      id: nextId("text"),
      type: "text",
      name: "Education Heading",
      x: 40,
      y: currentY,
      width: 250,
      height: 24,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "transparent",
      text: "EDUCATION",
      fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 12,
      fontWeight: "bold",
      textAlign: "left",
      textColor: "#5A4032",
    });

    elements.push({
      id: nextId("line"),
      type: "line",
      name: "Education Divider",
      x: 40,
      y: currentY + 22,
      width: 714,
      height: 2,
      rotation: 0,
      opacity: 1,
      locked: false,
      hidden: false,
      fill: "#C9CCD1",
    });

    currentY += 32;

    data.education.slice(0, 2).forEach((edu) => {
      elements.push({
        id: nextId("text"),
        type: "text",
        name: "Degree Title",
        x: 40,
        y: currentY,
        width: 500,
        height: 20,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        fill: "transparent",
        text: `${edu.degree || "Degree"} — ${edu.school || "University"}`,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 11,
        fontWeight: "bold",
        textAlign: "left",
        textColor: "#1A1D20",
      });

      const eduDates = `${edu.startDate || ""} – ${edu.endDate || ""}`;
      elements.push({
        id: nextId("badge"),
        type: "badge",
        name: "Education Date",
        x: 600,
        y: currentY - 2,
        width: 154,
        height: 18,
        rotation: 0,
        opacity: 1,
        locked: false,
        hidden: false,
        fill: "#E6EEF4",
        borderRadius: 4,
        text: eduDates,
        fontFamily: "Plus Jakarta Sans, sans-serif",
        fontSize: 9.5,
        fontWeight: "medium",
        textAlign: "center",
        textColor: "#5A4032",
      });

      currentY += 24;
    });
  }

  return elements;
}
