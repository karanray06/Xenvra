import React from "react";

const THEME = {
  accent: "#F97316",
  primary: "#7C2D12",
  text: "#333333",
  textLight: "#666666",
  border: "#DEDEDE",
  white: "#FFFFFF",
};

export const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: `linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)`,
        position: "relative",
      }}
    >
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .login-container { animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .login-btn { transition: all 0.2s ease; }
        .login-btn:hover { 
          transform: translateY(-2px); 
          box-shadow: 0 8px 24px rgba(249, 115, 22, 0.2);
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: "20%",
          width: "600px",
          height: "400px",
          background: `linear-gradient(180deg, rgba(249,115,22,0.03) 0%, rgba(249,115,22,0) 100%)`,
          transform: "skewY(-12deg)",
          borderRadius: "40px",
          filter: "blur(40px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <div
        className="login-container"
        style={{
          width: "380px",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            background: `linear-gradient(135deg, ${THEME.accent} 0%, #7C2D12 100%)`,
            borderRadius: "20px",
            margin: "0 auto 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 20px 60px rgba(249, 115, 22, 0.1)`,
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={THEME.white} />
                <stop offset="100%" stopColor={THEME.white} />
              </linearGradient>
            </defs>
            <path
              d="M 10 10 L 30 30"
              stroke={THEME.white}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M 30 10 L 10 30"
              stroke={THEME.white}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="8" cy="8" r="2" fill={THEME.white} />
            <circle cx="32" cy="32" r="2" fill={THEME.white} />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "16px",
            color: THEME.primary,
            letterSpacing: "-0.03em",
          }}
        >
          Xenvra
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: THEME.textLight,
            marginBottom: "48px",
            lineHeight: "1.6",
            padding: "0 20px",
          }}
        >
          Professional Resume Builder with AI-Powered Enhancements
        </p>

        <button
          onClick={onLogin}
          className="login-btn"
          style={{
            width: "100%",
            height: "48px",
            borderRadius: "10px",
            border: `1px solid ${THEME.border}`,
            background: `linear-gradient(180deg, ${THEME.white} 0%, #f5f5f5 100%)`,
            color: THEME.text,
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            boxShadow: `0 4px 12px rgba(0,0,0,0.08)`,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div
          style={{
            marginTop: "32px",
            fontSize: "12px",
            color: THEME.textLight,
          }}
        >
          Protected by reCAPTCHA and subject to the Privacy Policy.
        </div>
      </div>
    </div>
  );
};
