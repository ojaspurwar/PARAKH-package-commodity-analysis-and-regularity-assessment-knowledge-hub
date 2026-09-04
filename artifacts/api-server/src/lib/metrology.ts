import type { ComplianceCheck, OcrDetails, OcrWord } from "@workspace/db";

/**
 * Rule engine for the Legal Metrology (Packaged Commodities) Rules, 2011.
 *
 * Analyzes raw label / OCR / listing text and produces a ComplianceCheck[]
 * covering the mandatory declarations: Maximum Retail Price, Unit Sale Price
 * (2022 amendment), net quantity, date of manufacture/packing, consumer care
 * contact, and packer/importer details.
 *
 * When structured OCR output (word boxes + confidence) from a package image
 * is provided, three additional checks run:
 *  - placement  — are the declarations actually present on the package image
 *                 (not clipped at the edges)?
 *  - font       — estimated font height vs the Rule 7(3) / Schedule I minimums
 *                 for the package's net-quantity band.
 *  - readable   — OCR confidence of the declaration words as a legibility
 *                 proxy.
 *
 * Status semantics:
 *  - "passed"  — declaration detected with a plausible value
 *  - "failed"  — declaration keyword present but value missing/invalid
 *  - "review"  — declaration not found; cannot confirm from the text
 */

const AMOUNT = /(?:rs\.?|inr|₹)\s*[\d][\d,]*(?:\.\d{1,2})?|\d[\d,]*(?:\.\d{1,2})?\s*(?:rs\.?|inr|₹)/i;

const NET_QTY_UNITS =
  /\b(?:net\s*(?:qty|quantity|wt|weight|volume|content|fill)|net\.?)\s*[:.]?\s*([\d][\d.,]*)\s*(g|kg|ml|l|m|cm|u|unit|pcs|pieces|nos|count|sheet|sheets)\b/i;

const DATE_PATTERNS = [
  /\b(?:mfg|mfd|manufactur(?:ed|ing)|pack(?:ed|ing))\s*(?:date)?\s*[:.]?\s*(\d{1,2}\/\d{2,4})\b/i,
  /\b(?:mfg|mfd|manufactur(?:ed|ing)|pack(?:ed|ing))\s*(?:date)?\s*[:.]?\s*(\d{1,2}[-\s.]\d{1,2}[-\s.]\d{2,4})\b/i,
  /\b(?:mfg|mfd|manufactur(?:ed|ing)|pack(?:ed|ing))\s*(?:date)?\s*[:.]?\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4})\b/i,
  /\b(?:best\s*before|expiry|exp)\s*[:.]?\s*([\d]{1,2}\/\d{2,4})\b/i,
];

const CONSUMER_CARE_KEYWORDS = /(?:consumer\s*(?:care|grievance|service)|customer\s*care|customer\s*service|toll\s*free)/i;

const CONTACT_EMAIL = /\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/i;
const CONTACT_PHONE = /(?:\+91[\s-]?)?(?:1800[\s-]?\d{3}[\s-]?\d{4}|[6-9]\d{9}|\d{4}[\s-]\d{3}[\s-]\d{3})/;

const PACKER_KEYWORDS = /(?:packed|manufactured|marketed|imported|distributed|mfd\.?\s*by)\s*by\b/i;
const PINCODE = /\b[1-9]\d{5}\b/;

const USP_PATTERN =
  /(?:rs\.?|inr|₹)?\s*[\d][\d,]*(?:\.\d{1,2})?\s*\/\s*(?:100\s*)?(?:g|kg|ml|l|litre|liter|unit|piece|pc|pcs|nos|no)\b/i;

/**
 * Word-level patterns that identify each mandatory declaration inside the
 * OCR word stream. Used for the placement / font / readability checks.
 */
const DECLARATION_WORD_PATTERNS: Record<string, RegExp> = {
  mrp: /\b(?:mrp|retail|maximum|price)\b/i,
  usp: /\b(?:unit|sale|per)\b/i,
  qty: /\b(?:net|qty|quantity|wt|weight|volume|content|fill)\b/i,
  date: /\b(?:mfg|mfd|manufactur(?:ed|ing)?|pack(?:ed|ing)?|expiry|exp)\b/i,
  contact: /\b(?:consumer|care|grievance|customer|service|toll|free)\b/i,
  packer: /\b(?:packed|manufactured|marketed|imported|distributed)\b/i,
};

