"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ds from "../styles/dashboard.module.css";
import ss from "../styles/shared.module.css";

interface AccountSettingsProps {
  sessionToken: string;
  username: string;
  onClose: () => void;
}

export default function AccountSettings({
  sessionToken,
  username,
  onClose,
}: AccountSettingsProps) {
  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const changePasswordMutation = useMutation(api.users.changePassword);
  const deleteAccountMutation = useMutation(api.users.deleteAccount);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg("");
    setPasswordError(false);

    if (newPassword.length < 6) {
      setPasswordMsg("Neues Passwort muss mindestens 6 Zeichen lang sein");
      setPasswordError(true);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg("Passwoerter stimmen nicht ueberein");
      setPasswordError(true);
      return;
    }

    setIsChanging(true);
    try {
      await changePasswordMutation({
        token: sessionToken,
        currentPassword,
        newPassword,
      });
      setPasswordMsg("Passwort erfolgreich geaendert");
      setPasswordError(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordMsg(err instanceof Error ? err.message : "Fehler");
      setPasswordError(true);
    } finally {
      setIsChanging(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 5000);
      return;
    }
    if (!deletePassword) {
      setDeleteMsg("Bitte Passwort eingeben");
      return;
    }
    setIsDeleting(true);
    setDeleteMsg("");
    try {
      await deleteAccountMutation({
        token: sessionToken,
        password: deletePassword,
      });
      // Account deleted — reload
      sessionStorage.removeItem("expense_session");
      sessionStorage.removeItem("expense_username");
      window.location.reload();
    } catch (err) {
      setDeleteMsg(err instanceof Error ? err.message : "Fehler");
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
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
        aria-labelledby="account-settings-title"
      >
        <div className={ds.modalHeader}>
          <h2 className={ds.modalTitle} id="account-settings-title">Kontoeinstellungen</h2>
          <button onClick={onClose} className={ds.modalClose} aria-label="Schliessen">
            ×
          </button>
        </div>

        <p style={{ fontSize: "0.88rem", color: "var(--text-tertiary)" }}>
          Angemeldet als <strong>{username}</strong>
        </p>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className={ds.section}>
          <h3 className={ds.sectionTitle}>Passwort aendern</h3>
          <input
            type="password"
            placeholder="Aktuelles Passwort"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={ss.input}
            autoComplete="current-password"
          />
          <input
            type="password"
            placeholder="Neues Passwort (min. 6 Zeichen)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={ss.input}
            autoComplete="new-password"
          />
          <input
            type="password"
            placeholder="Neues Passwort bestaetigen"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className={ss.input}
            autoComplete="new-password"
          />
          {passwordMsg && (
            <div
              className={passwordError ? ss.cardError : ss.panel}
              style={passwordError ? undefined : { color: "var(--success-text)", background: "var(--success-subtle)" }}
              role={passwordError ? "alert" : "status"}
            >
              {passwordMsg}
            </div>
          )}
          <button
            type="submit"
            className={`${ss.btnPrimary} btn-primary-ripple`}
            disabled={isChanging}
          >
            {isChanging ? "Wird geaendert..." : "Passwort aendern"}
          </button>
        </form>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "4px 0" }} />

        {/* Delete Account */}
        <div className={ds.section}>
          <h3 className={ds.sectionTitle} style={{ color: "var(--danger-text)" }}>
            Konto loeschen
          </h3>
          <p className={ds.sectionHint}>
            Alle Daten (Personen, Ausgaben) werden unwiderruflich geloescht.
          </p>
          <input
            type="password"
            placeholder="Passwort zur Bestaetigung"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            className={ss.input}
            autoComplete="current-password"
          />
          {deleteMsg && (
            <div className={ss.cardError} role="alert">{deleteMsg}</div>
          )}
          <button
            type="button"
            onClick={handleDeleteAccount}
            className={confirmDelete ? ss.btnDangerConfirm : ss.btnDanger}
            disabled={isDeleting}
            style={confirmDelete ? { width: "100%", height: "48px" } : { width: "100%", height: "48px" }}
          >
            {isDeleting
              ? "Wird geloescht..."
              : confirmDelete
                ? "Endgueltig loeschen – bist du sicher?"
                : "Konto loeschen"}
          </button>
        </div>
      </div>
    </div>
  );
}
