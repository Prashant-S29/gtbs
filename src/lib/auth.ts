import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { after } from "next/server";

import { getDatabase } from "@/db/client";
import * as schema from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";

const LOCAL_AUTH_URL = "http://localhost:3000";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function configuredAdminEmail() {
  return normalizeEmail(process.env.ADMIN_EMAIL || "");
}

function productionOrigin(name: "BETTER_AUTH_URL" | "NEXT_PUBLIC_SITE_URL") {
  const url = new URL(process.env[name]?.trim() || "");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new Error(`${name} must be a credential-free HTTPS origin.`);
  }
  return url.origin;
}

function authBaseUrl() {
  if (process.env.NODE_ENV !== "production") return LOCAL_AUTH_URL;
  const authOrigin = productionOrigin("BETTER_AUTH_URL");
  const siteOrigin = productionOrigin("NEXT_PUBLIC_SITE_URL");
  if (authOrigin !== siteOrigin) {
    throw new Error(
      "BETTER_AUTH_URL and NEXT_PUBLIC_SITE_URL must use the same origin.",
    );
  }
  return authOrigin;
}

function authSecret() {
  return (
    process.env.BETTER_AUTH_SECRET?.trim() ||
    "development-only-better-auth-secret-change-before-deployment"
  );
}

export function createAuth(options: { allowAdminSetup?: boolean } = {}) {
  const allowAdminSetup = options.allowAdminSetup === true;

  return betterAuth({
    appName: "GTBS Admin",
    baseURL: authBaseUrl(),
    secret: authSecret(),
    trustedOrigins:
      process.env.NODE_ENV === "production"
        ? [authBaseUrl()]
        : [LOCAL_AUTH_URL, "http://127.0.0.1:3000"],
    database: drizzleAdapter(getDatabase(), {
      provider: "pg",
      schema,
    }),
    user: {
      modelName: "authUser",
      changeEmail: { enabled: false },
      deleteUser: { enabled: false },
    },
    session: {
      modelName: "authSession",
      expiresIn: 7 * 24 * 60 * 60,
      updateAge: 24 * 60 * 60,
      cookieCache: { enabled: false },
    },
    account: { modelName: "authAccount" },
    verification: { modelName: "authVerification" },
    emailAndPassword: {
      enabled: true,
      disableSignUp: !allowAdminSetup,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url, token }) => {
        if (normalizeEmail(user.email) !== configuredAdminEmail()) return;
        after(async () => {
          try {
            await sendPasswordResetEmail({
              email: user.email,
              resetUrl: url,
              token,
            });
          } catch {
            console.error("Admin password-reset email delivery failed.");
          }
        });
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      modelName: "authRateLimit",
      window: 60,
      max: 60,
      customRules: {
        "/sign-in/email": { window: 15 * 60, max: 5 },
        "/request-password-reset": { window: 15 * 60, max: 3 },
        "/reset-password": { window: 15 * 60, max: 5 },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (
              !allowAdminSetup ||
              normalizeEmail(user.email) !== configuredAdminEmail()
            ) {
              return false;
            }
            return { data: { ...user, name: "GTBS Administrator" } };
          },
        },
      },
    },
    advanced: {
      cookiePrefix: "gtbs_admin",
      useSecureCookies: process.env.NODE_ENV === "production",
      ipAddress: {
        ipAddressHeaders: ["x-real-ip", "x-forwarded-for"],
      },
    },
  });
}

export const auth = createAuth();
