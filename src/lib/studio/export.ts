import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";
import type { StudioDocument, StudioPage, StudioElement } from "@/lib/schemas/studio";

// ==============================================================================
// Xenvra Studio Multi-Format Vector Exporter
// SVG (from AST) · PPTX (Native editable slides) · PDF (ATS-readable) · PNG
// ==============================================================================

/**
 * 1. Native SVG Serialization directly from Document AST (No DOM scraping)
 */
export function exportPageToSVG(page: StudioPage, isPro = true): string {
  const elementsSvg = page.elements
    .map((el) => serializeElementToSVG(el))
    .join("\n  ");

  const watermarkSvg = !isPro
    ? `<text x="${page.width - 24}" y="${page.height - 24}" text-anchor="end" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="600" fill="#5A4032" opacity="0.6">Made with Xenvra</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${page.width} ${page.height}" width="${page.width}" height="${page.height}">
  <!-- Background -->
  <rect width="100%" height="100%" fill="${page.background || "#FFFFFF"}" />
  ${elementsSvg}
  ${watermarkSvg}
</svg>`;
}

function serializeElementToSVG(el: StudioElement): string {
  if (el.hidden) return "";

  const transform = el.rotation
    ? `transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"`
    : "";
  const opacityAttr =
    el.opacity !== undefined && el.opacity < 1 ? `opacity="${el.opacity}"` : "";

  switch (el.type) {
    case "text": {
      // Clean XML encoding
      const safeText = el.content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const textAnchor =
        el.align === "center" ? "middle" : el.align === "right" ? "end" : "start";
      const textX =
        el.align === "center" ? el.x + el.width / 2 : el.align === "right" ? el.x + el.width : el.x;

      return `<g ${transform} ${opacityAttr}>
    <text x="${textX}" y="${el.y + el.fontSize}" font-family="${el.fontFamily}, sans-serif" font-size="${el.fontSize}" font-weight="${el.fontWeight}" fill="${el.color}" text-anchor="${textAnchor}" letter-spacing="${el.letterSpacing}">
      ${safeText}
    </text>
  </g>`;
    }

    case "shape": {
      if (el.shapeType === "ellipse") {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rx = el.width / 2;
        const ry = el.height / 2;
        return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${el.fill}" stroke="${el.stroke || "none"}" stroke-width="${el.strokeWidth || 0}" ${transform} ${opacityAttr} />`;
      }
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.cornerRadius || 0}" fill="${el.fill}" stroke="${el.stroke || "none"}" stroke-width="${el.strokeWidth || 0}" ${transform} ${opacityAttr} />`;
    }

    case "image": {
      return `<image href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" ${transform} ${opacityAttr} />`;
    }

    case "frame": {
      if (!el.imageSrc) {
        return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.frameShape === "circle" ? el.width / 2 : 12}" fill="#F5F9FB" stroke="${el.borderColor}" stroke-width="${el.borderWidth}" stroke-dasharray="4" ${transform} ${opacityAttr} />`;
      }
      const clipId = `clip-${el.id}`;
      const clipShape =
        el.frameShape === "circle"
          ? `<circle cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" r="${el.width / 2}" />`
          : `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="16" />`;

      return `<defs><clipPath id="${clipId}">${clipShape}</clipPath></defs>
  <image href="${el.imageSrc}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" clip-path="url(#${clipId})" preserveAspectRatio="xMidYMid slice" ${transform} ${opacityAttr} />`;
    }

    case "qr": {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.backgroundColor}" stroke="${el.color}" stroke-width="2" ${transform} ${opacityAttr} />`;
    }

    case "chart": {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="8" fill="#F6F1EE" stroke="#C9CCD1" stroke-width="1" ${transform} ${opacityAttr} />`;
    }

    case "icon": {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="4" fill="none" stroke="${el.color}" stroke-width="${el.strokeWidth}" ${transform} ${opacityAttr} />`;
    }
  }
}

/**
 * 2. Editable PowerPoint Export (PPTX) with pptxgenjs
 */
