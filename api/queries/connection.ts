import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

// Use Turso (online) or local SQLite file for dev
const url = process.env.TURSO_DATABASE_URL || "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(
  authToken ? { url, authToken } : { url }
);

export const db = drizzle(client, { schema: fullSchema });

export function getDb() {
  return db;
}
