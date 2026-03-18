"use client";

import { memo } from "react";
import ds from "../styles/dashboard.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className={ds.pagination}>
      <button
        className={`${ds.pageBtn} ${currentPage === 1 ? ds.pageBtnDisabled : ""}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Vorherige Seite"
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`${ds.pageBtn} ${p === currentPage ? ds.pageBtnActive : ""}`}
          onClick={() => onPageChange(p)}
          aria-label={`Seite ${p}`}
        >
          {p}
        </button>
      ))}
      <button
        className={`${ds.pageBtn} ${currentPage === totalPages ? ds.pageBtnDisabled : ""}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Naechste Seite"
      >
        ›
      </button>
    </div>
  );
}

export default memo(Pagination);
