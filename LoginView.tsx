import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, Shield, Star } from "lucide-react";
import logo from "./assets/logo1.png";
interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLogin = () => {
    setIsAnimating(true);
    // Simulate API call/transition delay
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#FFFFFF",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: scale(0.95); }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; }
        .animate-fade-out { animation: fadeOut 0.5s ease-in forwards; }
        
        .google-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          padding: 14px;
          border-radius: 8px;
          border: 1px solid #E0E6ED;
          background: white;
          color: #2C3E50;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .google-btn:hover {
          background: #F8FAFC;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border-color: #CBD5E1;
        }
        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #475569;
          font-size: 15px;
        }
      `}</style>

      {/* Left Side - Login Form */}
      <div
        className={isAnimating ? "animate-fade-out" : "animate-slide-up"}
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          maxWidth: "600px",
        }}
      >
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #F97316 0%, #7C2D12 100%)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "24px",
              marginBottom: "24px",
            }}
          >
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
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "#1E293B",
              marginBottom: "12px",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ fontSize: "16px", color: "#64748B", lineHeight: 1.6 }}>
            Sign in to access your professional resumes and continue building
            your career.
          </p>
        </div>

        <div style={{ marginBottom: "40px" }}>
          <button className="google-btn" onClick={handleLogin}>
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              style={{ width: "20px", height: "20px" }}
            />
            Sign in with Google
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "24px 0",
              color: "#94A3B8",
            }}
          >
            <div
              style={{ flex: 1, height: "1px", background: "#E2E8F0" }}
            ></div>
            <span style={{ padding: "0 16px", fontSize: "14px" }}>or</span>
            <div
              style={{ flex: 1, height: "1px", background: "#E2E8F0" }}
            ></div>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <div className="feature-item">
              <CheckCircle size={20} color="#27AE60" />
              <span>Unlimited Resume Edits</span>
            </div>
            <div className="feature-item">
              <Shield size={20} color="#F97316" />
              <span>Secure Cloud Storage</span>
            </div>
            <div className="feature-item">
              <Star size={20} color="#F39C12" />
              <span>Premium Templates</span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: "14px", color: "#94A3B8", textAlign: "center" }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>

      {/* Right Side - Visual */}
      <div
        style={{
          flex: 1.2,
          background: "#F1F5F9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 50% 50%, #E2E8F0 0%, #F1F5F9 100%)",
          }}
        />

        {/* Abstract Resume Preview Cards */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "340px",
              height: "480px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
              position: "absolute",
              transform: "rotate(-6deg) translateX(-40px)",
              zIndex: 1,
              opacity: 0.8,
            }}
          />
          <div
            style={{
              width: "340px",
              height: "480px",
              background: "white",
              borderRadius: "16px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
              position: "absolute",
              transform: "rotate(6deg) translateX(40px)",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              padding: "30px",
              overflow: "hidden",
            }}
          >
            {/* Mock Resume Content */}
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "#F1F5F9",
                marginBottom: "20px",
              }}
            />
            <div
              style={{
                width: "140px",
                height: "24px",
                background: "#E2E8F0",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            />
            <div
              style={{
                width: "100px",
                height: "16px",
                background: "#F1F5F9",
                borderRadius: "4px",
                marginBottom: "30px",
              }}
            />

            <div
              style={{
                width: "100%",
                height: "2px",
                background: "#F1F5F9",
                marginBottom: "20px",
              }}
            />

            <div
              style={{
                width: "80%",
                height: "12px",
                background: "#F1F5F9",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            />
            <div
              style={{
                width: "90%",
                height: "12px",
                background: "#F1F5F9",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            />
            <div
              style={{
                width: "70%",
                height: "12px",
                background: "#F1F5F9",
                borderRadius: "4px",
                marginBottom: "12px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
