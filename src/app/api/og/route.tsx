import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "Design Resumes, Decks & More — In Minutes";
  const desc =
    searchParams.get("desc") ||
    searchParams.get("description") ||
    "Your career, beautifully designed. Ready-made templates for resumes, pitch decks, college vivas, and LinkedIn banners.";
  const category = searchParams.get("category") || searchParams.get("kind") || "Design Studio";
  const badge = searchParams.get("badge") || "Canva-Grade Originals";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#E6EEF4",
          padding: "60px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Left column: Branding & Details */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            maxWidth: "680px",
          }}
        >
          {/* Logo badge and category tag */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#5A4032",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#E6EEF4",
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              X
            </div>
            <span
              style={{
                fontSize: "32px",
                fontWeight: 800,
                color: "#241915",
                letterSpacing: "-0.03em",
              }}
            >
              Xenvra
            </span>
            <div
              style={{
                backgroundColor: "#DCD3F2",
                color: "#5A4032",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {category}
            </div>
          </div>

          {/* Dynamic Title */}
          <h1
            style={{
              fontSize: title.length > 40 ? "46px" : "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#241915",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            {title}
          </h1>

          {/* Dynamic Description */}
          <p
            style={{
              fontSize: "22px",
              color: "#5E534D",
              marginTop: "20px",
              marginBottom: "36px",
              lineHeight: 1.4,
              maxHeight: "90px",
              overflow: "hidden",
            }}
          >
            {desc}
          </p>

          {/* Action Pills */}
          <div
            style={{
              display: "flex",
              gap: "12px",
            }}
          >
            <div
              style={{
                backgroundColor: "#5A4032",
                color: "#F5F9FB",
                padding: "12px 24px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Open in Studio →
            </div>
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #C9CCD1",
                color: "#241915",
                padding: "12px 20px",
                borderRadius: "10px",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {badge}
            </div>
          </div>
        </div>

        {/* Right column: Sleek Studio Canvas Mockup */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "360px",
            height: "460px",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            boxShadow: "0 24px 48px -12px rgba(90, 64, 50, 0.22)",
            border: "1px solid #C9CCD1",
            padding: "28px",
            justifyContent: "space-between",
          }}
        >
          {/* Mock Header */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "10px",
                  backgroundColor: "#E6EEF4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    backgroundColor: "#5A4032",
                  }}
                />
              </div>
              <div
                style={{
                  backgroundColor: "#E6EEF4",
                  borderRadius: "6px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#5A4032",
                }}
              >
                VECTOR ATS
              </div>
            </div>

            <div
              style={{
                width: "200px",
                height: "18px",
                borderRadius: "6px",
                backgroundColor: "#5A4032",
                marginBottom: "10px",
              }}
            />
            <div
              style={{
                width: "130px",
                height: "12px",
                borderRadius: "4px",
                backgroundColor: "#C9CCD1",
                marginBottom: "20px",
              }}
            />

            <div
              style={{
                width: "100%",
                height: "1px",
                backgroundColor: "#E6EEF4",
                marginBottom: "18px",
              }}
            />

            {/* Skeleton lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  width: "100%",
                  height: "9px",
                  borderRadius: "4px",
                  backgroundColor: "#E6EEF4",
                }}
              />
              <div
                style={{
                  width: "88%",
                  height: "9px",
                  borderRadius: "4px",
                  backgroundColor: "#E6EEF4",
                }}
              />
              <div
                style={{
                  width: "94%",
                  height: "9px",
                  borderRadius: "4px",
                  backgroundColor: "#E6EEF4",
                }}
              />
              <div
                style={{
                  width: "72%",
                  height: "9px",
                  borderRadius: "4px",
                  backgroundColor: "#E6EEF4",
                }}
              />
            </div>
          </div>

          {/* Bottom tag pills */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              paddingTop: "16px",
              borderTop: "1px solid #E6EEF4",
            }}
          >
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: "#DCD3F2",
                fontSize: "11px",
                fontWeight: 700,
                color: "#5A4032",
              }}
            >
              PPTX
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: "#DCD3F2",
                fontSize: "11px",
                fontWeight: 700,
                color: "#5A4032",
              }}
            >
              PDF
            </div>
            <div
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                backgroundColor: "#DCD3F2",
                fontSize: "11px",
                fontWeight: 700,
                color: "#5A4032",
              }}
            >
              SVG
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
