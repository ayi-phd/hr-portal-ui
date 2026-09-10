"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

/**
 * Guards a subtree: sends signed-out visitors to /login.
 * Renders nothing until the auth check has settled.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { authed, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authed) {
      router.replace("/login");
    }
  }, [ready, authed, router]);

  if (!ready || !authed) {
    return null;
  }

  return <>{children}</>;
}