const DECLARATION_LABELS: Record<string, string> = {
  mrp: "MRP",
  usp: "Unit sale price",
  qty: "Net quantity",
  date: "Date marking",
  contact: "Consumer care",
  packer: "Packer/importer",
};

// Photos of labels at typical phone framing approximate a 300 DPI scan, so
// pixel heights convert to millimetres as px * 25.4 / 300. The result is
// reported as an estimate; officers confirm with a scale rule if disputed.
const ASSUMED_DPI = 300;
const MM_PER_INCH = 25.4;

function mmFromPx(px: number): number {
  return (px * MM_PER_INCH) / ASSUMED_DPI;
}

function hasAmount(text: string): boolean {
  return AMOUNT.test(text);
}

function extractMatch(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[0] : null;
}

function mrpCheck(text: string): ComplianceCheck {
  const mrpPattern =
    /\b(?:mrp|max(?:imum)?\.?\s*retail\s*price)\s*[:.]?\s*((?:rs\.?|inr|₹)\s*[\d][\d,]*(?:\.\d{1,2})?|[\d][\d,]*(?:\.\d{1,2})?\s*(?:rs\.?|inr|₹))/i;
  const match = text.match(mrpPattern);
  if (match?.[1]) {
    return {
      key: "mrp",
      label: "MRP declaration",
      value: match[1].trim(),
      status: "passed",
      note: "Maximum retail price detected and legible",
    };
  }
  if (/\b(?:mrp|max(?:imum)?\.?\s*retail\s*price)\b/i.test(text)) {
    return {
      key: "mrp",
      label: "MRP declaration",
      value: "Not detected",
      status: "failed",
      note: "MRP keyword present but no price value found",
    };
  }
  return {
    key: "mrp",
    label: "MRP declaration",
    value: "Not detected",
    status: "review",
    note: "No MRP statement found on the visible text",
  };
}

function uspCheck(text: string): ComplianceCheck {
  const match = text.match(USP_PATTERN);
  if (match) {
    return {
      key: "usp",
      label: "Unit sale price",
      value: match[0].trim(),
      status: "passed",
      note: "Price-per-unit declaration present (2022 amendment)",
    };
  }
  if (hasAmount(text)) {
    return {
      key: "usp",
      label: "Unit sale price",
      value: "Not detected",
      status: "failed",
      note: "A price is declared but no price-per-unit is shown",
    };
  }
  return {
    key: "usp",
    label: "Unit sale price",
    value: "Not detected",
    status: "review",
    note: "Requires confirmation against the physical label",
  };
}

function netQuantityCheck(text: string): ComplianceCheck {
  const match = text.match(NET_QTY_UNITS);
  if (match?.[1] && match?.[2]) {
    return {
      key: "qty",
      label: "Net quantity",
      value: `${match[1].trim()} ${match[2].toLowerCase()}`,
      status: "passed",
      note: "Net quantity with allowed unit declared",
    };
  }
  if (/\bnet\b/i.test(text)) {
    return {
      key: "qty",
      label: "Net quantity",
      value: "Not detected",
      status: "failed",
      note: "Net content mentioned but no valid quantity/unit found",
    };
  }
  return {
    key: "qty",
    label: "Net quantity",
    value: "Not detected",
    status: "review",
    note: "No net quantity statement found",
  };
}

function dateCheck(text: string): ComplianceCheck {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return {
        key: "date",
        label: "Date marking",
        value: match[1].trim(),
        status: "passed",
        note: "Manufacture/pack date present and in a valid format",
      };
    }
  }
  if (/\b(?:mfg|mfd|manufactur(?:ed|ing)|pack(?:ed|ing)|best\s*before|expiry|exp)\b/i.test(text)) {
    return {
      key: "date",
      label: "Date marking",
      value: "Not detected",
      status: "failed",
      note: "Date keyword present but no valid date found",
    };
  }
  return {
    key: "date",
    label: "Date marking",
    value: "Not detected",
    status: "review",
    note: "No manufacture/pack date found on the visible text",
  };
}

function contactCheck(text: string): ComplianceCheck {
  const email = text.match(CONTACT_EMAIL);
  const phone = text.match(CONTACT_PHONE);
  if (email || phone) {
    return {
      key: "contact",
      label: "Consumer care details",
      value: (email?.[0] ?? phone?.[0] ?? "").trim(),
      status: "passed",
      note: "Valid email or contact number detected",
    };
  }
  if (CONSUMER_CARE_KEYWORDS.test(text)) {
    return {
      key: "contact",
      label: "Consumer care details",
      value: "Not detected",
      status: "failed",
      note: "Consumer care section present but no valid contact found",
    };
  }
  return {
    key: "contact",
    label: "Consumer care details",
    value: "Not detected",
    status: "review",
    note: "No consumer care statement found",
  };
}

