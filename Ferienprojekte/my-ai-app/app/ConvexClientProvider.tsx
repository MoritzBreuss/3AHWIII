"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode, Component, ErrorInfo } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "Missing NEXT_PUBLIC_CONVEX_URL environment variable. " +
    "Create a .env.local file in the project root with:\n" +
    "NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud"
  );
}
const convex = new ConvexReactClient(convexUrl);

class ConvexErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Convex error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "20px",
            background: "var(--bg-app, #f0f4ff)",
            color: "var(--text-primary, #111)",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            Verbindungsfehler
          </h2>
          <p style={{ fontSize: "0.9rem", opacity: 0.7, maxWidth: "320px" }}>
            Es ist ein Fehler aufgetreten. Bitte lade die Seite neu.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#4f46e5",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ConvexErrorBoundary>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ConvexErrorBoundary>
  );
}