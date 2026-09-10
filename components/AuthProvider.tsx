"use client";

/**
 * Placeholder auth for v0.
 *
 * Authentication is intentionally disabled: `login()` accepts anything and
 * simply marks the session as authenticated (persisted to sessionStorage so a
 * refresh keeps you signed in). Swap this out for a real provider
 * (NextAuth.js, Clerk, a custom cookie/session, ...) when auth is wired up.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "fractal-hr:authed";

interface AuthState {
  /** Whether the current visitor is "signed in". */
  authed: boolean;
  /** True once the initial sessionStorage check has run (avoids redirect flashes). */
  ready: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setAuthed(window.sessionStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      /* sessionStorage unavailable — treat as signed out */
    }
    setReady(true);
  }, []);

  const login = useCallback(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setAuthed(true);
    router.push("/");
  }, [router]);

  const logout = useCallback(() => {
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setAuthed(false);
    router.push("/login");
  }, [router]);

  const value = useMemo<AuthState>(
    () => ({ authed, ready, login, logout }),
    [authed, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
