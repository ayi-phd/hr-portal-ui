"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { BrandMark, LogoutIcon } from "@/components/Icon";
import styles from "./TopNav.module.css";

/**
 * Top navigation. The employee tab set is Home + Policies Assistant; Documents
 * is the HR-admin tab. For v0 every tab is shown in the same (employee) view —
 * role-based tab sets come later.
 */
const TABS = [
  { href: "/", label: "Home" },
  { href: "/policies-assistant", label: "Policies Assistant" },
  { href: "/documents", label: "Documents" },
] as const;

export function TopNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>
            <BrandMark />
          </span>
          <span className={styles.brandName}>Fractal HR</span>
        </Link>

        <nav className={styles.tabs}>
          {TABS.map((tab) => {
            const active =
              tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={active ? `${styles.tab} ${styles.tabActive}` : styles.tab}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button type="button" className={styles.logout} onClick={logout}>
        <LogoutIcon size={18} />
        Log Out
      </button>
    </header>
  );
}
