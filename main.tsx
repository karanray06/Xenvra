import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import logo from "./assets/logo2.png";

// Splash Screen Component
const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const THEME_ACCENT = "#F97316";

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        background: `linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#1A1A1A",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
      }}
    >
      <style>{`
        @keyframes scaleIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeOut {
          to { opacity: 0; pointer-events: none; }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
        .splash-logo { animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .splash-text { animation: fadeInUp 0.6s ease 0.4s backwards; }
        .splash-subtitle { animation: fadeInUp 0.6s ease 0.6s backwards; }
        .splash-progress { animation: fadeOut 0.4s ease 1.8s forwards; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={logo}
            alt="Xenvra"
            style={{
              height: "50px", // Adjust height to fit your navbar
              width: "auto",
              backgroundColor: "white",
              objectFit: "contain",
            }}
          />
        </div>
        <h1
          className="splash-text"
          style={{ fontSize: "32px", fontWeight: 700, margin: "16px 0 8px 0" }}
        ></h1>
        <p
          className="splash-subtitle"
          style={{
            fontSize: "12px",
            color: "#666666",
            margin: "0 0 24px 0",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          Professional Resume Builder
        </p>

        <div
          className="splash-progress"
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "120px",
            height: "2px",
            background: `rgba(0,0,0,0.1)`,
            overflow: "hidden",
            borderRadius: "2px",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              background: THEME_ACCENT,
              transform: "translateX(-100%)",
              animation:
                "progress 1.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Root = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {!showSplash && <App onLogout={() => setShowSplash(true)} />}
    </>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Root />);
