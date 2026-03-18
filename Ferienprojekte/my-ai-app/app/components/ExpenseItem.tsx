"use client";

import { useState, memo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { formatDisplayDate } from "../utils/helpers";
import ds from "../styles/dashboard.module.css";
import ss from "../styles/shared.module.css";

interface ExpenseItemProps {
  expense: Doc<"expenses">;
  sessionToken: string;
  onError: (msg: string) => void;
}

function ExpenseItem({
  expense,
  sessionToken,
  onError,
}: ExpenseItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");

  const updateMutation = useMutation(api.expenses.updateExpense);
  const removeMutation = useMutation(api.expenses.removeExpense);
  const settleMutation = useMutation(api.expenses.settleExpense);

  const startEdit = () => {
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.description);
    setEditDate(expense.date);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    onError("");
    const parsed = parseFloat(editAmount);
    if (isNaN(parsed) || parsed <= 0) {
      onError("Bitte einen gültigen Betrag eingeben.");
      return;
    }
    try {
      await updateMutation({
        token: sessionToken,
        expenseId: expense._id,
        amount: parsed,
        description: editDescription.trim(),
        date: editDate,
      });
      setIsEditing(false);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Fehler");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    onError("");
    try {
      await removeMutation({ token: sessionToken, expenseId: expense._id });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Fehler");
    }
  };

  const toggleSettle = async () => {
    onError("");
    try {
      await settleMutation({ token: sessionToken, expenseId: expense._id });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Fehler");
    }
  };

  if (isEditing) {
    return (
      <li className={ds.expenseItem}>
        <div style={{ width: "100%", display: "grid", gap: "6px" }}>
          <div className={ss.formRow2}>
            <input
              type="number" step="0.01" min="0"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className={ss.inputSm}
            />
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className={ss.inputSm}
            />
          </div>
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className={ss.inputSm}
            maxLength={200}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={saveEdit} className={ss.btnSaveEdit}>Speichern</button>
            <button onClick={() => setIsEditing(false)} className={ss.btnCancelEdit}>Abbrechen</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={ds.expenseItem}>
      <div className={ds.expenseMeta}>
        <p className={ds.expenseDate}>
          {formatDisplayDate(expense.date)}
          {expense.settled && <span className={ds.settledBadge}>✓</span>}
          {expense.splitGroupId && (
            <span className={ds.splitBadge}>Geteilt</span>
          )}
        </p>
        <p className={`${ds.expenseText} ${expense.settled ? ds.expenseTextSettled : ""}`}>
          {expense.description}
        </p>
      </div>
      <div className={ds.expenseActions}>
        <span className={ds.amountPill}>{expense.amount.toFixed(2)} €</span>
        <button
          onClick={toggleSettle}
          className={ss.btnEditExpense}
          aria-label={expense.settled ? "Als offen markieren" : "Begleichen"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke={expense.settled ? "var(--success)" : "currentColor"}
            strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </button>
        <button onClick={startEdit} className={ss.btnEditExpense} aria-label="Bearbeiten">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className={confirmDelete ? ss.btnDeleteExpenseConfirm : ss.btnDeleteExpense}
          aria-label={confirmDelete ? "Bestaetigen" : "Loeschen"}
        >
          {confirmDelete ? (
            <span style={{ fontSize: "0.68rem", fontWeight: 700 }}>Sicher?</span>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          )}
        </button>
      </div>
    </li>
  );
}

export default memo(ExpenseItem);
