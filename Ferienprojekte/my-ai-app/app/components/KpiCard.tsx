"use client";

import { memo } from "react";
import ds from "../styles/dashboard.module.css";

interface KpiCardProps {
  label: string;
  value: string;
  icon: string;
  accent?: boolean;
}

function KpiCard({ label, value, icon, accent }: KpiCardProps) {
  const iconSvg =
    icon === "users" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ) : icon === "list" ? (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 7h8M8 11h5M8 15h6" />
      </svg>
    ) : (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    );

  return (
    <div className={`${ds.kpiCard} ${accent ? ds.kpiCardAccent : ""}`}>
      <span className={ds.kpiIcon}>{iconSvg}</span>
      <p className={ds.kpiLabel}>{label}</p>
      <p className={`${ds.kpiValue} ${accent ? ds.kpiValueAccent : ""}`}>
        {value}
      </p>
    </div>
  );
}

export default memo(KpiCard);
