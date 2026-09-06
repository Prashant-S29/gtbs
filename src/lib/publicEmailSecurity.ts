import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";

const WINDOW_MS = 15 * 60 * 1_000;
const MAX_REQUESTS = 3;

function expectedOrigin(request: Request) {
  if (process.env.NODE_ENV !== "production") return new URL(request.url).origin;
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || "").origin;
  } catch {
    return null;
  }
}

export function isTrustedPublicEmailRequest(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (
    request.headers.get("x-gtbs-public-request") === "1" &&
    Boolean(origin && origin === expectedOrigin(request)) &&
    (!fetchSite || fetchSite === "same-origin")
  );
}

function clientKey(request: Request, scope: string) {
  const address =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unidentified";
  return createHash("sha256").update(`${scope}:${address}`).digest("base64url");
}

export async function consumePublicEmailLimit(
  request: Request,
  scope: "contact" | "newsletter",
) {
  const key = clientKey(request, scope);
  const result = await getDatabase().execute<{ count: number }>(sql`
    INSERT INTO email_rate_limits (key, count, window_started_at, updated_at)
    VALUES (${key}, 1, now(), now())
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN email_rate_limits.window_started_at <= now() - interval '15 minutes'
          THEN 1
        ELSE email_rate_limits.count + 1
      END,
      window_started_at = CASE
        WHEN email_rate_limits.window_started_at <= now() - interval '15 minutes'
          THEN now()
        ELSE email_rate_limits.window_started_at
      END,
      updated_at = now()
    RETURNING count
  `);
  const count = Number(result.rows[0]?.count || 1);
  return {
    allowed: count <= MAX_REQUESTS,
    retryAfterSeconds: count <= MAX_REQUESTS ? 0 : Math.ceil(WINDOW_MS / 1_000),
  };
}
