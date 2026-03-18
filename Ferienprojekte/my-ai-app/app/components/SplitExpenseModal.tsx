"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import type { PersonWithExpenses } from "../utils/types";
import { getTodayDateString } from "../utils/helpers";
import ds from "../styles/dashboard.module.css";
import ss from "../styles/shared.module.css";

interface SplitExpenseModalProps {
  people: PersonWithExpenses[];
  sessionToken: string;
  onClose: () => void;
}

export default function SplitExpenseModal({
  people,
  sessionToken,
  onClose,
}: SplitExpenseModalProps) {
  const [totalAmount, setTotalAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getTodayDateString());
  const [selectedIds, setSelectedIds] = useState<Set<Id<"people">>>(new Set());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const splitMutation = useMutation(api.expenses.splitExpense);
  const modalRef = useRef<HTMLDivElement>(null);

  // Escape key handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus first element on mount
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) focusable[0].focus();
  }, []);

  // Focus trap handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const togglePerson = (id: Id<"people">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const perPerson =
    selectedIds.size > 0 && totalAmount
      ? (parseFloat(totalAmount) / selectedIds.size).toFixed(2)
      : "0.00";

  const handleSubmit = async () => {
    setError("");
    const amt = parseFloat(totalAmount);
    if (!amt || amt <= 0) {
      setError("Bitte einen gueltigen Betrag eingeben");
      return;
    }
    if (!description.trim()) {
      setError("Bitte eine Beschreibung eingeben");
      return;
    }
    if (selectedIds.size < 2) {
      setError("Mindestens 2 Personen auswaehlen");
      return;
    }

    setIsSubmitting(true);
    try {
      await splitMutation({
        token: sessionToken,
        personIds: Array.from(selectedIds),
        totalAmount: amt,
        description: description.trim(),
        date,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Aufteilen");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={ds.modalOverlay} onClick={onClose}>
      <div
        className={ds.modalCard}
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="split-expense-title"
      >
        <div className={ds.modalHeader}>
          <h2 className={ds.modalTitle} id="split-expense-title">Ausgabe aufteilen</h2>
          <button onClick={onClose} className={ds.modalClose} aria-label="Schliessen">
            ×
          </button>
        </div>

        <div className={ds.section}>
          <div className={ss.formRow2}>
            <div className={ss.inputGroup}>
              <span className={ss.inputPrefix}>EUR</span>
              <input
                type="number" min="0" step="0.01" placeholder="Gesamtbetrag"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className={`${ss.input} ${ss.inputWithPrefix}`}
              />
            </div>
            <input
              type="date" value={date}
              onChange={(e) => setDate(e.target.value)}
              className={ss.input}
            />
          </div>
          <input
            type="text"
            placeholder="Beschreibung"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={ss.input}
            maxLength={200}
          />
        </div>

        <div className={ds.section}>
          <h3 className={ds.sectionTitle}>
            Personen auswaehlen ({selectedIds.size} gewaehlt)
          </h3>
          {selectedIds.size >= 2 && totalAmount && (
            <p className={ds.sectionHint}>
              Pro Person: {perPerson} €
            </p>
          )}
          <div style={{ display: "grid", gap: 4 }}>
            {people.map((p) => (
              <label key={p._id} className={ds.checkboxRow}>
                <input
                  type="checkbox"
                  className={ds.checkbox}
                  checked={selectedIds.has(p._id)}
                  onChange={() => togglePerson(p._id)}
                />
                <span className={ds.checkboxLabel}>{p.name}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className={ss.cardError} role="alert">{error}</div>
        )}

        <button
          onClick={handleSubmit}
          className={`${ss.btnPrimary} btn-primary-ripple`}
          disabled={isSubmitting || selectedIds.size < 2}
        >
          {isSubmitting ? "Wird aufgeteilt..." : `Auf ${selectedIds.size} Personen aufteilen`}
        </button>
      </div>
    </div>
  );
}
