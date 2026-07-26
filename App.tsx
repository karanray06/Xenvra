import React, { useState } from "react";
import { AIAssistant } from "./AIAssistant";
import { LoginView } from "./LoginView";
import logo from "./assets/logo.png";
import logo1 from "./assets/logo1.png";
import { StrengthMeter } from "./components/StrengthMeter";
import { JobMatcher } from "./components/JobMatcher";
import { WebProfile } from "./components/WebProfile";
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Zap,
  Layout,
  Settings,
  LogOut,
  ChevronRight,
  Star,
  Shield,
  CheckCircle,
  Download,
  Share2,
  Sparkles,
  Bot,
  PenTool,
  Eye,
  Grid,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Linkedin, // Added Linkedin Icon
} from "lucide-react";

// --- Interfaces ---

interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

// --- Colors ---

const colors = {
  primary: "#7C2D12",
  secondary: "#9A3412",
  accent: "#F97316",
  accentDark: "#EA580C",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  border: "#E2E8F0",
  text: "#1E293B",
  textLight: "#64748B",
  success: "#27AE60",
  danger: "#EF4444",
  warning: "#F59E0B",
  white: "#FFFFFF",
};

const logos = [
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    alt: "Google",
    height: "30px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg",
    alt: "Infosys",
    height: "30px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
    alt: "Nvidia",
    height: "20px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7c/AMD_Logo.svg",
    alt: "AMD",
    height: "20px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
    alt: "OpenAI",
    height: "30px",
  },
  {
    src: "https://cdn.worldvectorlogo.com/logos/samsung-8.svg",
    alt: "Samsung",
    height: "30px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    alt: "Amazon",
    height: "30px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg",
    alt: "Microsoft",
    height: "30px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    alt: "Meta",
    height: "25px",
  },
  {
    src: "https://i.logos-download.com/113971/29583-s2560-9598f09d0f40cf2bc3d3c47217493980.png/Tata_Consultancy_Services_Logo_2020-s2560.png?dl",
    alt: "TCS",
    height: "30px",
  },
  {
    src: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Wipro_Primary_Logo_Color_RGB.svg",
    alt: "Wipro",
    height: "50px",
  },

  {
    src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    alt: "Apple",
    height: "30px",
  },

  {
    src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    alt: "Netflix",
    height: "30px",
  },
];
const ResumePreview = ({ template, resume, colors, id }: any) => {
  const content = () => {
    if (template === "modern") {
      return (
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "13px",
            lineHeight: "1.6",
            color: colors.text,
          }}
        >
          <div
            style={{
              borderBottom: `2px solid ${colors.text} `,
              paddingBottom: "16px",
              marginBottom: "20px",
            }}
          >
            <h1
              style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700 }}
            >
              {resume.fullName}
            </h1>
            <p
              style={{
                margin: "0 0 10px 0",
                fontSize: "14px",
                color: colors.accent,
                fontWeight: 600,
              }}
            >
              {resume.title}
            </p>
            <div
              style={{
                display: "flex",
                gap: "16px",
                flexWrap: "wrap",
                fontSize: "12px",
                color: colors.textLight,
              }}
            >
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>{resume.phone}</span>}
              {resume.location && <span>{resume.location}</span>}
            </div>
          </div>

          {resume.summary && (
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: colors.primary,
                  marginBottom: "8px",
                }}
              >
                Summary
              </h3>
              <p style={{ margin: 0, fontSize: "12px" }}>{resume.summary}</p>
            </div>
          )}

          {resume.experience.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: colors.primary,
                  marginBottom: "12px",
                }}
              >
                Experience
              </h3>
              {resume.experience.map((exp: any) => (
                <div key={exp.id} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>{exp.jobTitle}</span>
                    <span style={{ color: colors.textLight, fontSize: "12px" }}>
                      {exp.startDate} -{" "}
                      {exp.currentlyWorking ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontSize: "12px",
                      color: colors.textLight,
                    }}
                  >
                    {exp.company} • {exp.location}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px" }}>
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {resume.education.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: colors.primary,
                  marginBottom: "12px",
                }}
              >
                Education
              </h3>
              {resume.education.map((edu: any) => (
                <div key={edu.id} style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "2px",
                    }}
                  >
                    <span style={{ fontWeight: 700 }}>
                      {edu.degree} in {edu.field}
                    </span>
                    <span style={{ color: colors.textLight, fontSize: "12px" }}>
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12px",
                      color: colors.textLight,
                    }}
                  >
                    {edu.school}
                  </p>
                </div>
              ))}
            </div>
          )}

          {resume.skills.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: colors.primary,
                  marginBottom: "8px",
                }}
              >
                Skills
              </h3>
              <p style={{ margin: 0, fontSize: "12px" }}>
                {resume.skills.join(" • ")}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (template === "minimal") {
      return (
        <div
          style={{
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontSize: "13px",
            lineHeight: "1.8",
            color: colors.text,
          }}
        >
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                margin: "0 0 6px 0",
                fontSize: "32px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              {resume.fullName}
            </h1>
            <p
              style={{
                margin: "0 0 12px 0",
                fontSize: "14px",
                color: colors.textLight,
              }}
            >
              {resume.title} • {resume.location}
            </p>
            <div
              style={{
                fontSize: "12px",
                color: colors.textLight,
                display: "flex",
                gap: "12px",
              }}
            >
              {resume.email && <span>{resume.email}</span>}
              {resume.phone && <span>{resume.phone}</span>}
            </div>
          </div>

          {resume.summary && (
            <div style={{ marginBottom: "32px", fontSize: "13px" }}>
              <p style={{ margin: 0 }}>{resume.summary}</p>
            </div>
          )}

          {resume.experience.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: colors.primary,
                  marginBottom: "16px",
                  letterSpacing: "1px",
                }}
              >
                Experience
              </h3>
              {resume.experience.map((exp: any) => (
                <div key={exp.id} style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "13px" }}>
                      {exp.jobTitle}
                    </span>
                    <span style={{ color: colors.textLight, fontSize: "12px" }}>
                      {exp.startDate} -{" "}
                      {exp.currentlyWorking ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: "0 0 6px 0",
                      fontSize: "13px",
                      color: colors.textLight,
                    }}
                  >
                    {exp.company}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px" }}>
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {resume.skills.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: colors.primary,
                  marginBottom: "10px",
                  letterSpacing: "1px",
                }}
              >
                Skills
              </h3>
              <p style={{ margin: 0, fontSize: "13px" }}>
                {resume.skills.join(" • ")}
              </p>
            </div>
          )}

          {resume.education.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: colors.primary,
                  marginBottom: "12px",
                  letterSpacing: "1px",
                }}
              >
                Education
              </h3>
              {resume.education.map((edu: any) => (
                <div key={edu.id} style={{ marginBottom: "12px" }}>
                  <span style={{ fontWeight: 600, fontSize: "13px" }}>
                    {edu.degree} in {edu.field}
                  </span>
                  <p
                    style={{
                      margin: "2px 0 0 0",
                      fontSize: "12px",
                      color: colors.textLight,
                    }}
                  >
                    {edu.school}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: "13px",
          lineHeight: "1.6",
          color: colors.text,
        }}
      >
        <div
          style={{
            borderLeft: `4px solid ${colors.accent} `,
            paddingLeft: "16px",
            marginBottom: "24px",
          }}
        >
          <h1
            style={{ margin: "0 0 8px 0", fontSize: "28px", fontWeight: 700 }}
          >
            {resume.fullName}
          </h1>
          <p
            style={{
              margin: "0 0 10px 0",
              fontSize: "14px",
              color: colors.accent,
              fontWeight: 600,
            }}
          >
            {resume.title}
          </p>
          <div style={{ fontSize: "12px", color: colors.textLight }}>
            {resume.email && <div>{resume.email}</div>}
            {resume.phone && <div>{resume.phone}</div>}
            {resume.location && <div>{resume.location}</div>}
          </div>
        </div>

        {resume.summary && (
          <div style={{ marginBottom: "20px", fontSize: "12px" }}>
            <p style={{ margin: 0 }}>{resume.summary}</p>
          </div>
        )}

        {resume.experience.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: colors.accent,
                marginBottom: "12px",
              }}
            >
              Experience
            </h3>
            {resume.experience.map((exp: any) => (
              <div
                key={exp.id}
                style={{
                  marginBottom: "12px",
                  paddingLeft: "12px",
                  borderLeft: `2px solid ${colors.accent} `,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "13px" }}>
                  {exp.jobTitle}
                </div>
                <p
                  style={{
                    margin: "2px 0 4px 0",
                    fontSize: "12px",
                    color: colors.textLight,
                  }}
                >
                  {exp.company}
                </p>
                <p style={{ margin: 0, fontSize: "12px" }}>{exp.description}</p>
              </div>
            ))}
          </div>
        )}

        {resume.education.length > 0 && (
          <div>
            <h3
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: colors.accent,
                marginBottom: "12px",
              }}
            >
              Education
            </h3>
            {resume.education.map((edu: any) => (
              <div key={edu.id} style={{ marginBottom: "10px" }}>
                <div style={{ fontWeight: 600, fontSize: "13px" }}>
                  {edu.degree}
                </div>
                <p
                  style={{
                    margin: "2px 0 0 0",
                    fontSize: "12px",
                    color: colors.textLight,
                  }}
                >
                  {edu.school}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div id={id} style={{ height: "100%", width: "100%" }}>
      {content()}
    </div>
  );
};

// --- Home View ---
const HomeView = ({ setCurrentView }: any) => {
  return (
    <div
      style={{
        background: colors.background,
        minHeight: "calc(100vh - 80px)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          .hero-animate { animation: fadeIn 0.8s ease-out forwards; }
          .hover-card { transition: all 0.3s ease; }
          .hover-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08); }
          .btn-primary {
  background: ${colors.accent}; color: white; padding: 16px 36px; border-radius: 8px;
  font-weight: 600; font-size: 18px; border: none; cursor: pointer; transition: all 0.2s;
  display: inline-flex; align-items: center; gap: 8px;
}
          .btn-primary:hover { background: ${colors.accentDark}; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3); }
          .step-number {
  width: 40px; height: 40px; background: ${colors.accent}20; color: ${colors.accent};
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 18px; margin-bottom: 16px;
}
`}</style>

      {/* Hero Section */}
      <div
        style={{
          background: colors.surface,
          padding: "100px 20px 80px",
          textAlign: "center",
          borderBottom: `1px solid ${colors.border} `,
        }}
      >
        <div
          style={{ maxWidth: "1000px", margin: "0 auto" }}
          className="hero-animate"
        >
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "#FFF7ED",
              color: colors.accent,
              borderRadius: "20px",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            ✨ The #1 AI Resume Builder
          </div>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 800,
              color: colors.primary,
              marginBottom: "24px",
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
            }}
          >
            Build a Professional Resume <br />
            <span style={{ color: colors.accent }}>That Gets You Hired</span>
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: colors.textLight,
              marginBottom: "48px",
              lineHeight: 1.6,
              maxWidth: "700px",
              margin: "0 auto 48px",
            }}
          >
            Create a polished, ATS-friendly resume in minutes with our
            AI-powered builder. Join thousands of professionals landing their
            dream jobs.
          </p>
          <div
            style={{ display: "flex", gap: "16px", justifyContent: "center" }}
          >
            <button
              className="btn-primary"
              onClick={() => setCurrentView("builder")}
            >
              Create My Resume <ArrowRight size={20} />
            </button>
            <button
              onClick={() => setCurrentView("templates")}
              style={{
                padding: "16px 36px",
                background: "white",
                border: `1px solid ${colors.border} `,
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "18px",
                color: colors.text,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              View Templates
            </button>
          </div>

          <div
            style={{
              marginTop: "70px",
              width: "100%",
              overflow: "hidden", // Hides the scrollbar and content outside the box
              position: "relative",
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <style>{`
    @keyframes scroll {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .logo-track {
      display: flex;
      gap: 40px;
      width: max-content;
      animation: scroll 35s linear infinite;
    }
    .logo-track:hover {
      animation-play-state: paused; 
    }
  `}</style>

            <div className="logo-track">
              {/* We render the logos TWICE to create the seamless infinite loop */}
              {[...logos, ...logos].map((logo, index) => (
                <img
                  key={index}
                  src={logo.src}
                  alt={logo.alt}
                  style={{
                    height: logo.height || "30px",
                    opacity: 0.7,
                    flexShrink: 0, // Prevents images from squishing
                    transition: "opacity 0.3s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "0.7")}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "100px 20px", background: colors.background }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: 700,
                color: colors.primary,
                marginBottom: "16px",
              }}
            >
              How It Works
            </h2>
            <p style={{ fontSize: "18px", color: colors.textLight }}>
              Three simple steps to your new career
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "40px",
            }}
          >
            {[
              {
                title: "Choose a Template",
                desc: "Select from our collection of ATS-friendly, professionally designed templates.",
                icon: <Layout size={32} />,
              },
              {
                title: "Enter Your Details",
                desc: "Fill in your experience and skills. Our AI helper will write the descriptions for you.",
                icon: <PenTool size={32} />,
              },
              {
                title: "Download & Apply",
                desc: "Export your resume as a PDF and start applying to jobs immediately.",
                icon: <Download size={32} />,
              },
            ].map((step, i) => (
              <div
                key={i}
                className="hover-card"
                style={{
                  background: colors.surface,
                  padding: "40px",
                  borderRadius: "16px",
                  border: `1px solid ${colors.border} `,
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    background: "#EFF6FF",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.accent,
                    marginBottom: "24px",
                  }}
                >
                  {step.icon}
                </div>
                <h3
                  style={{
                    fontSize: "24px",
                    fontWeight: 700,
                    color: colors.primary,
                    marginBottom: "12px",
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: "16px",
                    color: colors.textLight,
                    lineHeight: 1.6,
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Choose Xenvra & Resume Side Section */}
      <div
        style={{
          padding: "100px 20px",
          background: colors.surface,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center",
        }}
      >
        <div style={{ maxWidth: "500px" }}>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 700,
              color: colors.primary,
              marginBottom: "24px",
            }}
          >
            Why Choose <br /> Xenvra?
          </h2>
          <p
            style={{
              fontSize: "16px",
              color: colors.textLight,
              lineHeight: 1.8,
              marginBottom: "32px",
            }}
          >
            We provide the tools you need to stand out. From AI-writing assistance to real-time ATS checking, we've got you covered.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { icon: Bot, label: "AI-Powered Writing Assistant" },
              { icon: CheckCircle, label: "Real-time ATS Score Checker" },
              { icon: Grid, label: "One-Click Layout Changes" },
              { icon: Shield, label: "Secure Cloud Storage" },
            ].map((feature, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    background: "#EFF6FF",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.accent,
                    flexShrink: 0,
                  }}
                >
                  <feature.icon size={16} />
                </div>
                <span
                  style={{
                    fontSize: "16px",
                    color: colors.primary,
                    fontWeight: 500,
                  }}
                >
                  {feature.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Resume Sample Card */}
        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Left vertical line */}
          <div
            style={{
              position: "absolute",
              left: "0",
              top: "50%",
              width: "40px",
              height: "200px",
              borderLeft: `4px solid ${colors.accent}`,
              transform: "translateY(-50%)",
            }}
          />

          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "32px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
              maxWidth: "320px",
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: colors.primary,
                  margin: "0 0 4px 0",
                }}
              >
                Karan Ray
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  color: colors.accent,
                  margin: "0 0 16px 0",
                  fontWeight: 600,
                }}
              >
                Software Engineer
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "10px", color: colors.textLight, marginBottom: "16px" }}>
                <span>karanray06@gmail.com</span>
                <span>+91 98765 43210</span>
                <span>Liuah, Howrah</span>
              </div>
              <div
                style={{
                  borderTop: `1px solid ${colors.border}`,
                  paddingTop: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: colors.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "0 0 4px 0",
                  }}
                >
                  SUMMARY
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: colors.textLight,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Passionate software engineer with experience in building scalable web applications. Dedicated to writing clean, maintainable code and solving complex problems.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: colors.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "0 0 4px 0",
                  }}
                >
                  EXPERIENCE
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: colors.primary,
                    fontWeight: 600,
                    margin: "0",
                  }}
                >
                  Software Engineer
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: colors.textLight,
                    margin: "4px 0 0 0",
                  }}
                >
                  Tech Solutions • 2022 - Present
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: colors.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "0 0 4px 0",
                  }}
                >
                  EDUCATION
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: colors.primary,
                    fontWeight: 600,
                    margin: "0",
                  }}
                >
                  Bachelor of Technology in Computer Science
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: colors.textLight,
                    margin: "4px 0 0 0",
                  }}
                >
                  JIS University • 2025
                </p>
              </div>

              <div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: colors.secondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: "0 0 4px 0",
                  }}
                >
                  SKILLS
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {["JavaScript", "TypeScript", "React", "Node.js", "HTML/CSS", "Git"].map((skill, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "11px",
                        background: "#EFF6FF",
                        color: colors.accent,
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontWeight: 600,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div style={{ padding: "100px 20px", background: colors.background }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2
              style={{
                fontSize: "36px",
                fontWeight: 700,
                color: colors.primary,
                marginBottom: "16px",
              }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {[
              {
                question: "Is Xenvra really free?",
                answer: "Yes, you can create and download unlimited resumes for free. We also offer premium features for advanced customization."
              },
              {
                question: "Will my resume pass ATS?",
                answer: "Our templates are designed to pass ATS systems. We also provide real-time ATS scoring to help you optimize your resume."
              },
            ].map((faq, i) => (
              <div key={i} style={{
                background: colors.surface,
                padding: "24px",
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
                cursor: "pointer",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: colors.primary,
                    margin: 0,
                  }}>
                    {faq.question}
                  </p>
                  <ChevronDown size={20} style={{ color: colors.textLight }} />
                </div>
                <p style={{
                  fontSize: "14px",
                  color: colors.textLight,
                  margin: "12px 0 0 0",
                  lineHeight: 1.6,
                }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
};

// --- Builder View (Modified to accept props) ---
const BuilderView = ({
  resume,
  setResume,
  activeSection,
  setActiveSection,
  selectedTemplate,
  setSelectedTemplate,
  setCurrentView,
  handleDownloadPDF,
  handleShareLinkedIn,
}: any) => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isJobMatcherOpen, setIsJobMatcherOpen] = useState(false);

  const handleAskAI = (prompt: string) => {
    setAiPrompt(prompt);
    setIsAiOpen(true);
  };

  const sections = [
    { id: "personal", label: "Personal Info", icon: <User size={18} /> },
    { id: "summary", label: "Summary", icon: <FileText size={18} /> },
    { id: "experience", label: "Experience", icon: <Briefcase size={18} /> },
    {
      id: "education",
      label: "Education",
      icon: <GraduationCap size={18} />,
    },
    { id: "skills", label: "Skills", icon: <Zap size={18} /> },
  ];

  return (
    <div
      style={{
        background: colors.background,
        minHeight: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
          .builder-container { display: flex; height: calc(100vh - 80px); overflow: hidden; }
          .sidebar { width: 280px; background: ${colors.surface}; border-right: 1px solid ${colors.border}; display: flex; flex-direction: column; }
          .editor-area { flex: 1; padding: 40px; overflow-y: auto; background: ${colors.background}; }
          .preview-area { flex: 1; padding: 40px; background: #525659; overflow-y: auto; display: flex; justify-content: center; }
          .nav-item { padding: 16px 24px; cursor: pointer; display: flex; alignItems: center; gap: 12px; color: ${colors.textLight}; font-weight: 500; transition: all 0.2s; border-left: 3px solid transparent; }
          .nav-item:hover { background: ${colors.background}; color: ${colors.primary}; }
          .nav-item.active { background: ${colors.background}; color: ${colors.accent}; border-left-color: ${colors.accent}; font-weight: 600; }
          .input-group { margin-bottom: 20px; }
          .label { display: block; font-size: 13px; font-weight: 600; color: ${colors.secondary}; margin-bottom: 8px; }
          .input { width: 100%; padding: 12px; border: 1px solid ${colors.border}; border-radius: 6px; font-size: 14px; transition: border-color 0.2s; }
          .input:focus { border-color: ${colors.accent}; outline: none; box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1); }
          .card { background: ${colors.surface}; padding: 24px; border-radius: 12px; border: 1px solid ${colors.border}; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
          .btn-ai { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; margin-left: 8px; }
        `}</style>

      {/* Toolbar */}
      <div
        style={{
          height: "60px",
          background: colors.surface,
          borderBottom: `1px solid ${colors.border} `,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={() => setCurrentView("home")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: colors.textLight,
            }}
          >
            <ArrowRight size={20} style={{ transform: "rotate(180deg)" }} />
          </button>
          <span style={{ fontWeight: 700, color: colors.primary }}>
            Untitled Resume
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setIsJobMatcherOpen(true)}
            style={{
              padding: "8px 16px",
              background: "none",
              border: `1px solid ${colors.border} `,
              borderRadius: "6px",
              color: colors.text,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={16} /> Job Match
          </button>
          <button
            onClick={() => setCurrentView("webprofile")}
            style={{
              padding: "8px 16px",
              background: "none",
              border: `1px solid ${colors.border} `,
              borderRadius: "6px",
              color: colors.text,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Globe size={16} /> Web Profile
          </button>

          <button
            onClick={handleShareLinkedIn}
            style={{
              padding: "8px 16px",
              background: "#0077b5",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Linkedin size={16} /> Share
          </button>

          <button
            onClick={handleDownloadPDF}
            style={{
              padding: "8px 16px",
              background: colors.accent,
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="builder-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div
            style={{
              padding: "20px",
              borderBottom: `1px solid ${colors.border} `,
            }}
          >
            <StrengthMeter resume={resume} />
          </div>
          <div
            style={{
              padding: "24px",
              borderBottom: `1px solid ${colors.border} `,
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: colors.textLight,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}
            >
              Sections
            </div>
            {sections.map((section) => (
              <div
                key={section.id}
                className={`nav-item ${activeSection === section.id ? "active" : ""
                  }`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.icon}
                {section.label}
              </div>
            ))}
          </div>
          <div style={{ padding: "24px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: colors.textLight,
                textTransform: "uppercase",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}
            >
              Templates
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
              }}
            >
              {["modern", "minimal", "professional"].map((t) => (
                <div
                  key={t}
                  onClick={() => setSelectedTemplate(t)}
                  style={{
                    padding: "8px",
                    border: `2px solid ${selectedTemplate === t ? colors.accent : "transparent"
                      } `,
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: colors.background,
                    textAlign: "center",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    color: colors.text, // Fixed visibility issue
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="editor-area">
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: colors.primary,
                marginBottom: "24px",
              }}
            >
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>

            {activeSection === "personal" && (
              <div className="card">
                <div className="input-group">
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    value={resume.fullName}
                    onChange={(e) =>
                      setResume({ ...resume, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="input-group">
                  <label className="label">Professional Title</label>
                  <input
                    type="text"
                    className="input"
                    value={resume.title}
                    onChange={(e) =>
                      setResume({ ...resume, title: e.target.value })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div className="input-group">
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className="input"
                      value={resume.email}
                      onChange={(e) =>
                        setResume({ ...resume, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="input-group">
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      className="input"
                      value={resume.phone}
                      onChange={(e) =>
                        setResume({ ...resume, phone: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="label">Location</label>
                  <input
                    type="text"
                    className="input"
                    value={resume.location}
                    onChange={(e) =>
                      setResume({ ...resume, location: e.target.value })
                    }
                  />
                </div>
              </div>
            )}

            {activeSection === "summary" && (
              <div className="card">
                <div className="input-group">
                  <label className="label">
                    Professional Summary
                    <button
                      className="btn-ai"
                      onClick={() =>
                        handleAskAI(
                          "Help me write a summary for a " + resume.title
                        )
                      }
                    >
                      <Sparkles size={12} /> Ask AI
                    </button>
                  </label>
                  <textarea
                    className="input"
                    style={{ minHeight: "150px", resize: "vertical" }}
                    value={resume.summary}
                    onChange={(e) =>
                      setResume({ ...resume, summary: e.target.value })
                    }
                    placeholder="Write a short professional summary..."
                  />
                </div>
              </div>
            )}

            {activeSection === "experience" && (
              <div>
                {resume.experience.map((exp: any, idx: number) => (
                  <div
                    key={exp.id}
                    className="card"
                    style={{ marginBottom: "20px", position: "relative" }}
                  >
                    <button
                      onClick={() =>
                        setResume({
                          ...resume,
                          experience: resume.experience.filter(
                            (_: any, i: number) => i !== idx
                          ),
                        })
                      }
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        color: colors.danger,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <LogOut size={16} />
                    </button>
                    <div className="input-group">
                      <label className="label">Job Title</label>
                      <input
                        type="text"
                        className="input"
                        value={exp.jobTitle}
                        onChange={(e) => {
                          const ne = [...resume.experience];
                          ne[idx] = { ...exp, jobTitle: e.target.value };
                          setResume({ ...resume, experience: ne });
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label className="label">Company</label>
                      <input
                        type="text"
                        className="input"
                        value={exp.company}
                        onChange={(e) => {
                          const ne = [...resume.experience];
                          ne[idx] = { ...exp, company: e.target.value };
                          setResume({ ...resume, experience: ne });
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                      }}
                    >
                      <div className="input-group">
                        <label className="label">Start Date</label>
                        <input
                          type="text"
                          className="input"
                          value={exp.startDate}
                          onChange={(e) => {
                            const ne = [...resume.experience];
                            ne[idx] = { ...exp, startDate: e.target.value };
                            setResume({ ...resume, experience: ne });
                          }}
                        />
                      </div>
                      <div className="input-group">
                        <label className="label">End Date</label>
                        <input
                          type="text"
                          className="input"
                          value={exp.endDate}
                          onChange={(e) => {
                            const ne = [...resume.experience];
                            ne[idx] = { ...exp, endDate: e.target.value };
                            setResume({ ...resume, experience: ne });
                          }}
                          disabled={exp.currentlyWorking}
                        />
                      </div>
                    </div>
                    <div className="input-group">
                      <label className="label">
                        Description
                        <button
                          className="btn-ai"
                          onClick={() =>
                            handleAskAI(
                              "Help me write a description for " +
                              exp.jobTitle +
                              " at " +
                              exp.company
                            )
                          }
                        >
                          <Sparkles size={12} /> Ask AI
                        </button>
                      </label>
                      <textarea
                        className="input"
                        style={{ minHeight: "100px" }}
                        value={exp.description}
                        onChange={(e) => {
                          const ne = [...resume.experience];
                          ne[idx] = { ...exp, description: e.target.value };
                          setResume({ ...resume, experience: ne });
                        }}
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setResume({
                      ...resume,
                      experience: [
                        ...resume.experience,
                        {
                          id: Date.now().toString(),
                          jobTitle: "",
                          company: "",
                          location: "",
                          startDate: "",
                          endDate: "",
                          currentlyWorking: false,
                          description: "",
                        },
                      ],
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `2px dashed ${colors.border} `,
                    borderRadius: "8px",
                    background: "none",
                    color: colors.accent,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add Experience
                </button>
              </div>
            )}

            {activeSection === "education" && (
              <div>
                {resume.education.map((edu: any, idx: number) => (
                  <div
                    key={edu.id}
                    className="card"
                    style={{ marginBottom: "20px", position: "relative" }}
                  >
                    <button
                      onClick={() =>
                        setResume({
                          ...resume,
                          education: resume.education.filter(
                            (_: any, i: number) => i !== idx
                          ),
                        })
                      }
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        color: colors.danger,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <LogOut size={16} />
                    </button>
                    <div className="input-group">
                      <label className="label">School / University</label>
                      <input
                        type="text"
                        className="input"
                        value={edu.school}
                        onChange={(e) => {
                          const ne = [...resume.education];
                          ne[idx] = { ...edu, school: e.target.value };
                          setResume({ ...resume, education: ne });
                        }}
                      />
                    </div>
                    <div className="input-group">
                      <label className="label">Degree</label>
                      <input
                        type="text"
                        className="input"
                        value={edu.degree}
                        onChange={(e) => {
                          const ne = [...resume.education];
                          ne[idx] = { ...edu, degree: e.target.value };
                          setResume({ ...resume, education: ne });
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "20px",
                      }}
                    >
                      <div className="input-group">
                        <label className="label">Start Date</label>
                        <input
                          type="text"
                          className="input"
                          value={edu.startDate}
                          onChange={(e) => {
                            const ne = [...resume.education];
                            ne[idx] = { ...edu, startDate: e.target.value };
                            setResume({ ...resume, education: ne });
                          }}
                        />
                      </div>
                      <div className="input-group">
                        <label className="label">End Date</label>
                        <input
                          type="text"
                          className="input"
                          value={edu.endDate}
                          onChange={(e) => {
                            const ne = [...resume.education];
                            ne[idx] = { ...edu, endDate: e.target.value };
                            setResume({ ...resume, education: ne });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() =>
                    setResume({
                      ...resume,
                      education: [
                        ...resume.education,
                        {
                          id: Date.now().toString(),
                          school: "",
                          degree: "",
                          field: "",
                          startDate: "",
                          endDate: "",
                        },
                      ],
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: `2px dashed ${colors.border} `,
                    borderRadius: "8px",
                    background: "none",
                    color: colors.accent,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  + Add Education
                </button>
              </div>
            )}

            {activeSection === "skills" && (
              <div className="card">
                <div className="input-group">
                  <label className="label">
                    Skills (comma separated)
                    <button
                      className="btn-ai"
                      onClick={() =>
                        handleAskAI(
                          "Suggest skills for a " + resume.title + " role"
                        )
                      }
                    >
                      <Sparkles size={12} /> Ask AI
                    </button>
                  </label>
                  <textarea
                    className="input"
                    style={{ minHeight: "100px" }}
                    value={resume.skills.join(", ")}
                    onChange={(e) =>
                      setResume({
                        ...resume,
                        skills: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "12px",
                  }}
                >
                  {resume.skills.map((skill: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        background: colors.background,
                        padding: "4px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        color: colors.primary,
                        border: `1px solid ${colors.border} `,
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="preview-area">
          <div
            style={{
              background: "white",
              width: "210mm",
              minHeight: "297mm",
              padding: "20mm",
              boxShadow: "0 0 20px rgba(0,0,0,0.2)",
              transform: "scale(0.85)",
              transformOrigin: "top center",
            }}
          >
            {/* Added ID here for PDF generation */}
            <ResumePreview
              id="resume-preview-content"
              template={selectedTemplate}
              resume={resume}
              colors={colors}
            />
          </div>
        </div>
      </div>
      <AIAssistant
        resume={resume}
        setResume={setResume}
        colors={colors}
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        initialPrompt={aiPrompt}
      />
      <JobMatcher
        resume={resume}
        isOpen={isJobMatcherOpen}
        onClose={() => setIsJobMatcherOpen(false)}
      />
    </div>
  );
};

// --- Templates View ---
const TemplatesView = ({ setSelectedTemplate, setCurrentView }: any) => {
  const [category, setCategory] = useState("All");
  const categories = ["All", "Modern", "Professional", "Creative"];

  const templates = [
    {
      id: "modern",
      name: "Modern",
      desc: "Clean and contemporary with bold accents",
      color: colors.accent,
      cat: "Modern",
    },
    {
      id: "minimal",
      name: "Minimal",
      desc: "Elegant simplicity with excellent readability",
      color: colors.success,
      cat: "Professional",
    },
    {
      id: "professional",
      name: "Professional",
      desc: "Classic design trusted by top companies",
      color: colors.warning,
      cat: "Professional",
    },
    {
      id: "creative",
      name: "Creative",
      desc: "Stand out with a unique layout",
      color: "#8B5CF6",
      cat: "Creative",
    },
  ];

  const filteredTemplates =
    category === "All"
      ? templates
      : templates.filter((t) => t.cat === category);

  return (
    <div
      style={{
        background: colors.surface,
        minHeight: "calc(100vh - 80px)",
        padding: "60px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: colors.primary,
            marginBottom: "16px",
          }}
        >
          Resume Templates
        </h1>
        <p
          style={{
            fontSize: "18px",
            color: colors.textLight,
            marginBottom: "40px",
          }}
        >
          Choose the perfect template for your career
        </p>

        {/* Filters */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "10px 24px",
                borderRadius: "20px",
                border: `1px solid ${category === cat ? colors.accent : colors.border
                  }`,
                background: category === cat ? colors.accent : "transparent",
                color: category === cat ? "white" : colors.textLight,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "32px",
          }}
        >
          {filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              style={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: "12px",
                overflow: "hidden",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              className="hover-card"
            >
              <div
                style={{
                  height: "240px",
                  background: `linear-gradient(135deg, ${tpl.color}20 0%, ${tpl.color}05 100%)`,
                  borderBottom: `3px solid ${tpl.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                <FileText size={64} color={tpl.color} opacity={0.5} />
                <div
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    right: "20px",
                    display: "flex",
                    gap: "8px",
                  }}
                >
                  <button
                    style={{
                      padding: "8px",
                      background: "white",
                      borderRadius: "50%",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                    }}
                    title="Preview"
                  >
                    <Eye size={16} color={colors.text} />
                  </button>
                </div>
              </div>
              <div style={{ padding: "24px" }}>
                <h3
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: colors.primary,
                    margin: "0 0 8px 0",
                  }}
                >
                  {tpl.name}
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: colors.textLight,
                    margin: "0 0 24px 0",
                  }}
                >
                  {tpl.desc}
                </p>
                <button
                  onClick={() => {
                    setSelectedTemplate(tpl.id);
                    setCurrentView("builder");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: colors.primary,
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Settings View ---
const SettingsView = ({ resume }: any) => (
  <div
    style={{
      background: colors.surface,
      minHeight: "calc(100vh - 80px)",
      padding: "60px 40px",
    }}
  >
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <h1
        style={{
          fontSize: "40px",
          fontWeight: 700,
          color: colors.primary,
          marginBottom: "40px",
        }}
      >
        Settings
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
        {/* Profile Settings */}
        <div
          style={{
            padding: "32px",
            background: colors.background,
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: colors.primary,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <User size={24} /> Profile Settings
          </h2>
          <div style={{ display: "grid", gap: "20px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: colors.secondary,
                  marginBottom: "8px",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Karan Ray"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  fontSize: "14px",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: colors.secondary,
                  marginBottom: "8px",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                defaultValue={resume.email}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  fontSize: "14px",
                }}
              />
            </div>
            <button
              style={{
                width: "fit-content",
                padding: "10px 24px",
                background: colors.primary,
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Update Profile
            </button>
          </div>
        </div>

        {/* Subscription */}
        <div
          style={{
            padding: "32px",
            background: "linear-gradient(135deg, #2C3E50 0%, #34495E 100%)",
            borderRadius: "12px",
            color: "white",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <Sparkles size={24} color="#F1C40F" /> Pro Plan
              </h2>
              <p style={{ opacity: 0.8, fontSize: "14px" }}>
                You are on the Pro plan. Next billing date: Dec 24, 2025.
              </p>
            </div>
            <button
              style={{
                padding: "10px 24px",
                background: "white",
                color: colors.primary,
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Manage Subscription
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div
          style={{
            padding: "32px",
            background: colors.background,
            borderRadius: "12px",
            border: `1px solid ${colors.border}`,
          }}
        >
          <h2
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: colors.primary,
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Settings size={24} /> Data Management
          </h2>
          <div style={{ display: "flex", gap: "16px" }}>
            <button
              onClick={() => {
                const dataStr = JSON.stringify(resume, null, 2);
                const blob = new Blob([dataStr], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `${resume.fullName}_resume.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{
                padding: "12px 24px",
                background: colors.surface,
                color: colors.accent,
                border: `1px solid ${colors.accent}`,
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Download size={16} /> Export JSON
            </button>
            <button
              style={{
                padding: "12px 24px",
                background: colors.surface,
                color: colors.danger,
                border: `1px solid ${colors.danger}`,
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <LogOut size={16} /> Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Dashboard Component ---

const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [currentView, setCurrentView] = useState("home");
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [activeSection, setActiveSection] = useState("personal");

  // Resume Data State
  const [resume, setResume] = useState<ResumeData>({
    fullName: "Karan Ray",
    title: "Software Engineer",
    email: "karanray06@gmail.com",
    phone: "+91 98765 43210",
    location: "Liuah, Howrah",
    website: "linkedin.com/in/karanray",
    summary:
      "Passionate software engineer with experience in building scalable web applications. Dedicated to writing clean, maintainable code and solving complex problems.",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "HTML/CSS", "Git"],
    experience: [
      {
        id: "1",
        jobTitle: "Software Engineer",
        company: "Tech Solutions",
        location: "Kolkata, India",
        startDate: "2022",
        endDate: "Present",
        currentlyWorking: true,
        description:
          "Developing and maintaining web applications using React and Node.js. Collaborating with cross-functional teams to deliver high-quality software.",
      },
    ],
    education: [
      {
        id: "1",
        school: "JIS University",
        degree: "Bachelor of Technology",
        field: "Computer Science",
        startDate: "2025",
        endDate: "2029",
      },
    ],
  });

  const handleDownloadPDF = async () => {
    // Corrected target ID
    const element = document.getElementById("resume-preview-content");
    if (!element) {
      console.error("Preview element not found");
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${resume.fullName.replace(/\s+/g, "_")}_Resume.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleShareLinkedIn = () => {
    // This simulates sharing. In a real app, you would share a public URL.
    const url = encodeURIComponent("https://xenvra.com/resume/demo"); // Example URL
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank"
    );
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div style={{ background: colors.surface, minHeight: "100vh" }}>
      <style>{`
@keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
}
        header { animation: slideDown 0.6s ease - out; }
`}</style>

      <header
        style={{
          background: colors.surface,
          borderBottom: `1px solid ${colors.border} `,
          padding: "16px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo1}
              alt="Xenvra"
              style={{
                height: "40px", // Adjust height to fit your navbar
                width: "auto",
                backgroundColor: "white",
                objectFit: "contain",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Xenvra"
              style={{
                height: "20px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </div>
        </div>

        <nav style={{ display: "flex", gap: "32px" }}>
          {[
            { id: "home", label: "Home" },
            { id: "builder", label: "Builder" },
            { id: "templates", label: "Templates" },
            { id: "settings", label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                background: "none",
                border: "none",
                fontSize: "14px",
                fontWeight: 600,
                color: currentView === item.id ? colors.accent : colors.text,
                cursor: "pointer",
                padding: "8px 0",
                borderBottom:
                  currentView === item.id
                    ? `2px solid ${colors.accent} `
                    : "none",
                transition: "all 0.3s",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={onLogout}
          style={{
            padding: "10px 20px",
            background: colors.danger, // Changed to red for prominence
            color: "white", // White text
            border: "none",
            borderRadius: "4px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </header>

      <main>
        {currentView === "home" && <HomeView setCurrentView={setCurrentView} />}
        {currentView === "builder" && (
          <BuilderView
            resume={resume}
            setResume={setResume}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            setCurrentView={setCurrentView}
            handleDownloadPDF={handleDownloadPDF}
            handleShareLinkedIn={handleShareLinkedIn}
          />
        )}
        {currentView === "templates" && (
          <TemplatesView
            setSelectedTemplate={setSelectedTemplate}
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === "settings" && <SettingsView resume={resume} />}
        {currentView === "webprofile" && (
          <WebProfile
            resume={resume}
            onBack={() => setCurrentView("builder")}
          />
        )}
      </main>

      <footer
        style={{
          background: colors.primary,
          color: colors.white,
          padding: "48px 40px",
          textAlign: "center",
        }}
      >
        <p style={{ margin: 0, opacity: 0.8, fontSize: "14px" }}>
          © 2025 Xenvra. Create your perfect resume today.
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
