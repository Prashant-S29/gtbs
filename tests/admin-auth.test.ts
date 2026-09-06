import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  ADMIN_REQUEST_HEADER,
  ADMIN_REQUEST_HEADER_VALUE,
  isTrustedAdminMutation,
} from "../src/lib/adminRequestSecurity.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath: string) =>
  readFileSync(path.join(root, relativePath), "utf8");

test("Better Auth uses PostgreSQL for users, sessions, resets, and rate limits", () => {
  const source = read("src/lib/auth.ts");
  assert.match(source, /drizzleAdapter\(getDatabase\(\)/u);
  assert.match(source, /disableSignUp: !allowAdminSetup/u);
  assert.match(source, /minPasswordLength: 12/u);
  assert.match(source, /revokeSessionsOnPasswordReset: true/u);
  assert.match(source, /storage: "database"/u);
  assert.match(source, /modelName: "authRateLimit"/u);
  assert.doesNotMatch(source, /node:fs|localStorage|ADMIN_PASSWORD/u);
});

test("Better Auth schema includes every required persistent model", () => {
  const schema = read("src/db/schema.ts");
  const migration = read("database/migrations/002_better_auth_and_email.sql");
  for (const model of [
    "auth_user",
    "auth_session",
    "auth_account",
    "auth_verification",
    "auth_rate_limit",
  ]) {
    assert.ok(schema.includes(`"${model}"`));
    assert.match(migration, new RegExp(`public\\.${model}`, "u"));
    assert.match(
      migration,
      new RegExp(
        `ALTER TABLE public\\.${model} ENABLE ROW LEVEL SECURITY`,
        "u",
      ),
    );
  }
});

test("password recovery uses Better Auth reset links sent by Resend", () => {
  const auth = read("src/lib/auth.ts");
  const email = read("src/lib/email.ts");
  const dialog = read(
    "src/components/admin/login/AdminPasswordResetDialog.tsx",
  );
  const resetForm = read(
    "src/components/admin/login/AdminResetPasswordForm.tsx",
  );
  assert.match(auth, /sendResetPassword/u);
  assert.match(email, /new Resend\(apiKey\)/u);
  assert.match(email, /support@gtbsbooks\.com/u);
  assert.match(dialog, /authClient\.requestPasswordReset/u);
  assert.match(resetForm, /authClient\.resetPassword/u);
  assert.doesNotMatch(`${auth}\n${email}\n${dialog}`, /EmailJS|6-digit|OTP/u);
});

test("public contact email is server-side, validated, and database throttled", () => {
  const form = read("src/components/contact/ContactForm.tsx");
  const route = read("src/app/api/contact/route.ts");
  const security = read("src/lib/publicEmailSecurity.ts");
  assert.match(form, /fetch\("\/api\/contact"/u);
  assert.match(route, /contactSchema/u);
  assert.match(route, /consumePublicEmailLimit/u);
  assert.match(route, /sendContactMessage/u);
  assert.match(security, /INSERT INTO email_rate_limits/u);
  assert.doesNotMatch(`${form}\n${route}`, /EMAILJS|emailjs/u);
});

test("runtime source has no filesystem persistence or legacy auth modules", () => {
  const stalePaths = [
    "src/lib/adminCredentialStore.ts",
    "src/lib/adminPasswordReset.ts",
    "src/lib/adminPasswordResetEmail.ts",
    "src/lib/adminRateLimit.ts",
    "src/app/api/admin/login/route.ts",
    "src/app/api/admin/logout/route.ts",
    "src/app/api/admin/password-reset/route.ts",
    "storage/content.json",
  ];
  for (const relativePath of stalePaths) {
    assert.equal(
      existsSync(path.join(root, relativePath)),
      false,
      relativePath,
    );
  }
});

test("admin mutations require matching origin and explicit marker", () => {
  const trustedRequest = new Request(
    "http://localhost:3000/api/admin/content",
    {
      method: "POST",
      headers: {
        Origin: "http://localhost:3000",
        "Sec-Fetch-Site": "same-origin",
        [ADMIN_REQUEST_HEADER]: ADMIN_REQUEST_HEADER_VALUE,
      },
    },
  );
  assert.equal(isTrustedAdminMutation(trustedRequest), true);

  const crossOriginRequest = new Request(
    "http://localhost:3000/api/admin/content",
    {
      method: "POST",
      headers: {
        Origin: "https://attacker.example",
        [ADMIN_REQUEST_HEADER]: ADMIN_REQUEST_HEADER_VALUE,
      },
    },
  );
  assert.equal(isTrustedAdminMutation(crossOriginRequest), false);
});