export async function exportDocumentToPPTX(doc: StudioDocument, filename = "presentation.pptx") {
  const pptx = new pptxgen();

  // Set 16:9 widescreen or custom layout
  pptx.layout = "LAYOUT_16x9";

  for (const page of doc.pages) {
    const slide = pptx.addSlide();

    // Slide background
    if (page.background && page.background.startsWith("#")) {
      slide.background = { color: page.background.replace("#", "") };
    }

    for (const el of page.elements) {
      if (el.hidden) return;

      // Coordinate scaling from 1920x1080 px to PPTX 10x5.625 inches
      const scaleX = 10 / page.width;
      const scaleY = 5.625 / page.height;

      const x = el.x * scaleX;
      const y = el.y * scaleY;
      const w = el.width * scaleX;
      const h = el.height * scaleY;

      if (el.type === "text") {
        slide.addText(el.content, {
          x,
          y,
          w,
          h,
          fontSize: Math.round(el.fontSize * 0.75),
          fontFace: el.fontFamily,
          color: el.color.replace("#", ""),
          bold: Number(el.fontWeight) >= 700,
          italic: el.fontStyle === "italic",
          align: el.align as "left" | "center" | "right" | "justify",
        });
      } else if (el.type === "shape" && el.shapeType === "rect") {
        slide.addShape(pptx.ShapeType.rect, {
          x,
          y,
          w,
          h,
          fill: { color: el.fill.replace("#", "") },
          line: el.stroke ? { color: el.stroke.replace("#", ""), width: el.strokeWidth || 1 } : undefined,
        });
      } else if (el.type === "shape" && el.shapeType === "ellipse") {
        slide.addShape(pptx.ShapeType.ellipse, {
          x,
          y,
          w,
          h,
          fill: { color: el.fill.replace("#", "") },
        });
      } else if (el.type === "image" && el.src) {
        slide.addImage({
          path: el.src,
          x,
          y,
          w,
          h,
        });
      }
    }
  }

  await pptx.writeFile({ fileName: filename });
}

/**
 * 3. Vector ATS-Readable PDF Export with jsPDF
 */
export async function exportDocumentToPDF(doc: StudioDocument, filename = "document.pdf", isPro = true) {
  const firstPage = doc.pages[0];
  const isLandscape = firstPage.width > firstPage.height;

  const pdf = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "pt",
    format: [firstPage.width * 0.75, firstPage.height * 0.75],
  });

  for (let i = 0; i < doc.pages.length; i++) {
    const page = doc.pages[i];
    if (i > 0) {
      pdf.addPage([page.width * 0.75, page.height * 0.75], isLandscape ? "landscape" : "portrait");
    }

    const ptScale = 0.75;

    // Draw background
    if (page.background) {
      pdf.setFillColor(page.background);
      pdf.rect(0, 0, page.width * ptScale, page.height * ptScale, "F");
    }

    // Render elements
    for (const el of page.elements) {
      if (el.hidden) continue;

      if (el.type === "text") {
        pdf.setFontSize(el.fontSize * ptScale);
        pdf.setTextColor(el.color);
        pdf.text(el.content, el.x * ptScale, (el.y + el.fontSize) * ptScale, {
          align: el.align === "center" ? "center" : el.align === "right" ? "right" : "left",
        });
      } else if (el.type === "shape") {
        pdf.setFillColor(el.fill);
        if (el.shapeType === "ellipse") {
          pdf.ellipse(
            (el.x + el.width / 2) * ptScale,
            (el.y + el.height / 2) * ptScale,
            (el.width / 2) * ptScale,
            (el.height / 2) * ptScale,
            "F"
          );
        } else {
          pdf.roundedRect(
            el.x * ptScale,
            el.y * ptScale,
            el.width * ptScale,
            el.height * ptScale,
            (el.cornerRadius || 0) * ptScale,
            (el.cornerRadius || 0) * ptScale,
            "F"
          );
        }
      }
    }

    // Watermark if free tier
    if (!isPro) {
      pdf.setFontSize(10);
      pdf.setTextColor("#5A4032");
      pdf.text("Made with Xenvra", (page.width - 30) * ptScale, (page.height - 20) * ptScale, {
        align: "right",
      });
    }
  }

  pdf.save(filename);
}

/**
 * 4. High-Res PNG Rasterizer
 */
export async function exportPageToPNG(page: StudioPage, scale: 1 | 2 | 4 = 2, isPro = true): Promise<string> {
  const svgString = exportPageToSVG(page, isPro);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = page.width * scale;
      canvas.height = page.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Unable to create canvas 2D context"));
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}
