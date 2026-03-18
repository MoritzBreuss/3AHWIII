"use client";

import Link from "next/link";
import { useSession } from "../hooks/useSession";
import { useTheme } from "../hooks/useTheme";
import Auth from "../Auth";
import ExpenseTracker from "../components/ExpenseTracker";
import ThemeToggle from "../components/ThemeToggle";
import ss from "../styles/shared.module.css";

export default function ExpenseTrackerPage() {
  const { sessionToken, username, isCheckingSession, login, logout } =
    useSession();
  const { theme, toggle } = useTheme();
  const navBackground =
    theme === "dark" ? "rgba(28,28,30,.85)" : "rgba(242,242,247,.85)";
  const navBorder =
    theme === "dark"
      ? "1px solid rgba(255,255,255,.12)"
      : "1px solid rgba(0,0,0,.08)";

  if (isCheckingSession) {
    return (
      <div className={ss.loadingScreen}>
        <div className={ss.loadingSpinner} />
        <p className={ss.loadingText}>Lade Session...</p>
      </div>
    );
  }

  if (!sessionToken) {
    return <Auth onAuthSuccess={login} theme={theme} onToggleTheme={toggle} />;
  }

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: navBackground,
          borderBottom: navBorder,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        aria-label="Navigation"
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            textDecoration: "none",
            color: "#5a7d9a",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "-0.1px",
            fontFamily:
              "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Zurück
        </Link>
        <span
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "-0.1px",
            color: theme === "dark" ? "#ebebf5" : "#1c1c1e",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily:
              "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          Ausgaben-Tracker
        </span>
        <ThemeToggle theme={theme} onToggle={toggle} />
      </nav>

      <div style={{ paddingTop: 60 }}>
        <ExpenseTracker
          sessionToken={sessionToken}
          username={username}
          onLogout={logout}
          theme={theme}
        />
      </div>
    </>
  );
}
