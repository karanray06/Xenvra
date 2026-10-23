import { ImageResponse } from "next/og";

export async function GET() {
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
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Left side: branding & copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            maxWidth: "600px",
          }}
        >
          {/* Logo badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "32px",
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
                fontSize: "36px",
                fontWeight: 800,
                color: "#241915",
                letterSpacing: "-0.03em",
              }}
            >
              Xenvra
            </span>
          </div>

          <h1
            style={{
              fontSize: "56px",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#241915",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Resumes, refined.
          </h1>

          <p
            style={{
              fontSize: "24px",
              color: "#5E534D",
              marginTop: "20px",
              marginBottom: "36px",
              lineHeight: 1.4,
            }}
          >
            AI-powered, ATS-optimized resume builder designed to land your dream
            role in minutes.
          </p>

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
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              Get Started Free
            </div>
            <div
              style={{
                backgroundColor: "#DCD3F2",
                color: "#241915",
                padding: "12px 20px",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              5 ATS Templates
            </div>
          </div>
        </div>

        {/* Right side: Resume Card Visual */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "380px",
            height: "480px",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            boxShadow: "0 24px 48px -12px rgba(90, 64, 50, 0.18)",
            border: "1px solid #C9CCD1",
            padding: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#E6EEF4",
              marginBottom: "20px",
            }}
          />
          <div
            style={{
              width: "180px",
              height: "22px",
              borderRadius: "6px",
              backgroundColor: "#5A4032",
              marginBottom: "12px",
            }}
          />
          <div
            style={{
              width: "120px",
              height: "14px",
              borderRadius: "4px",
              backgroundColor: "#C9CCD1",
              marginBottom: "24px",
            }}
          />
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "#E3E5E8",
              marginBottom: "20px",
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "10px",
                borderRadius: "4px",
                backgroundColor: "#E6EEF4",
              }}
            />
            <div
              style={{
                width: "90%",
                height: "10px",
                borderRadius: "4px",
                backgroundColor: "#E6EEF4",
              }}
            />
            <div
              style={{
                width: "75%",
                height: "10px",
                borderRadius: "4px",
                backgroundColor: "#E6EEF4",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "auto",
              display: "flex",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "60px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "#DCD3F2",
              }}
            />
            <div
              style={{
                width: "60px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "#DCD3F2",
              }}
            />
            <div
              style={{
                width: "60px",
                height: "24px",
                borderRadius: "6px",
                backgroundColor: "#DCD3F2",
              }}
            />
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