function packerCheck(text: string): ComplianceCheck {
  const packerStatement = text.match(PACKER_KEYWORDS);
  const pincode = text.match(PINCODE);
  if (packerStatement && pincode) {
    return {
      key: "packer",
      label: "Packer / importer details",
      value: `Pincode ${pincode[0]}`,
      status: "passed",
      note: "Packer statement with postal code detected",
    };
  }
  if (packerStatement) {
    return {
      key: "packer",
      label: "Packer / importer details",
      value: "Incomplete",
      status: "failed",
      note: "Packer named but address/postal code not found",
    };
  }
  return {
    key: "packer",
    label: "Packer / importer details",
    value: "Not detected",
    status: "review",
    note: "No packer/importer statement found",
  };
}

function matchedWords(ocr: OcrDetails, pattern: RegExp): OcrWord[] {
  return ocr.words.filter((word) => pattern.test(word.text));
}

/**
 * Schedule I numeral-height minimum (mm) for the package's net-quantity band
 * (printed labels). Falls back to the Rule 7(3) letter floor of 1 mm when the
 * quantity band cannot be determined from the label text.
 */
function quantityBandMinMm(text: string): number {
  const match = text.match(NET_QTY_UNITS);
  if (!match?.[1] || !match?.[2]) return 1;
  const value = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2].toLowerCase();
  const base = unit === "kg" || unit === "l" ? value * 1000 : value;
  if (base < 200) return 1;
  if (base < 500) return 2;
  return 4;
}

function placementCheck(text: string, ocr: OcrDetails | null): ComplianceCheck {
  if (!ocr) {
    return {
      key: "placement",
      label: "Declaration placement",
      value: "Not verified",
      status: "review",
      note: "Requires a package image to verify declaration placement",
    };
  }
  const width = ocr.imageWidth || 1;
  const height = ocr.imageHeight || 1;
  let onPackage = 0;
  const clipped: string[] = [];
  for (const [key, pattern] of Object.entries(DECLARATION_WORD_PATTERNS)) {
    const words = matchedWords(ocr, pattern);
    if (words.length === 0) continue;
    onPackage += 1;
    const label = DECLARATION_LABELS[key] ?? key;
    const isClipped = words.some(
      (word) =>
        word.x < 0.02 * width ||
        word.x + word.width > 0.98 * width ||
        word.y < 0.02 * height ||
        word.y + word.height > 0.98 * height,
    );
    if (isClipped) clipped.push(label);
  }
  const total = Object.keys(DECLARATION_WORD_PATTERNS).length;
  if (onPackage < total) {
    return {
      key: "placement",
      label: "Declaration placement",
      value: `${onPackage}/${total} on package`,
      status: "failed",
      note: `${total - onPackage} mandatory declaration(s) could not be located on the package image`,
    };
  }
  if (clipped.length > 0) {
    return {
      key: "placement",
      label: "Declaration placement",
      value: `${onPackage}/${total} on package`,
      status: "review",
      note: `${clipped.join(", ")} appear(s) clipped at the image edge — confirm against the physical package`,
    };
  }
  return {
    key: "placement",
    label: "Declaration placement",
    value: `${onPackage}/${total} on package`,
    status: "passed",
    note: "All mandatory declarations located on the package image",
  };
}

