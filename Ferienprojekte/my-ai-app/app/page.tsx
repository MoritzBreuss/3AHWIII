"use client";

import Link from "next/link";
import styles from "./styles/hub.module.css";
import { useTheme } from "./hooks/useTheme";

const SNAPGRID_URL = "https://collage-app-zeta.vercel.app";
const PACEVAULT_URL = "https://pacevault.vercel.app";

export default function Home() {
  const { theme, toggle } = useTheme();

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <button
          className={styles.themeToggle}
          type="button"
          onClick={toggle}
          aria-label="Theme wechseln"
          title="Theme wechseln"
        >
          {theme === "dark" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      <section className={styles.hero}>
        <h1>Meine Projekte</h1>
        <p>Wähle ein Projekt aus, um es zu öffnen.</p>
      </section>

      <section className={styles.grid} aria-label="Projekte">
        <article className={styles.card}>
          <div className={styles.cardIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v10" />
              <path d="M8.5 10.2c0-1.2 1.1-2.2 3.5-2.2 2.1 0 3.3.9 3.3 2.1 0 1.3-1.1 1.8-3 2.3-2 .5-3 1-3 2.3 0 1.2 1.1 2.3 3.5 2.3 2.2 0 3.5-1 3.5-2.3" />
            </svg>
          </div>
          <h2>Fairshare</h2>
          <p>Expense Tracker mit Login, Split-Bills und PDF-Export.</p>
          <Link className={styles.button} href="/expense-tracker">
            Öffnen
          </Link>
        </article>

        <article className={styles.card}>
          <div className={styles.cardIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="8" height="8" rx="2" />
              <rect x="13" y="3" width="8" height="8" rx="2" />
              <rect x="3" y="13" width="8" height="8" rx="2" />
              <rect x="13" y="13" width="8" height="8" rx="2" />
            </svg>
          </div>
          <h2>SnapGrid</h2>
          <p>Privacy-first Collage App mit Drag &amp; Drop und Export.</p>
          <a
            className={styles.button}
            href={SNAPGRID_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Öffnen
          </a>
        </article>

        <article className={styles.card}>
          <div className={styles.cardIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
          </div>
          <h2>PaceVault</h2>
          <p>Garmin-Fitness API mit sicheren Endpunkten und Normalisierung.</p>
          <a
            className={styles.button}
            href={PACEVAULT_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Öffnen
          </a>
        </article>
      </section>
    </main>
  );
}
