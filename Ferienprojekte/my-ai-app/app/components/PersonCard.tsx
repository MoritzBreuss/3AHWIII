"use client";

import { useState, useMemo, memo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { PersonWithExpenses } from "../utils/types";
import { getTodayDateString } from "../utils/helpers";
import ExpenseItem from "./ExpenseItem";
import ds from "../styles/dashboard.module.css";
import ss from "../styles/shared.module.css";

interface PersonCardProps {
  personData: PersonWithExpenses;
  sessionToken: string;
  onRemovePerson: (personId: Id<"people">) => void;
  onSendWhatsApp: (person: PersonWithExpenses) => void;
  onSendEmail: (person: PersonWithExpenses) => void;
  animDelay?: number;
}

function PersonCard({
  personData,
  sessionToken,
  onRemovePerson,
  onSendWhatsApp,
  onSendEmail,
  animDelay,
}: PersonCardProps) {
  const personWithContact = personData as PersonWithExpenses & {
    phone?: string;
    email?: string;
  };

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [collapsed, setCollapsed] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [cardError, setCardError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(personWithContact.phone || "");
  const [emailDraft, setEmailDraft] = useState(personWithContact.email || "");
  const [isSavingContact, setIsSavingContact] = useState(false);

  const addExpenseMutation = useMutation(api.expenses.addExpense);
  const updatePersonMutation = useMutation(api.expenses.updatePerson);

  const expenses = personData.expenses;
  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const unsettledTotal = useMemo(
    () => expenses.filter((e) => !e.settled).reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );
  const sortedExpenses = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date)),
    [expenses]
  );

  const handleAddExpense = async () => {
    if (isSubmitting) return;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setCardError("Bitte einen gültigen Betrag eingeben.");
      return;
    }
    if (!description.trim()) return;

    setCardError("");
    setIsSubmitting(true);
    try {
      await addExpenseMutation({
        token: sessionToken,
        personId: personData._id,
        amount: parsedAmount,
        description: description.trim(),
        date,
      });
      setAmount("");
      setDescription("");
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Fehler");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePerson = () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
      return;
    }
    onRemovePerson(personData._id);
  };

  const handleSaveContact = async () => {
    setCardError("");
    setIsSavingContact(true);
    try {
      await updatePersonMutation({
        token: sessionToken,
        personId: personData._id,
        phone: phoneDraft.trim() || undefined,
        email: emailDraft.trim().toLowerCase() || undefined,
      } as never);
      setShowContactModal(false);
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setIsSavingContact(false);
    }
  };

  const initials = personData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <article
        className={`${ds.personCard} fade-in-up`}
        style={{ animationDelay: `${animDelay ?? 0}ms` }}
      >
        <div className={ds.personHeader}>
          <div className={ds.personHeaderLeft}>
            <div className={ds.avatar}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <h3 className={ds.personTitle}>{personData.name}</h3>
              <p className={ds.personSubTitle}>
                {expenses.length} Eintr{expenses.length === 1 ? "ag" : "aege"} · {" "}
                {total.toFixed(2)} €
                {unsettledTotal < total && (
                  <span style={{ marginLeft: 6, opacity: 0.7 }}>
                    ({unsettledTotal.toFixed(2)} € offen)
                  </span>
                )}
                {personWithContact.phone && (
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>
                    Tel: {personWithContact.phone}
                  </span>
                )}
                {personWithContact.email && (
                  <span style={{ marginLeft: 6, opacity: 0.6 }}>
                    E-Mail: {personWithContact.email}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className={ds.personHeaderActions}>
            <button
              onClick={() => {
                setPhoneDraft(personWithContact.phone || "");
                setEmailDraft(personWithContact.email || "");
                setShowContactModal(true);
              }}
              className={ss.btnIcon}
              aria-label="Kontakt bearbeiten"
              title="Kontakt bearbeiten"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.64 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.21a2 2 0 0 1 2.11-.45c.84.31 1.72.52 2.62.64A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
            <button
              onClick={() => setCollapsed((v) => !v)}
              className={ss.btnIcon}
              aria-label={collapsed ? "Aufklappen" : "Einklappen"}
            >
              <svg
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                style={{
                  transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
                  transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <button
              onClick={handleRemovePerson}
              className={confirmRemove ? ss.btnDangerConfirm : ss.btnDanger}
              aria-label={confirmRemove ? "Bestaetigen" : `${personData.name} entfernen`}
            >
              {confirmRemove ? (
                <span style={{ fontSize: "0.72rem" }}>
                  {expenses.length > 0
                    ? `Sicher? (${expenses.length} Ausgaben werden geloescht)`
                    : "Sicher?"}
                </span>
              ) : (
                "×"
              )}
            </button>
          </div>
        </div>

        {cardError && (
          <div className={ss.cardError} role="alert">
            {cardError}
            <button onClick={() => setCardError("")} className={ss.errorClose}>
              ×
            </button>
          </div>
        )}

        {!collapsed && (
          <>
            <div className={ss.formStack}>
              <div className={ss.formRowExpenseActions}>
                <div className={ss.inputGroup}>
                  <span className={ss.inputPrefix}>EUR</span>
                  <input
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`${ss.input} ${ss.inputWithPrefix}`}
                  />
                </div>
                <input
                  type="date" value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={ss.input}
                />
                <button
                  onClick={handleAddExpense}
                  className={`${ss.btnAdd} btn-primary-ripple`}
                  disabled={!amount || !description.trim() || isSubmitting}
                >
                  {isSubmitting ? "Wird gespeichert..." : "+ Ausgabe speichern"}
                </button>
              </div>
              <input
                type="text"
                placeholder="Beschreibung (z. B. Lebensmittel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddExpense()}
                className={ss.input}
                maxLength={200}
              />
            </div>

            {expenses.length === 0 ? (
              <div className={ds.emptyRow}>Noch keine Ausgaben vorhanden.</div>
            ) : (
              <ul className={ds.expenseList} role="list">
                {sortedExpenses.map((expense) => (
                  <ExpenseItem
                    key={expense._id}
                    expense={expense}
                    sessionToken={sessionToken}
                    onError={setCardError}
                  />
                ))}
              </ul>
            )}

            <div className={ds.personFooter}>
              <div className={ds.totalRow}>
                <p className={ds.totalLabel}>Gesamt</p>
                <p className={ds.totalValue}>{total.toFixed(2)} €</p>
              </div>
              <div className={ss.formRow2}>
                <button
                  onClick={() => onSendWhatsApp(personData)}
                  className={`${ss.btnWhatsApp} ${expenses.length === 0 ? ss.btnDisabled : ""} btn-primary-ripple`}
                  disabled={expenses.length === 0}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M11.956 0C5.349 0 0 5.35 0 11.956c0 2.089.544 4.065 1.491 5.784L0 24l6.481-1.457A11.906 11.906 0 0 0 11.956 23.91C18.562 23.91 24 18.561 24 11.955 24 5.349 18.562 0 11.956 0zm0 21.817a9.866 9.866 0 0 1-5.031-1.376l-.36-.214-3.742.841.852-3.648-.235-.374a9.86 9.86 0 0 1-1.517-5.047C1.923 6.471 6.472 1.923 11.957 1.923c5.484 0 9.932 4.448 9.932 9.932 0 5.485-4.447 9.962-9.932 9.962z" />
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={() => onSendEmail(personData)}
                  className={`${ss.btnEmail} ${expenses.length === 0 ? ss.btnDisabled : ""} btn-primary-ripple`}
                  disabled={expenses.length === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  E-Mail senden
                </button>
              </div>
            </div>
          </>
        )}
      </article>

      {showContactModal && (
        <div className={ds.modalOverlay} onClick={() => setShowContactModal(false)}>
          <div
            className={ds.modalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`contact-modal-${personData._id}`}
          >
            <div className={ds.modalHeader}>
              <h3 className={ds.modalTitle} id={`contact-modal-${personData._id}`}>
                Kontakt bearbeiten
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className={ds.modalClose}
                aria-label="Schliessen"
              >
                ×
              </button>
            </div>

            <div className={ss.formStack}>
              <input
                type="tel"
                placeholder="Telefonnummer"
                value={phoneDraft}
                onChange={(e) => setPhoneDraft(e.target.value)}
                className={ss.input}
              />
              <input
                type="email"
                placeholder="name@beispiel.de"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className={ss.input}
                autoComplete="email"
              />
              <div className={ss.formRowButtons}>
                <button
                  onClick={() => setShowContactModal(false)}
                  className={ss.btnOutline}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveContact}
                  className={`${ss.btnPrimary} btn-primary-ripple`}
                  disabled={isSavingContact}
                >
                  {isSavingContact ? "Speichert..." : "Speichern"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(PersonCard);