function fontCheck(text: string, ocr: OcrDetails | null): ComplianceCheck {
  if (!ocr) {
    return {
      key: "font",
      label: "Font size requirement",
      value: "Not measured",
      status: "review",
      note: "Requires a package image to measure font size",
    };
  }
  const minimum = quantityBandMinMm(text);
  let smallest = Infinity;
  let smallestLabel = "";
  const below: string[] = [];
  for (const [key, pattern] of Object.entries(DECLARATION_WORD_PATTERNS)) {
    const words = matchedWords(ocr, pattern);
    if (words.length === 0) continue;
    const heights = words.map((word) => word.height).sort((a, b) => a - b);
    const medianPx = heights[Math.floor(heights.length / 2)];
    const medianMm = mmFromPx(medianPx);
    if (medianMm < smallest) {
      smallest = medianMm;
      smallestLabel = DECLARATION_LABELS[key] ?? key;
    }
    if (medianMm < minimum) below.push(DECLARATION_LABELS[key] ?? key);
  }
  if (!Number.isFinite(smallest)) {
    return {
      key: "font",
      label: "Font size requirement",
      value: "Not measurable",
      status: "review",
      note: "No declaration words found on the image to measure",
    };
  }
  const value = `~${smallest.toFixed(1)} mm est. (${smallestLabel})`;
  if (below.length > 0) {
    return {
      key: "font",
      label: "Font size requirement",
      value,
      status: "failed",
      note: `${below.join(", ")} below the ${minimum.toFixed(1)} mm minimum for this quantity band (Rule 7(3) / Schedule I)`,
    };
  }
  return {
    key: "font",
    label: "Font size requirement",
    value,
    status: "passed",
    note: `Above the ${minimum.toFixed(1)} mm minimum for this quantity band (estimated at ${ASSUMED_DPI} DPI)`,
  };
}

function readabilityCheck(text: string, ocr: OcrDetails | null): ComplianceCheck {
  if (!ocr) {
    return {
      key: "readable",
      label: "Readability (print quality)",
      value: "Not assessed",
      status: "review",
      note: "Requires a package image to assess legibility",
    };
  }
  const words = Object.values(DECLARATION_WORD_PATTERNS).flatMap((pattern) =>
    matchedWords(ocr, pattern),
  );
  if (words.length === 0) {
    return {
      key: "readable",
      label: "Readability (print quality)",
      value: "Not assessed",
      status: "review",
      note: "No declaration words found on the image to assess",
    };
  }
  const average =
    words.reduce((sum, word) => sum + word.confidence, 0) / words.length;
  const value = `${average.toFixed(0)}% avg. confidence`;
  if (average >= 60) {
    return {
      key: "readable",
      label: "Readability (print quality)",
      value,
      status: "passed",
      note: "Declarations clearly legible in the capture",
    };
  }
  if (average < 45) {
    return {
      key: "readable",
      label: "Readability (print quality)",
      value,
      status: "failed",
      note: "Declaration text is faint, small or out of focus — verify physically",
    };
  }
  return {
    key: "readable",
    label: "Readability (print quality)",
    value,
    status: "review",
    note: "Borderline legibility — confirm the declaration text physically",
  };
}

/**
 * Analyze label text (OCR transcription, e-commerce listing text, etc.) and
 * produce the full set of compliance checks.
 *
 * When structured OCR output from a package image is supplied, the placement,
 * font-size and readability checks are added; without an image those checks
 * are skipped rather than reported as unresolved.
 */
export function analyzeLabelText(
  text: string,
  ocrDetails?: OcrDetails | null,
): ComplianceCheck[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const checks = [
    mrpCheck(normalized),
    uspCheck(normalized),
    netQuantityCheck(normalized),
    dateCheck(normalized),
    contactCheck(normalized),
    packerCheck(normalized),
  ];
  if (ocrDetails) {
    checks.push(
      placementCheck(normalized, ocrDetails),
      fontCheck(normalized, ocrDetails),
      readabilityCheck(normalized, ocrDetails),
    );
  }
  return checks;
}

/**
 * Derive an overall scan status from the generated checks.
 * Any failed check → "violation"; all passed → "compliant"; otherwise "pending".
 */
export function statusFromChecks(checks: ComplianceCheck[]): "compliant" | "violation" | "pending" {
  if (checks.some((check) => check.status === "failed")) return "violation";
  if (checks.length > 0 && checks.every((check) => check.status === "passed")) return "compliant";
  return "pending";
}

/**
 * SHA-256 fingerprint of the evidence for a scan. Used for the tamper-evident
 * hash stamped on reports and stored with the record.
 */
export function computeEvidenceHash(input: {
  reference: string;
  productName: string;
  ocrText: string;
  checks: ComplianceCheck[];
  capturedAt: Date;
  barcode?: string | null;
  ocrDetails?: OcrDetails | null;
}): string {
  // Canonical, stable string: the pieces of evidence that define the record.
  const canonical = [
    input.reference,
    input.productName,
    input.barcode ?? "",
    input.ocrText,
    input.ocrDetails ? JSON.stringify(input.ocrDetails) : "",
    JSON.stringify(input.checks),
    input.capturedAt.toISOString(),
  ].join("\n---\n");

  const { createHash } = require("node:crypto") as typeof import("node:crypto");
  return createHash("sha256").update(canonical).digest("hex");
}