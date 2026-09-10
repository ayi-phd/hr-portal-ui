import Link from "next/link";
import {
  CalendarIcon,
  CardIcon,
  ChatIcon,
  FileTextIcon,
  MegaphoneIcon,
  ReceiptIcon,
  ShieldIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/Icon";
import styles from "./home.module.css";

/**
 * Employee home dashboard — the page you land on after signing in.
 *
 * All figures/announcements/to-dos below are PLACEHOLDER sample data. Wire them
 * to real services (HRIS, payroll, benefits, a CMS for announcements) later.
 */

const TIME_OFF = { available: "18.5", vacation: "12.0", sick: "6.5" };
const PAYDAY = { date: "Fri, Sep 11", net: "$3,240.18" };
const BENEFITS = { plans: 3, list: "Medical · Dental · 401(k)", enrollment: "Oct 1–15" };

const ANNOUNCEMENTS = [
  {
    title: "Updated remote-work policy now in effect",
    body: "Core collaboration hours are now 10am–3pm local time. Review the changes and acknowledge by Sep 19.",
    meta: "Sep 8 · People Team",
  },
  {
    title: "2026 holiday schedule published",
    body: "Twelve company holidays plus two floating days. See the full calendar and plan time off early.",
    meta: "Sep 4 · People Team",
  },
  {
    title: "Expanded parental leave starts Jan 1",
    body: "Paid parental leave increases to 16 weeks for all full-time employees, effective the new year.",
    meta: "Aug 28 · Benefits",
  },
];

const TODOS = [
  { label: "Acknowledge the updated remote-work policy", due: "Due Sep 19" },
  { label: "Complete your Q3 self-review", due: "Due Sep 30" },
  { label: "Confirm your emergency contact", due: "No due date" },
];

const QUICK_LINKS = [
  { label: "Policies Assistant", href: "/policies-assistant", icon: ChatIcon, accent: true },
  { label: "Request time off", href: "#", icon: CalendarIcon },
  { label: "Submit an expense", href: "#", icon: ReceiptIcon },
  { label: "Pay stubs", href: "#", icon: FileTextIcon },
  { label: "Direct deposit", href: "#", icon: CardIcon },
  { label: "Company directory", href: "#", icon: UsersIcon },
];

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.greeting}>
        <h1>Good morning, Alex</h1>
        <p>Wednesday, September 9 · Here&rsquo;s what&rsquo;s on your plate today.</p>
      </header>

      <section className={styles.stats}>
        <article className={styles.card}>
          <div className={styles.cardLabel}>
            <CalendarIcon size={16} />
            Time off balance
          </div>
          <div className={styles.stat}>
            {TIME_OFF.available} <span>days available</span>
          </div>
          <div className={styles.statDetail}>
            <span>
              Vacation <b>{TIME_OFF.vacation}</b>
            </span>
            <span>
              Sick <b>{TIME_OFF.sick}</b>
            </span>
          </div>
          <a href="#" className={styles.cardLink}>
            Request time off &rarr;
          </a>
        </article>

        <article className={styles.card}>
          <div className={styles.cardLabel}>
            <WalletIcon size={16} />
            Next payday
          </div>
          <div className={styles.stat}>{PAYDAY.date}</div>
          <div className={styles.statDetail}>
            <span>
              Est. net deposit <b>{PAYDAY.net}</b>
            </span>
          </div>
          <a href="#" className={styles.cardLink}>
            View pay stubs &rarr;
          </a>
        </article>

        <article className={styles.card}>
          <div className={styles.cardLabel}>
            <ShieldIcon size={16} />
            Benefits
          </div>
          <div className={styles.stat}>
            {BENEFITS.plans} <span>active plans</span>
          </div>
          <div className={styles.statDetail}>
            <span>{BENEFITS.list}</span>
          </div>
          <div className={styles.pill}>Open enrollment · {BENEFITS.enrollment}</div>
        </article>
      </section>

      <section className={styles.columns}>
        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Company announcements</h2>
            <a href="#">View all</a>
          </div>
          {ANNOUNCEMENTS.map((item) => (
            <div key={item.title} className={styles.announcement}>
              <span className={styles.announcementIcon}>
                <MegaphoneIcon size={18} />
              </span>
              <div>
                <div className={styles.announcementTitle}>{item.title}</div>
                <p className={styles.announcementBody}>{item.body}</p>
                <div className={styles.announcementMeta}>{item.meta}</div>
              </div>
            </div>
          ))}
        </article>

        <article className={styles.panel}>
          <div className={styles.panelHead}>
            <h2>Your to-dos</h2>
          </div>
          {TODOS.map((todo) => (
            <label key={todo.label} className={styles.todo}>
              <input type="checkbox" />
              <span>
                {todo.label}
                <span className={styles.todoDue}>{todo.due}</span>
              </span>
            </label>
          ))}
        </article>
      </section>

      <section className={styles.quickLinks}>
        {QUICK_LINKS.map(({ label, href, icon: LinkIcon, accent }) => (
          <Link
            key={label}
            href={href}
            className={styles.quickLink}
          >
            <span
              className={
                accent
                  ? `${styles.quickIcon} ${styles.quickIconAccent}`
                  : styles.quickIcon
              }
            >
              <LinkIcon size={17} />
            </span>
            {label}
          </Link>
        ))}
      </section>
    </div>
  );
}
