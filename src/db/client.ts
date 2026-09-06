import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/db/schema";

const globalDatabase = globalThis as typeof globalThis & {
  gtbsPostgresPool?: Pool;
};
let productionPool: Pool | undefined;

function connectionString() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error("Database configuration is unavailable.");
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      throw new Error();
    }
    if (
      process.env.NODE_ENV === "production" &&
      !["require", "verify-ca", "verify-full"].includes(
        parsed.searchParams.get("sslmode") || "",
      )
    ) {
      throw new Error();
    }
  } catch {
    throw new Error("Database configuration is invalid.");
  }

  return value;
}

function poolSize() {
  const fallback = process.env.NODE_ENV === "production" ? 2 : 5;
  const configured = Number(process.env.DATABASE_POOL_MAX || fallback);
  return Number.isInteger(configured) && configured >= 1 && configured <= 10
    ? configured
    : fallback;
}

function createPool() {
  return new Pool({
    connectionString: connectionString(),
    max: poolSize(),
    connectionTimeoutMillis: 15_000,
    idleTimeoutMillis: 30_000,
  });
}

export function getDatabase() {
  const pool =
    process.env.NODE_ENV === "production"
      ? (productionPool ??= createPool())
      : (globalDatabase.gtbsPostgresPool ??= createPool());
  return drizzle(pool, { schema });
}

export async function closeDatabaseConnection() {
  const pool = productionPool ?? globalDatabase.gtbsPostgresPool;
  productionPool = undefined;
  globalDatabase.gtbsPostgresPool = undefined;
  await pool?.end();
}
