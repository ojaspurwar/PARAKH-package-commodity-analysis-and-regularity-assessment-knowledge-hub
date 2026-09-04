import { and, desc, eq, ilike } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  CreateScanBody,
  CreateScanResponse,
  CreateWebScanBody,
  CreateWebScanResponse,
  GetDashboardSummaryResponse,
  GetScanParams,
  GetScanResponse,
  GetScansQueryParams,
  GetScansResponse,
  SubmitScanBody,
  SubmitScanParams,
  SubmitScanResponse,
} from "@workspace/api-zod";
import { db, scansTable, type ComplianceCheck, type Scan } from "@workspace/db";

const router: IRouter = Router();

const passedChecks: ComplianceCheck[] = [
  { key: "mrp", label: "MRP declaration", value: "₹ 249.00", status: "passed", note: "Clearly printed" },
  { key: "date", label: "Date marking", value: "MFD 08/2026", status: "passed", note: "Present and legible" },
  { key: "qty", label: "Net quantity", value: "500 g", status: "passed", note: "Matches package panel" },
  { key: "font", label: "Font size", value: "4.0 mm", status: "passed", note: "Above minimum" },
  { key: "contact", label: "Consumer contact", value: "1800 123 4567", status: "passed", note: "Contact details present" },
];

const reviewChecks: ComplianceCheck[] = [
  { key: "mrp", label: "MRP declaration", value: "₹ 1,299.00", status: "passed", note: "Clearly printed" },
  { key: "date", label: "Date marking", value: "Not detected", status: "failed", note: "Missing on visible panel" },
  { key: "qty", label: "Net quantity", value: "1 unit", status: "passed", note: "Present" },
  { key: "font", label: "Font size", value: "2.7 mm", status: "failed", note: "Below minimum size" },
  { key: "contact", label: "Consumer contact", value: "1800 987 1122", status: "passed", note: "Contact details present" },
];

const seedScans: Array<Omit<Scan, "id">> = [
  {
    reference: "LM-260901",
    productName: "Saffola Gold Cooking Oil",
    category: "Packaged food",
    officerName: "A. Sharma",
    source: "field",
    location: "Connaught Place, New Delhi",
    status: "compliant",
    submitted: true,
    capturedAt: new Date(Date.now() - 1000 * 60 * 18),
    imageUrl: null,
    ocrText: "Saffola Gold | MRP ₹249.00 | Net Qty 500 g | MFD 08/2026 | Consumer care 1800 123 4567",
    checks: passedChecks,
  },
  {
    reference: "LM-260900",
    productName: "Philips Air Fryer HD9200",
    category: "Consumer goods",
    officerName: "R. Verma",
    source: "field",
    location: "Lajpat Nagar, New Delhi",
    status: "violation",
    submitted: true,
    capturedAt: new Date(Date.now() - 1000 * 60 * 42),
    imageUrl: null,
    ocrText: "Philips Air Fryer | MRP ₹1,299.00 | Net Qty 1 unit | Consumer care 1800 987 1122",
    checks: reviewChecks,
  },
  {
    reference: "LM-260899",
    productName: "Cotton Comfort Bedsheet",
    category: "Textiles",
    officerName: "N. Khan",
    source: "ecommerce",
    location: "Amazon.in listing",
    status: "pending",
    submitted: false,
    capturedAt: new Date(Date.now() - 1000 * 60 * 77),
    imageUrl: null,
    ocrText: "Cotton Comfort Bedsheet | MRP ₹899.00 | 100% cotton | Size King",
    checks: [
      { key: "mrp", label: "MRP declaration", value: "₹ 899.00", status: "passed", note: "Detected on listing" },
      { key: "date", label: "Date marking", value: "Not applicable", status: "review", note: "Requires officer review" },
      { key: "qty", label: "Net quantity", value: "1 unit", status: "passed", note: "Detected on listing" },
      { key: "font", label: "Font size", value: "Not applicable", status: "review", note: "Requires package image" },
      { key: "contact", label: "Consumer contact", value: "Not detected", status: "review", note: "Requires officer review" },
    ],
  },
];

