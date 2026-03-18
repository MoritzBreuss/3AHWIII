"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import type { PersonWithExpenses } from "../utils/types";
import { ITEMS_PER_PAGE } from "../utils/constants";
import {
  getTodayDateString,
  formatDisplayDate,
  downloadCSV,
} from "../utils/helpers";
import { exportPdf } from "../utils/exportPdf";
import KpiCard from "./KpiCard";
import FilterBar from "./FilterBar";
import PersonCard from "./PersonCard";
import Pagination from "./Pagination";
import AccountSettings from "./AccountSettings";
import SplitExpenseModal from "./SplitExpenseModal";
import ds from "../styles/dashboard.module.css";
import ss from "../styles/shared.module.css";

interface ExpenseTrackerProps {
  sessionToken: string;
  username: string;
  onLogout: () => void;
  theme: "light" | "dark";
}

export default function ExpenseTracker({
  sessionToken,
  username,
  onLogout,
  theme,
}: ExpenseTrackerProps) {
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonPhone, setNewPersonPhone] = useState("");
  const [newPersonEmail, setNewPersonEmail] = useState("");
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mutationError, setMutationError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);

  // Combined query — fixes N+1
  const rawPeopleWithExpenses =
    useQuery(api.expenses.getPeopleWithExpenses, { token: sessionToken });
  const isLoading = rawPeopleWithExpenses === undefined;
  const peopleWithExpenses: PersonWithExpenses[] = rawPeopleWithExpenses ?? [];
  const addPersonMutation = useMutation(api.expenses.addPerson);
  const removePersonMutation = useMutation(api.expenses.removePerson);

  // Computed values
  const allExpenses = useMemo(
    () => peopleWithExpenses.flatMap((p) => p.expenses),
    [peopleWithExpenses]
  );
  const totalAmount = useMemo(
    () => allExpenses.reduce((sum, e) => sum + e.amount, 0),
    [allExpenses]
  );

  // Filtered people
  const filteredPeople = useMemo(() => {
    let result = [...peopleWithExpenses];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.expenses.some((e) => e.description.toLowerCase().includes(q))
      );
    }
    return result;
  }, [peopleWithExpenses, searchQuery]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPeople.length / ITEMS_PER_PAGE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPeople = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredPeople.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPeople, safePage]);

  // Fix pagination drift when filters reduce pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Handlers
  const addPerson = useCallback(async () => {
    const name = newPersonName.trim();
    if (!name) return;
    setMutationError("");
    try {
      await addPersonMutation({
        token: sessionToken,
        name,
        phone: newPersonPhone.trim() || undefined,
        email: newPersonEmail.trim().toLowerCase() || undefined,
      } as never);
      setNewPersonName("");
      setNewPersonPhone("");
      setNewPersonEmail("");
      setShowAddPerson(false);
    } catch (err) {
      setMutationError(
        err instanceof Error ? err.message : "Fehler beim Anlegen"
      );
    }
  }, [newPersonName, newPersonPhone, newPersonEmail, sessionToken, addPersonMutation]);

  const removePerson = useCallback(
    async (personId: Id<"people">) => {
      setMutationError("");
      try {
        await removePersonMutation({ token: sessionToken, personId });
      } catch (err) {
        setMutationError(
          err instanceof Error ? err.message : "Fehler beim Loeschen"
        );
      }
    },
    [sessionToken, removePersonMutation]
  );

  const buildOpenExpenseMessage = useCallback((person: PersonWithExpenses) => {
    const openExpenses = person.expenses.filter((e) => !e.settled);
    if (openExpenses.length === 0) {
      alert("Keine offenen Ausgaben fuer diese Person.");
      return null;
    }

    const total = openExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const lines: string[] = [`Hallo ${person.name}, hier sind meine offenen Ausgaben:\n`];
    const grouped = openExpenses.reduce(
      (acc, expense) => {
        if (!acc[expense.date]) acc[expense.date] = [];
        acc[expense.date].push(expense);
        return acc;
      },
      {} as Record<string, Doc<"expenses">[]>
    );

    Object.keys(grouped)
      .sort()
      .forEach((date) => {
        const items = grouped[date]
          .map(
            (exp) => `${exp.amount.toFixed(2)} EUR (${exp.description})`
          )
          .join(", ");
        lines.push(`${formatDisplayDate(date)}: ${items}`);
      });

    lines.push(`\nGesamt: ${total.toFixed(2)} EUR`);

    return lines.join("\n");
  }, []);

  const sendToPersonWhatsApp = useCallback((person: PersonWithExpenses) => {
    const message = buildOpenExpenseMessage(person);
    if (!message) return;

    const phoneUrl = person.phone
      ? `https://wa.me/${person.phone.replace(/[^0-9+]/g, "")}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(phoneUrl, "_blank");
  }, [buildOpenExpenseMessage]);

  const sendToPersonEmail = useCallback((person: PersonWithExpenses) => {
    const message = buildOpenExpenseMessage(person);
    if (!message) return;

    const email = ((person as PersonWithExpenses & { email?: string }).email || "").trim();
    if (!email) {
      alert("Bitte zuerst eine E-Mail fuer diese Person hinterlegen.");
      return;
    }
    const subject = encodeURIComponent(`Offene Ausgaben fuer ${person.name}`);
    const body = encodeURIComponent(message);
    const recipient = encodeURIComponent(email);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  }, [buildOpenExpenseMessage]);

  const handleExportCSV = useCallback(() => {
    try {
      const escapeCSV = (val: string) => `"${val.replace(/"/g, '""')}"`;
      const header = "Person,Datum,Beschreibung,Betrag,Beglichen\n";
      const rows = peopleWithExpenses.flatMap((p) =>
        p.expenses.map((e) =>
          [
            escapeCSV(p.name),
            e.date,
            escapeCSV(e.description),
            e.amount.toFixed(2),
            e.settled ? "Ja" : "Nein",
          ].join(",")
        )
      );
      downloadCSV(`ausgaben_${getTodayDateString()}.csv`, header + rows.join("\n"));
    } catch (err) {
      console.error("CSV export failed:", err);
      alert("CSV-Export fehlgeschlagen. Bitte versuche es erneut.");
    }
  }, [peopleWithExpenses]);

  const handleExportPDF = useCallback(async () => {
    try {
      await exportPdf(peopleWithExpenses);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF-Export fehlgeschlagen. Bitte versuche es erneut.");
    }
  }, [peopleWithExpenses]);

  return (
    <>
      <main className={ds.main}>
        {/* Hero */}
        <header className={ds.heroCard}>
          <div className={ds.heroTopRow}>
            <div>
              <p className={ds.heroEyebrow}>Finanz-Dashboard</p>
              <h1 className={ds.heroTitle}>Ausgaben-Tracker</h1>
              <p className={ds.heroSubtitle}>
                Willkommen zurueck,{" "}
                <strong className={ds.heroUsername}>{username}</strong>
              </p>
            </div>
            <div className={ds.heroActions}>
              <button
                onClick={() => setShowAccountSettings(true)}
                className={ss.btnLogout}
                aria-label="Kontoeinstellungen"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              </button>
              <button
                onClick={onLogout}
                className={ss.btnLogout}
                aria-label="Abmelden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>

          <div className={ds.kpiGrid}>
            <KpiCard
              label="Personen"
              value={String(peopleWithExpenses.length)}
              icon="users"
            />
            <KpiCard
              label="Eintraege"
              value={String(allExpenses.length)}
              icon="list"
            />
            <KpiCard
              label="Gesamt"
              value={`${totalAmount.toFixed(2)} €`}
              icon="euro"
              accent
            />
          </div>
        </header>

        {/* Filter Bar */}
        {peopleWithExpenses.length > 0 && (
          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={(v) => {
              setSearchQuery(v);
              setCurrentPage(1);
            }}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
        )}

        {/* Error */}
        {mutationError && (
          <div className={ss.errorBanner} role="alert">
            <span>{mutationError}</span>
            <button
              onClick={() => setMutationError("")}
              className={ss.errorClose}
            >
              ×
            </button>
          </div>
        )}

        {/* Add Person Panel */}
        {showAddPerson && (
          <section className={`${ss.panel} fade-in-up`}>
            <p className={ss.panelTitle}>Neue Person hinzufuegen</p>
            <p className={ss.panelHint}>
              Erstelle eine Person und beginne mit dem Tracking.
            </p>
            <div className={ss.formStack}>
              <input
                type="text"
                placeholder="Name (z. B. Mama, Team, WG)"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPerson()}
                className={ss.input}
                autoFocus
                maxLength={50}
              />
              <input
                type="tel"
                placeholder="Telefon (optional, fuer WhatsApp)"
                value={newPersonPhone}
                onChange={(e) => setNewPersonPhone(e.target.value)}
                className={ss.input}
              />
              <input
                type="email"
                placeholder="E-Mail (optional)"
                value={newPersonEmail}
                onChange={(e) => setNewPersonEmail(e.target.value)}
                className={ss.input}
                autoComplete="email"
              />
              <div className={ss.formRowButtons}>
                <button
                  onClick={() => {
                    setShowAddPerson(false);
                    setNewPersonName("");
                    setNewPersonPhone("");
                    setNewPersonEmail("");
                  }}
                  className={ss.btnOutline}
                >
                  Abbrechen
                </button>
                <button
                  onClick={addPerson}
                  className={`${ss.btnPrimary} btn-primary-ripple`}
                  disabled={!newPersonName.trim()}
                >
                  Person anlegen
                </button>
              </div>
            </div>
          </section>
        )}

        {/* People Cards */}
        {isLoading ? (
          <section className={`${ds.emptyBlock} fade-in-up`}>
            <div style={{ textAlign: "center", padding: "40px", opacity: 0.6 }}>
              <div className={ss.loadingSpinner} style={{ margin: "0 auto 16px" }} />
              <p>Daten werden geladen...</p>
            </div>
          </section>
        ) : filteredPeople.length === 0 && !searchQuery ? (
          <section className={`${ds.emptyBlock} fade-in-up`}>
            <div className={ds.emptyIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                <rect x="2" y="3" width="20" height="18" rx="2" />
                <path d="M8 7h8M8 11h5M8 15h6" />
              </svg>
            </div>
            <p className={ds.emptyTitle}>Keine Personen vorhanden</p>
            <p className={ds.emptyText}>
              Tippe auf &quot;+ Person&quot; unten, um zu starten.
            </p>
          </section>
        ) : filteredPeople.length === 0 ? (
          <section className={`${ds.emptyBlock} fade-in-up`}>
            <p className={ds.emptyTitle}>Keine Ergebnisse</p>
            <p className={ds.emptyText}>
              Aendere deine Suchkriterien.
            </p>
          </section>
        ) : (
          <>
            <section className={ds.cardsColumn}>
              {paginatedPeople.map((personData, i) => (
                <PersonCard
                  key={personData._id}
                  personData={personData}
                  sessionToken={sessionToken}
                  onRemovePerson={removePerson}
                  onSendWhatsApp={sendToPersonWhatsApp}
                  onSendEmail={sendToPersonEmail}
                  animDelay={i * 60}
                />
              ))}
            </section>
            {totalPages > 1 && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}

        <div style={{ height: 96 }} />
      </main>

      {/* Bottom Bar */}
      <nav className={`${ds.bottomBar} safe-bottom`}>
        <button
          onClick={() => setShowAddPerson((v) => !v)}
          className={`${ds.bottomCtaPrimary} ${showAddPerson ? ds.bottomCtaActive : ""} btn-primary-ripple`}
          aria-label="Person hinzufuegen"
        >
          <span
            className={ds.bottomCtaIcon}
            style={{
              transform: showAddPerson ? "rotate(45deg)" : "rotate(0deg)",
            }}
          >
            +
          </span>
          <span>{showAddPerson ? "Schliessen" : "Person hinzufuegen"}</span>
        </button>
        {peopleWithExpenses.length >= 2 && (
          <button
            onClick={() => setShowSplitModal(true)}
            className={ds.bottomCtaSecondary}
            aria-label="Ausgabe aufteilen"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: -1 }}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>
            Aufteilen
          </button>
        )}
      </nav>

      {/* Modals */}
      {showAccountSettings && (
        <AccountSettings
          sessionToken={sessionToken}
          username={username}
          onClose={() => setShowAccountSettings(false)}
        />
      )}
      {showSplitModal && peopleWithExpenses.length >= 2 && (
        <SplitExpenseModal
          people={peopleWithExpenses}
          sessionToken={sessionToken}
          onClose={() => setShowSplitModal(false)}
        />
      )}
    </>
  );
}
