import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

/**
 * Resolve where the SQLite database file lives.
 *
 * Priority:
 *  1. DATABASE_PATH  — absolute or relative path to the .db file
 *  2. DATABASE_URL   — convenience: a bare file path or `sqlite://...` URL
 *  3. <cwd>/.data/nirikshan.db
 *
 * A file on disk means scans survive server restarts and browser refreshes —
 * nothing is lost when a tab is closed or the process is restarted.
 */
function resolveDbPath(): string {
  const fromEnv = process.env.DATABASE_PATH ?? process.env.DATABASE_URL;
  if (fromEnv) {
    return path.resolve(fromEnv.replace(/^sqlite:\/\//, ""));
  }
  return path.resolve(process.cwd(), ".data", "nirikshan.db");
}

const dbPath = resolveDbPath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);

// Durability + concurrency-friendly settings. WAL keeps reads fast while
// writes remain crash-safe, so evidence is never lost on a sudden exit.
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("synchronous = NORMAL");

// Auto-create the schema on startup so the app works with zero setup
// (no Postgres, no migration step). Mirrors the Drizzle table definition in
// ./schema/scans.ts.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS "scans" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "reference" text NOT NULL,
    "product_name" text NOT NULL,
    "category" text NOT NULL,
    "officer_name" text NOT NULL,
    "source" text NOT NULL,
    "location" text NOT NULL,
    "status" text NOT NULL,
    "submitted" integer DEFAULT 0 NOT NULL,
    "captured_at" integer DEFAULT (unixepoch()) NOT NULL,
    "image_url" text,
    "barcode" text,
    "ocr_text" text NOT NULL,
    "ocr_details" text,
    "checks" text NOT NULL,
    "evidence_hash" text
  );
  CREATE UNIQUE INDEX IF NOT EXISTS "scans_reference_unique" ON "scans" ("reference");
  CREATE INDEX IF NOT EXISTS "scans_captured_at_idx" ON "scans" ("captured_at");
`);

// Lightweight migrations for databases created before newer columns existed:
// add missing columns so existing data keeps loading.
const scanColumns = sqlite.pragma("table_info(scans)") as Array<{ name: string }>;
if (!scanColumns.some((column) => column.name === "evidence_hash")) {
  sqlite.exec(`ALTER TABLE "scans" ADD COLUMN "evidence_hash" text`);
}
if (!scanColumns.some((column) => column.name === "barcode")) {
  sqlite.exec(`ALTER TABLE "scans" ADD COLUMN "barcode" text`);
}
if (!scanColumns.some((column) => column.name === "ocr_details")) {
  sqlite.exec(`ALTER TABLE "scans" ADD COLUMN "ocr_details" text`);
}

export const db = drizzle(sqlite, { schema });

export * from "./schema";
