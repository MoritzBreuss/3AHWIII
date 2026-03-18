"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function useSession() {
  const hasRefreshedRef = useRef(false);
  const hasCleanupRunRef = useRef(false);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("expense_session");
  });
  const [username, setUsername] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("expense_username") || "";
  });
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const sessionData = useQuery(
    api.users.validateSession,
    sessionToken ? { token: sessionToken } : "skip"
  );
  const refreshSessionMutation = useMutation(api.users.refreshSession);
  const cleanupExpiredSessionsMutation = useMutation(api.users.cleanupExpiredSessions);

  useEffect(() => {
    setIsCheckingSession(false);
  }, []);

  useEffect(() => {
    if (hasCleanupRunRef.current) return;
    hasCleanupRunRef.current = true;

    cleanupExpiredSessionsMutation({ limit: 500 }).catch(() => {
      // Ignore cleanup failures; this is best-effort maintenance.
    });
  }, [cleanupExpiredSessionsMutation]);

  useEffect(() => {
    if (!sessionToken || hasRefreshedRef.current) return;
    hasRefreshedRef.current = true;

    refreshSessionMutation({ token: sessionToken })
      .then((result) => {
        if (!result) {
          setSessionToken(null);
          setUsername("");
          sessionStorage.removeItem("expense_session");
          sessionStorage.removeItem("expense_username");
          return;
        }

        setSessionToken(result.sessionToken);
        setUsername(result.username);
        sessionStorage.setItem("expense_session", result.sessionToken);
        sessionStorage.setItem("expense_username", result.username);
      })
      .catch(() => {
        setSessionToken(null);
        setUsername("");
        sessionStorage.removeItem("expense_session");
        sessionStorage.removeItem("expense_username");
      });
  }, [sessionToken, refreshSessionMutation]);

  // If server says session is invalid, force logout
  useEffect(() => {
    if (sessionData === null && sessionToken) {
      setSessionToken(null);
      setUsername("");
      sessionStorage.removeItem("expense_session");
      sessionStorage.removeItem("expense_username");
    }
  }, [sessionData, sessionToken]);

  const logoutMutation = useMutation(api.users.logout);

  const login = useCallback((token: string, name: string) => {
    hasRefreshedRef.current = false;
    setSessionToken(token);
    setUsername(name);
    sessionStorage.setItem("expense_session", token);
    sessionStorage.setItem("expense_username", name);
  }, []);

  const logout = useCallback(async () => {
    if (sessionToken) {
      try {
        await logoutMutation({ token: sessionToken });
      } catch {
        // Ignore errors on logout
      }
    }
    setSessionToken(null);
    setUsername("");
    sessionStorage.removeItem("expense_session");
    sessionStorage.removeItem("expense_username");
  }, [sessionToken, logoutMutation]);

  return { sessionToken, username, isCheckingSession, login, logout };
}
