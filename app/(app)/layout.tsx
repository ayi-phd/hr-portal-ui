import { RequireAuth } from "@/components/RequireAuth";
import { TopNav } from "@/components/TopNav";
import styles from "./layout.module.css";

/**
 * Shell for every signed-in page: auth guard + top navigation.
 * The route group "(app)" keeps these routes at the site root (/,
 * /policies-assistant, /documents) while sharing this layout.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className={styles.shell}>
        <TopNav />
        <main className={styles.main}>{children}</main>
      </div>
    </RequireAuth>
  );
}
