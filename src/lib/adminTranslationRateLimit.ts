import "server-only";

import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";

const WINDOW_MINUTES = 5;
const MAX_REQUESTS = 120;
const MAX_CHARACTERS = 100_000;

export async function consumeAdminTranslationLimit(
  adminId: string,
  characterCount: number,
) {
  const key = createHash("sha256")
    .update(`admin-translation:${adminId}`)
    .digest("base64url");
  const result = await getDatabase().execute<{
    character_count: number;
    request_count: number;
  }>(sql`
    INSERT INTO translation_rate_limits (
      key,
      request_count,
      character_count,
      window_started_at,
      updated_at
    )
    VALUES (${key}, 1, ${characterCount}, now(), now())
    ON CONFLICT (key) DO UPDATE SET
      request_count = CASE
        WHEN translation_rate_limits.window_started_at <= now() - interval '5 minutes'
          THEN 1
        ELSE translation_rate_limits.request_count + 1
      END,
      character_count = CASE
        WHEN translation_rate_limits.window_started_at <= now() - interval '5 minutes'
          THEN ${characterCount}
        ELSE translation_rate_limits.character_count + ${characterCount}
      END,
      window_started_at = CASE
        WHEN translation_rate_limits.window_started_at <= now() - interval '5 minutes'
          THEN now()
        ELSE translation_rate_limits.window_started_at
      END,
      updated_at = now()
    RETURNING request_count, character_count
  `);
  const row = result.rows[0];
  const requestCount = Number(row?.request_count || 1);
  const consumedCharacters = Number(row?.character_count || characterCount);

  return {
    allowed:
      requestCount <= MAX_REQUESTS && consumedCharacters <= MAX_CHARACTERS,
    retryAfterSeconds: WINDOW_MINUTES * 60,
  };
}
