"use client";

import { useMemo } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { PersonWithExpenses } from "../utils/types";
import ds from "../styles/dashboard.module.css";
import ss from "../styles/shared.module.css";

interface BalanceSummaryProps {
  people: PersonWithExpenses[];
  sessionToken: string;
}

export default function BalanceSummary({
  people,
  sessionToken,
}: BalanceSummaryProps) {
  const settleAllMutation = useMutation(api.expenses.settleAllForPerson);

  const balances = useMemo(() => {
    return people
      .map((p) => {
        const totalAll = p.expenses.reduce((s, e) => s + e.amount, 0);
        const totalSettled = p.expenses
          .filter((e) => e.settled)
          .reduce((s, e) => s + e.amount, 0);
        const totalOpen = totalAll - totalSettled;
        return { ...p, totalAll, totalSettled, totalOpen };
      })
      .filter((p) => p.expenses.length > 0)
      .sort((a, b) => b.totalOpen - a.totalOpen);
  }, [people]);

  const handleSettle = async (personId: typeof people[0]["_id"]) => {
    try {
      await settleAllMutation({ token: sessionToken, personId });
    } catch (err) {
      console.error("Settle failed:", err);
      alert("Ausgleich fehlgeschlagen. Bitte versuche es erneut.");
    }
  };

  if (balances.length === 0) {
    return (
      <div className={`${ds.balanceCard} fade-in-up`}>
        <p className={ds.emptyRow}>Keine Salden vorhanden.</p>
      </div>
    );
  }

  return (
    <div className={`${ds.balanceCard} fade-in-up`}>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>
        Salden-Uebersicht
      </h3>
      {balances.map((b) => (
        <div key={b._id} className={ds.balanceRow}>
          <div>
            <p className={ds.balanceName}>{b.name}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
              {b.totalAll.toFixed(2)} € gesamt
              {b.totalSettled > 0 && ` · ${b.totalSettled.toFixed(2)} € beglichen`}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className={`${ds.balanceAmount} ${b.totalOpen === 0 ? ds.balanceSettled : ""}`}
            >
              {b.totalOpen > 0 ? `${b.totalOpen.toFixed(2)} € offen` : "Beglichen ✓"}
            </span>
            {b.totalOpen > 0 && (
              <button
                onClick={() => handleSettle(b._id)}
                className={ss.btnSettle}
                aria-label={`${b.name} begleichen`}
              >
                ✓
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
