import "server-only";

import { headers } from "next/headers";

import { auth, configuredAdminEmail } from "@/lib/auth";

export function getAdminAuthConfigurationIssues() {
  const issues: string[] = [];
  const email = configuredAdminEmail();
  const secret = process.env.BETTER_AUTH_SECRET?.trim() || "";

  if (!/^\S+@\S+\.\S+$/u.test(email)) {
    issues.push("ADMIN_EMAIL must be a valid email address.");
  }
  if (Buffer.byteLength(secret) < 32) {
    issues.push("BETTER_AUTH_SECRET must contain at least 32 characters.");
  }
  if (!process.env.DATABASE_URL?.trim()) {
    issues.push("DATABASE_URL is required.");
  }
  if (process.env.NODE_ENV === "production") {
    try {
      const authUrl = new URL(process.env.BETTER_AUTH_URL || "");
      const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "");
      for (const url of [authUrl, siteUrl]) {
        if (
          url.protocol !== "https:" ||
          url.username ||
          url.password ||
          url.pathname !== "/" ||
          url.search ||
          url.hash
        ) {
          throw new Error();
        }
      }
      if (authUrl.origin !== siteUrl.origin) {
        issues.push(
          "BETTER_AUTH_URL and NEXT_PUBLIC_SITE_URL must use the same origin.",
        );
      }
    } catch {
      issues.push(
        "BETTER_AUTH_URL and NEXT_PUBLIC_SITE_URL must be credential-free HTTPS origins.",
      );
    }
  }

  return issues;
}

export function isAdminAuthConfigured() {
  return getAdminAuthConfigurationIssues().length === 0;
}

export async function getAdminSession(requestHeaders: Headers) {
  if (!isAdminAuthConfigured()) return null;

  try {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (
      !session ||
      session.user.email.trim().toLowerCase() !== configuredAdminEmail()
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export async function getCurrentAdminSession() {
  return getAdminSession(await headers());
}
