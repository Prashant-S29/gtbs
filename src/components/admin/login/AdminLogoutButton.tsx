"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/authClient";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const { error } = await authClient.signOut();

      if (error) {
        setLogoutError("Sign out failed. Please try again.");
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setLogoutError("Sign out failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={isLoggingOut ? "Signing out" : "Sign out"}
        aria-describedby={logoutError ? "admin-logout-error" : undefined}
        className="inline-flex h-10 w-10 items-center justify-center gap-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-60 sm:w-auto sm:px-4"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </span>
      </button>
      {logoutError && (
        <p id="admin-logout-error" role="alert" className="sr-only">
          {logoutError}
        </p>
      )}
    </div>
  );
}
