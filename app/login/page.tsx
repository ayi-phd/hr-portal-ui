"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BrandMark } from "@/components/Icon";
import styles from "./login.module.css";

/**
 * Login page. Authentication is disabled for v0 — submitting the form (with any
 * values, or none) signs you in and forwards to the employee dashboard.
 */
export default function LoginPage() {
  const { authed, ready, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && authed) {
      router.replace("/");
    }
  }, [ready, authed, router]);

  return (
    <div className={styles.screen}>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <div className={styles.brand}>
          <span className={styles.brandMark}>
            <BrandMark />
          </span>
          <span className={styles.brandName}>Fractal HR</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="username" />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
          />
        </div>

        <button type="submit" className={styles.submit}>
          Submit
        </button>
      </form>
    </div>
  );
}
