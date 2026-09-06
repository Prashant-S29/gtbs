import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { hashPassword } from "better-auth/crypto";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";

import { closeDatabaseConnection, getDatabase } from "../src/db/client";
import { authAccount, authUser } from "../src/db/schema";

config({ quiet: true });

function readHidden(prompt: string) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    throw new Error("Run this command in an interactive terminal.");
  }
  stdout.write(prompt);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  return new Promise<string>((resolve, reject) => {
    let value = "";
    const cleanup = () => {
      stdin.off("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
    };
    const onData = (character: string) => {
      if (character === "\u0003") {
        cleanup();
        reject(new Error("Setup cancelled."));
      } else if (character === "\r" || character === "\n") {
        cleanup();
        stdout.write("\n");
        resolve(value);
      } else if (character === "\u007f" || character === "\b") {
        if (value) {
          value = value.slice(0, -1);
          stdout.write("\b \b");
        }
      } else if (character >= " ") {
        value += character;
        stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

const readline = createInterface({ input: stdin, output: stdout });

try {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || "";
  if (!/^\S+@\S+\.\S+$/u.test(email)) {
    throw new Error("Set a valid ADMIN_EMAIL before running setup.");
  }

  const existing = await getDatabase().query.authUser.findFirst({
    where: eq(authUser.email, email),
    columns: { id: true },
  });
  if (existing) {
    throw new Error(
      "The configured Admin already exists. Use Forgot password instead of bootstrapping again.",
    );
  }

  const password = await readHidden("Admin password (minimum 12 characters): ");
  const confirmation = await readHidden("Confirm admin password: ");
  if (password.length < 12 || password.length > 128) {
    throw new Error("Password must contain 12–128 characters.");
  }
  if (password !== confirmation) throw new Error("Passwords do not match.");

  const userId = randomUUID();
  const now = new Date();
  const passwordHash = await hashPassword(password);
  await getDatabase().transaction(async (transaction) => {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtext('gtbs-admin-bootstrap'))`,
    );
    const duplicate = await transaction
      .select({ id: authUser.id })
      .from(authUser)
      .where(eq(authUser.email, email))
      .limit(1);
    if (duplicate[0]) throw new Error("The configured Admin already exists.");

    await transaction.insert(authUser).values({
      id: userId,
      name: "GTBS Administrator",
      email,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
    await transaction.insert(authAccount).values({
      id: randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    });
  });

  stdout.write(
    "Admin account created in PostgreSQL. No password was written to the filesystem or environment.\n",
  );
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : "Admin setup failed."}\n`,
  );
  process.exitCode = 1;
} finally {
  readline.close();
  await closeDatabaseConnection();
}
