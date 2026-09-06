"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/lib/authClient";

export default function AdminResetPasswordForm({
  token,
  invalidToken,
}: {
  token: string;
  invalidToken: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState(
    invalidToken || !token
      ? "This password-reset link is invalid or expired. Request a new link."
      : "",
  );

  const resetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (password.length < 12) {
      setError("Use at least 12 characters for the new password.");
      return;
    }
    if (password !== confirmation) {
      setError("The password confirmation does not match.");
      return;
    }

    setBusy(true);
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (resetError) {
        setError(
          "This password-reset link is invalid or expired. Request a new link.",
        );
        return;
      }
      setPassword("");
      setConfirmation("");
      setComplete(true);
      router.refresh();
    } catch {
      setError("The password could not be changed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-7 shadow-xl">
        {complete ? (
          <div className="text-center">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <h1 className="title mt-4 text-2xl font-bold text-gray-900">
              Password changed
            </h1>
            <p className="description mt-2 text-sm leading-6 text-gray-600">
              All previous Admin sessions were revoked. Sign in with your new
              password.
            </p>
            <Link
              href="/admin/login"
              className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Continue to sign in
            </Link>
          </div>
        ) : (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <LockKeyhole size={21} />
            </span>
            <h1 className="title mt-5 text-2xl font-bold text-gray-900">
              Choose a new password
            </h1>
            <p className="description mt-2 text-sm leading-6 text-gray-600">
              This secure reset link can be used once before it expires.
            </p>
            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}
            {token && !invalidToken ? (
              <form onSubmit={resetPassword} className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="new-admin-password"
                    className="text-sm font-semibold text-gray-800"
                  >
                    New password
                  </label>
                  <input
                    id="new-admin-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Use at least 12 characters.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="confirm-admin-password"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirm-admin-password"
                    type="password"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                    value={confirmation}
                    onChange={(event) => setConfirmation(event.target.value)}
                    className="mt-2 h-12 w-full rounded-lg border border-gray-300 px-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <LockKeyhole size={17} />
                  )}
                  {busy ? "Changing password..." : "Change password"}
                </button>
              </form>
            ) : (
              <Link
                href="/admin/login"
                className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700"
              >
                Request another link
              </Link>
            )}
          </>
        )}
      </section>
    </main>
  );
}
