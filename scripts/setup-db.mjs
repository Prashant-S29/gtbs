import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";
import pg from "pg";

config({ quiet: true });

const { Client } = pg;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(
  scriptDirectory,
  "..",
  "database",
  "migrations",
);
const migrationFilePattern = /^(?<sequence>\d{3,})_[a-z0-9_-]+\.sql$/u;

function databaseUrl() {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) {
    throw new Error(
      "DATABASE_URL is required. Add it to .env or the command environment.",
    );
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid PostgreSQL connection URL.");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error(
      "DATABASE_URL must use the postgres: or postgresql: scheme.",
    );
  }

  return value;
}

async function loadMigrations() {
  const migrations = (await readdir(migrationsDirectory))
    .map((filename) => {
      const match = migrationFilePattern.exec(filename);
      return match
        ? { filename, sequence: Number(match.groups?.sequence) }
        : undefined;
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        left.sequence - right.sequence ||
        left.filename.localeCompare(right.filename),
    );

  if (migrations.length === 0) {
    throw new Error(`No SQL migrations found in ${migrationsDirectory}.`);
  }

  const duplicateSequence = migrations.find(
    (migration, index) =>
      index > 0 && migration.sequence === migrations[index - 1].sequence,
  );
  if (duplicateSequence) {
    throw new Error(
      `Migration sequence ${duplicateSequence.sequence} is used more than once.`,
    );
  }

  return Promise.all(
    migrations.map(async ({ filename }) => {
      const sql = await readFile(
        path.join(migrationsDirectory, filename),
        "utf8",
      );
      return {
        filename,
        sql,
        checksum: createHash("sha256").update(sql).digest("hex"),
      };
    }),
  );
}

function safeErrorMessage(error, connectionString) {
  const message =
    error instanceof Error ? error.message : "Unknown database error";
  return message.replaceAll(connectionString, "[DATABASE_URL]");
}

async function main() {
  const connectionString = databaseUrl();
  const migrations = await loadMigrations();
  const client = new Client({
    connectionString,
    connectionTimeoutMillis: 15_000,
  });

  try {
    await client.connect();
    await client.query("BEGIN");
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext('gtbs-database-migrations'))",
    );
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.gtbs_schema_migrations (
        filename text PRIMARY KEY,
        checksum text NOT NULL CHECK (checksum ~ '^[a-f0-9]{64}$'),
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const result = await client.query(
      "SELECT filename, checksum FROM public.gtbs_schema_migrations",
    );
    const applied = new Map(
      result.rows.map((row) => [row.filename, row.checksum]),
    );

    let appliedCount = 0;
    for (const migration of migrations) {
      const previousChecksum = applied.get(migration.filename);
      if (previousChecksum && previousChecksum !== migration.checksum) {
        throw new Error(
          `Applied migration ${migration.filename} has been modified. Add a new migration instead.`,
        );
      }
      if (previousChecksum) {
        console.log(`Already applied: ${migration.filename}`);
        continue;
      }

      console.log(`Applying: ${migration.filename}`);
      await client.query(migration.sql);
      await client.query(
        `INSERT INTO public.gtbs_schema_migrations (filename, checksum)
         VALUES ($1, $2)`,
        [migration.filename, migration.checksum],
      );
      appliedCount += 1;
    }

    await client.query("COMMIT");
    console.log(
      appliedCount === 0
        ? "Database is already up to date."
        : `Database setup complete. Applied ${appliedCount} migration(s).`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw new Error(safeErrorMessage(error, connectionString));
  } finally {
    await client.end().catch(() => undefined);
  }
}

main().catch((error) => {
  console.error(`Database setup failed: ${error.message}`);
  process.exitCode = 1;
});
