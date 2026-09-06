"use client";

import { CheckCircle2, LoaderCircle, Mail, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { authClient } from "@/lib/authClient";

interface AdminPasswordResetDialogProps {
  initialEmail: string;
  onClose: () => void;
}

export default function AdminPasswordResetDialog({
  initialEmail,
  onClose,
}: AdminPasswordResetDialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailInputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  const requestReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const { error: requestError } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });
      if (requestError?.status === 429) {
        setError("Too many recovery requests. Please wait and try again.");
        return;
      }
      if (requestError) throw new Error();
      setSent(true);
    } catch {
      setError("Password recovery could not start. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        aria-describedby="forgot-password-description"
        className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="forgot-password-title"
              className="title text-xl font-bold text-gray-900"
            >
              Reset Admin password
            </h2>
            <p
              id="forgot-password-description"
              className="description mt-2 text-sm leading-6 text-gray-600"
            >
              We will email a secure, single-use reset link to the Admin
              address.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
            aria-label="Close password recovery"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div className="py-7 text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <h3 className="mt-4 text-lg font-bold text-gray-900">
              Check your email
            </h3>
            <p
              role="status"
              className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-600"
            >
              If this address matches the Admin account, a password-reset link
              has been sent.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-11 w-full rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form onSubmit={requestReset} className="mt-6">
            {error ? (
              <p
                id="password-reset-error"
                role="alert"
                className="mb-5 rounded-lg bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-700"
              >
                {error}
              </p>
            ) : null}
            <label
              htmlFor="recovery-email"
              className="text-sm font-semibold text-gray-800"
            >
              Admin email address
            </label>
            <div className="relative mt-2">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={emailInputRef}
                id="recovery-email"
                name="recoveryEmail"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby={error ? "password-reset-error" : undefined}
                className="h-12 w-full rounded-lg border border-gray-300 pl-11 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="admin@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <ShieldCheck size={17} />
              )}
              {busy ? "Sending link..." : "Send reset link"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
