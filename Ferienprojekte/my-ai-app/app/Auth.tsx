"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import as from "./styles/auth.module.css";

interface AuthProps {
  onAuthSuccess: (sessionToken: string, username: string) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Auth({ onAuthSuccess, theme, onToggleTheme }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = useMutation(api.users.register);
  const loginMutation = useMutation(api.users.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!username.trim() || !password) {
        setError("Bitte alle Felder ausfuellen");
        return;
      }

      if (!isLogin) {
        if (password !== confirmPassword) {
          setError("Passwoerter stimmen nicht ueberein");
          return;
        }
        if (password.length < 10) {
          setError("Passwort muss mindestens 10 Zeichen lang sein");
          return;
        }
        if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
          setError("Passwort muss Gross-/Kleinbuchstaben und Zahlen enthalten");
          return;
        }
        const result = await registerMutation({ username, password });
        onAuthSuccess(result.sessionToken, result.username);
        return;
      }

      const result = await loginMutation({ username, password });
      onAuthSuccess(result.sessionToken, result.username);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={as.page} data-theme={theme}>
      <button
        className={as.floatingThemeBtn}
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
      >
        <svg
          className={as.moon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <svg
          className={as.sun}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>
      <div className={as.shell}>
        {/* Brand Hero */}
        <div className={as.brandBlock}>
          <div className={as.decCircle1} />
          <div className={as.decCircle2} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <p className={as.kicker}>Finanz-Bereich</p>
            <h1 className={as.heading}>Ausgaben-Tracker</h1>
            <p className={as.lead}>
              Verwalte Ausgaben pro Person in einer klaren,
              <br />
              sicheren Oberflaeche.
            </p>
            <div className={as.pillRow}>
              <span className={as.pill}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4, verticalAlign: -1 }}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7h8M8 11h5M8 15h6"/></svg>
                Uebersicht
              </span>
              <span className={as.pill}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4, verticalAlign: -1 }}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                WhatsApp Export
              </span>
              <span className={as.pill}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ marginRight: 4, verticalAlign: -1 }}><path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                E-Mail Export
              </span>

            </div>
          </div>
        </div>

        {/* Auth Card */}
        <section className={as.card}>
          <div className={as.tabRow}>
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`${as.tabButton} ${isLogin ? as.tabButtonActive : ""}`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`${as.tabButton} ${!isLogin ? as.tabButtonActive : ""}`}
            >
              Registrieren
            </button>
          </div>

          <form onSubmit={handleSubmit} className={as.form} noValidate>
            <div className={as.field}>
              <label className={as.label} htmlFor="auth-username">
                Benutzername
              </label>
              <div className={as.inputGroup}>
                <span className={as.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  id="auth-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={as.input}
                  placeholder="z. B. Max Mustermann"
                  disabled={isLoading}
                  autoComplete="username"
                  aria-describedby={error ? "auth-error" : undefined}
                />
              </div>
            </div>

            <div className={as.field}>
              <label className={as.label} htmlFor="auth-password">
                Passwort
              </label>
              <div className={as.inputGroup}>
                <span className={as.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={as.input}
                  placeholder="passwort eingeben"
                  disabled={isLoading}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  aria-describedby={error ? "auth-error" : undefined}
                />
              </div>
            </div>

            {!isLogin && (
              <div className={as.field}>
                <label className={as.label} htmlFor="auth-confirm">
                  Passwort bestaetigen
                </label>
                <div className={as.inputGroup}>
                  <span className={as.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 12l2 2 4-4" />
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="auth-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={as.input}
                    placeholder="Passwort wiederholen"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className={as.errorBox} role="alert" id="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`${as.primaryButton} btn-primary-ripple`}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.65 : 1 }}
            >
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                  <span className={as.spinner} />
                  Bitte warten...
                </span>
              ) : isLogin ? (
                "Anmelden →"
              ) : (
                "Konto erstellen →"
              )}
            </button>
          </form>

          <p className={as.switchHint}>
            {isLogin ? "Noch kein Konto?" : "Bereits registriert?"}{" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className={as.switchLink}
            >
              {isLogin ? "Registrieren" : "Anmelden"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
}
