"use client";

import { memo } from "react";
import ds from "../styles/dashboard.module.css";
import ss from "../styles/shared.module.css";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

function FilterBar({
  searchQuery,
  onSearchChange,
  onExportCSV,
  onExportPDF,
}: FilterBarProps) {
  return (
    <section className={`${ds.filterBar} fade-in-up`}>
      <input
        type="text"
        placeholder="Suche nach Name oder Beschreibung..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={ss.searchInput}
      />
      <div className={ds.filterRow}>
        <button onClick={onExportCSV} className={ss.btnExport} aria-label="CSV Export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          CSV
        </button>
        <button onClick={onExportPDF} className={ss.btnExport} aria-label="PDF Export">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          PDF
        </button>
      </div>
    </section>
  );
}

export default memo(FilterBar);