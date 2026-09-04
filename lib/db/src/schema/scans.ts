import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const complianceCheckSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  status: z.enum(["passed", "failed", "review"]),
  note: z.string(),
});

export type ComplianceCheck = z.infer<typeof complianceCheckSchema>;

/**
 * Geometry + confidence of a single OCR word on the package image.
 * Coordinates are pixels relative to the OCR'd image (see OcrDetails).
 */
export const ocrWordSchema = z.object({
  text: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  confidence: z.number(),
});

export type OcrWord = z.infer<typeof ocrWordSchema>;

/**
 * Structured output of the image OCR step. Lets the rule engine verify
 * readability (confidence), font size (box heights) and placement of the
 * mandatory declarations on the actual package image.
 */
export const ocrDetailsSchema = z.object({
  engine: z.string(),
  imageWidth: z.number(),
  imageHeight: z.number(),
  words: z.array(ocrWordSchema),
});

export type OcrDetails = z.infer<typeof ocrDetailsSchema>;

export const scansTable = sqliteTable("scans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  reference: text("reference").notNull().unique(),
  productName: text("product_name").notNull(),
  category: text("category").notNull(),
  officerName: text("officer_name").notNull(),
  source: text("source").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(),
  submitted: integer("submitted", { mode: "boolean" }).notNull().default(false),
  capturedAt: integer("captured_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  imageUrl: text("image_url"),
  barcode: text("barcode"),
  ocrText: text("ocr_text").notNull(),
  // Structured OCR output (word boxes + confidence) captured when the label
  // was read from a package image. Null for manually transcribed scans.
  ocrDetails: text("ocr_details", { mode: "json" }).$type<OcrDetails | null>(),
  checks: text("checks", { mode: "json" }).$type<ComplianceCheck[]>().notNull(),
  // SHA-256 fingerprint of the evidence (ocr text + checks + capture time),
  // stamped at capture time so reports and the repository share one
  // tamper-evident record. Null for legacy rows; computed on report export.
  evidenceHash: text("evidence_hash"),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({
  id: true,
  capturedAt: true,
  evidenceHash: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;