async function ensureSeeded(): Promise<void> {
  const existing = await db.select({ id: scansTable.id }).from(scansTable).limit(1);
  if (existing.length === 0) {
    await db.insert(scansTable).values(seedScans);
  }
}

async function findScan(id: number) {
  const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, id));
  return scan;
}

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  await ensureSeeded();
  const scans = await db.select().from(scansTable);
  const violations = scans.flatMap((scan) => scan.checks).filter((check) => check.status === "failed");
  const violationCounts = new Map<string, number>();
  for (const check of violations) {
    violationCounts.set(check.label, (violationCounts.get(check.label) ?? 0) + 1);
  }
  const topViolationType =
    [...violationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "None detected";
  const compliantCount = scans.filter((scan) => scan.status === "compliant").length;
  const officers = new Set(scans.map((scan) => scan.officerName));
  const lastSyncAt = scans.reduce(
    (latest, scan) => (scan.capturedAt > latest ? scan.capturedAt : latest),
    new Date(0),
  );

  const data = {
    totalScansToday: scans.length,
    complianceRate: scans.length ? Math.round((compliantCount / scans.length) * 100) : 0,
    topViolationType,
    queuedOffline: scans.filter((scan) => !scan.submitted).length,
    activeOfficers: officers.size,
    lastSyncAt,
  };
  res.json(GetDashboardSummaryResponse.parse(data));
});

router.get("/scans", async (req, res): Promise<void> => {
  await ensureSeeded();
  const parsed = GetScansQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const filters = [];
  if (parsed.data.status !== "all") {
    filters.push(eq(scansTable.status, parsed.data.status));
  }
  if (parsed.data.search) {
    filters.push(ilike(scansTable.productName, `%${parsed.data.search}%`));
  }
  const scans = await db
    .select()
    .from(scansTable)
    .where(filters.length ? and(...filters) : undefined)
    .orderBy(desc(scansTable.capturedAt));
  res.json(GetScansResponse.parse(scans));
});

router.post("/scans", async (req, res): Promise<void> => {
  const parsed = CreateScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(scansTable)
    .values({
      ...parsed.data,
      reference: `LM-${Date.now().toString().slice(-6)}`,
      source: "field",
      submitted: false,
    })
    .returning();
  res.status(201).json(CreateScanResponse.parse(created));
});

router.get("/scans/:id", async (req, res): Promise<void> => {
  await ensureSeeded();
  const params = GetScanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const scan = await findScan(params.data.id);
  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }
  res.json(GetScanResponse.parse(scan));
});

router.post("/scans/:id", async (req, res): Promise<void> => {
  await ensureSeeded();
  const params = SubmitScanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SubmitScanBody.safeParse(req.body ?? {});
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(scansTable)
    .set({ submitted: body.data.submitted })
    .where(eq(scansTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }
  res.json(SubmitScanResponse.parse(updated));
});

router.post("/web-scans", async (req, res): Promise<void> => {
  const parsed = CreateWebScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const hostname = (() => {
    try {
      return new URL(parsed.data.url).hostname.replace(/^www\./, "");
    } catch {
      return "online listing";
    }
  })();
  const [created] = await db
    .insert(scansTable)
    .values({
      reference: `WEB-${Date.now().toString().slice(-6)}`,
      productName: `Online product from ${hostname}`,
      category: "E-commerce listing",
      officerName: "Online review queue",
      source: "ecommerce",
      location: `${hostname} listing`,
      status: "pending",
      submitted: false,
      imageUrl: null,
      ocrText: `Product listing submitted from ${parsed.data.url}`,
      checks: reviewChecks.map((check) => ({ ...check, status: "review" as const })),
    })
    .returning();
  res.status(201).json(CreateWebScanResponse.parse(created));
});

export default router;