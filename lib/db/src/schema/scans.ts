import { createInsertSchema } from "drizzle-zod";
import { boolean, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const complianceCheckSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  status: z.enum(["passed", "failed", "review"]),
  note: z.string(),
});

export type ComplianceCheck = z.infer<typeof complianceCheckSchema>;

export const scansTable = pgTable("scans", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  productName: text("product_name").notNull(),
  category: text("category").notNull(),
  officerName: text("officer_name").notNull(),
  source: text("source").notNull(),
  location: text("location").notNull(),
  status: text("status").notNull(),
  submitted: boolean("submitted").notNull().default(false),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  imageUrl: text("image_url"),
  ocrText: text("ocr_text").notNull(),
  checks: jsonb("checks").$type<ComplianceCheck[]>().notNull(),
});

export const insertScanSchema = createInsertSchema(scansTable).omit({
  id: true,
  capturedAt: true,
});

export type InsertScan = z.infer<typeof insertScanSchema>;
export type Scan = typeof scansTable.$inferSelect;