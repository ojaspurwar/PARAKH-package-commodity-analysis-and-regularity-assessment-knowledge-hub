import PDFDocument from "pdfkit";
import type { ComplianceCheck, Scan } from "@workspace/db";

/**
 * Builds a court-admissible compliance report PDF for a scan.
 *
 * The report carries: product + evidence metadata, the compliance check
 * verdicts (including the new font-size / readability / placement checks), a
 * violation summary, the raw OCR/label text, an embedded package image when
 * one is attached, and a SHA-256 evidence hash plus the capture location/time
 * so the record is tamper-evident.
 *
 * Layout note: sections are positioned with an explicit `y` cursor. When a
 * section would run past the bottom margin, ensureSpace() starts a clean new
 * page instead of letting pdfkit's line wrapper cascade blank pages.
 */

const STATUS_LABELS: Record<ComplianceCheck["status"], string> = {
  passed: "PASSED",
  failed: "FAILED",
  review: "REVIEW",
};

const STATUS_COLORS: Record<ComplianceCheck["status"], string> = {
  passed: "#059669",
  failed: "#E11D48",
  review: "#B45309",
};

function statusLabel(status: Scan["status"]): string {
  if (status === "compliant") return "COMPLIANT";
  if (status === "violation") return "VIOLATION DETECTED";
  return "PENDING REVIEW";
}

export function buildComplianceReportPdf(
  scan: Scan,
  evidenceHash: string,
): PDFKit.PDFDocument {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 56, bottom: 64, left: 56, right: 56 },
    info: {
      Title: `Legal Metrology Compliance Report — ${scan.reference}`,
      Author: "PARAKH — Legal Metrology Assistant",
      Subject: `Compliance report for ${scan.productName}`,
      Keywords: "legal metrology, compliance, packaged commodities",
    },
    bufferPages: true,
  });

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const now = new Date();
  let y = 128;

  // Start a clean new page when a section would overflow the bottom margin.
  // Without this, pdfkit's line wrapper sees the drifted cursor past maxY and
  // cascades one blank page per text call.
  const ensureSpace = (needed: number) => {
    if (y + needed > doc.page.maxY()) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    doc.y = y;
  };

  // --- Header band ---
  doc.rect(0, 0, doc.page.width, 96).fill("#1E40AF");
  doc
    .fill("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("LEGAL METROLOGY COMPLIANCE REPORT", 56, 34, { width: pageWidth });
  doc
    .font("Helvetica")
    .fontSize(9)
    .text("PARAKH — Legal Metrology Assistant  •  SIH26034", 56, 62, { width: pageWidth });
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(scan.reference, doc.page.width - 56 - 130, 40, { width: 130, align: "right" });

  // --- Overview block ---
  doc.y = y;
  doc
    .fill("#0F172A")
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(scan.productName, 56, y, { width: pageWidth });
  y += 20;
  doc.y = y;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fill("#475569")
    .text(`${scan.category}  •  ${scan.source === "ecommerce" ? "Online listing" : "Field capture"}`, 56, y, { width: pageWidth });
  y += 16;

  // Status pill
  const statusColor = scan.status === "compliant" ? "#059669" : scan.status === "violation" ? "#E11D48" : "#B45309";
  const pillWidth = 168;
  const pillHeight = 22;
  doc.roundedRect(56, y, pillWidth, pillHeight, 11).fill(statusColor);
  doc.y = y + 6.5;
  doc
    .fill("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(9)
    .text(statusLabel(scan.status), 56, y + 6.5, {
      width: pillWidth,
      align: "center",
    });

  // Metadata grid
  y += pillHeight + 24;
  const metaRows: Array<[string, string]> = [
    ["Officer", scan.officerName],
    ["Capture location", scan.location],
    ["Captured at", scan.capturedAt.toISOString().replace("T", " ").slice(0, 19) + " UTC"],
    ["Record source", scan.source === "ecommerce" ? "E-commerce listing audit" : "Physical label capture"],
  ];
  if (scan.barcode) {
    metaRows.push(["Barcode / QR", scan.barcode]);
  }
  for (let i = 0; i < metaRows.length; i += 2) {
    const [labelA, valueA] = metaRows[i];
    const [labelB, valueB] = metaRows[i + 1] ?? ["", ""];
    const colWidth = pageWidth / 2;
    ensureSpace(40);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fill("#64748B")
      .text(labelA.toUpperCase(), 56, y, { width: colWidth, characterSpacing: 0.4 });
    doc.y = y;
    doc
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fill("#0F172A")
      .text(valueA, 56, y + 12, { width: colWidth });
    if (valueB) {
      doc.y = y;
      doc
        .font("Helvetica")
        .fontSize(8)
        .fill("#64748B")
        .text(labelB.toUpperCase(), 56 + colWidth, y, { width: colWidth, characterSpacing: 0.4 });
      doc.y = y;
      doc
        .font("Helvetica-Bold")
        .fontSize(9.5)
        .fill("#0F172A")
        .text(valueB, 56 + colWidth, y + 12, { width: colWidth });
    }
    y += 42;
  }

  // --- Attached evidence image ---
  if (scan.imageUrl && scan.imageUrl.startsWith("data:image/")) {
    try {
      y += 10;
      ensureSpace(40);
      doc
        .fill("#0F172A")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("Package image (evidence)", 56, y, { width: pageWidth });
      y += 22;
      doc.image(scan.imageUrl, 56, y, { fit: [pageWidth, 170] });
      y += 178;
    } catch {
      // Unreadable image data must never break the report export.
    }
  }

  // --- Compliance checks table ---
  y += 8;
  ensureSpace(120);
  doc
    .fill("#0F172A")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Compliance checks", 56, y, { width: pageWidth });
  y += 22;

  // Column header row
  const colWidths = { status: 72, declaration: 150, value: 140, note: pageWidth - 72 - 150 - 140 };
  doc.rect(56, y - 6, pageWidth, 22).fill("#F1F5F9");
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fill("#334155")
    .text("STATUS", 56 + 8, y, { width: colWidths.status - 8 })
    .text("DECLARATION", 56 + colWidths.status + 8, y, { width: colWidths.declaration - 8 })
    .text("DETECTED VALUE", 56 + colWidths.status + colWidths.declaration + 8, y, { width: colWidths.value - 8 })
    .text("NOTE", 56 + colWidths.status + colWidths.declaration + colWidths.value + 8, y, { width: colWidths.note - 8 });
  y += 22;

  scan.checks.forEach((check, index) => {
    const statusWidth = colWidths.status - 24;
    const declWidth = colWidths.declaration - 10;
    const valWidth = colWidths.value - 10;
    const noteWidth = colWidths.note - 10;

    const declHeight = doc.fontSize(9).font("Helvetica").heightOfString(check.label, { width: declWidth, lineGap: 2 });
    const valHeight = doc.fontSize(9).font("Helvetica").heightOfString(check.value || "Not detected", { width: valWidth, lineGap: 2 });
    const noteHeight = doc.fontSize(8).font("Helvetica").heightOfString(check.note || "", { width: noteWidth, lineGap: 2 });
    const rowHeight = Math.max(30, declHeight + 12, valHeight + 12, noteHeight + 12);

    ensureSpace(rowHeight + 4);

    if (index % 2 === 1) {
      doc.rect(56, y - 4, pageWidth, rowHeight).fill("#F8FAFC");
    }
    const statusColor = STATUS_COLORS[check.status];
    doc.roundedRect(56 + 8, y + 2, 10, 10, 2).fill(statusColor);
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fill(statusColor)
      .text(STATUS_LABELS[check.status], 56 + 24, y + 2, { width: statusWidth })
      .font("Helvetica")
      .fill("#0F172A")
      .fontSize(9)
      .text(check.label, 56 + colWidths.status + 8, y, { width: declWidth, lineGap: 2 })
      .font("Helvetica")
      .fontSize(9)
      .text(check.value || "Not detected", 56 + colWidths.status + colWidths.declaration + 8, y, { width: valWidth, lineGap: 2 })
      .font("Helvetica")
      .fontSize(8)
      .fill("#64748B")
      .text(check.note || "", 56 + colWidths.status + colWidths.declaration + colWidths.value + 8, y, { width: noteWidth, lineGap: 2 });
    y += rowHeight;
  });

  // --- Violation summary ---
  const failed = scan.checks.filter((check) => check.status === "failed");
  const needsReview = scan.checks.filter((check) => check.status === "review");
  if (failed.length > 0 || needsReview.length > 0) {
    y += 14;
    ensureSpace(60);
    doc
      .fill("#0F172A")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Violation summary", 56, y, { width: pageWidth });
    y += 20;
    const summaryLine = failed.length > 0
      ? `${failed.length} of ${scan.checks.length} mandatory declarations FAILED — ${failed.map((check) => check.label).join(", ")}.`
      : `No failed checks; ${needsReview.length} declaration(s) could not be confirmed from the evidence and need officer verification.`;
    const summaryHeight = doc.fontSize(9).font("Helvetica").heightOfString(summaryLine, { width: pageWidth - 20, lineGap: 3 }) + 16;
    doc.rect(56, y - 4, pageWidth, summaryHeight).fill(failed.length > 0 ? "#FFF1F2" : "#FFFBEB");
    doc.y = y + 4;
    doc
      .font("Helvetica")
      .fontSize(9)
      .fill("#0F172A")
      .text(summaryLine, 56 + 10, y + 4, { width: pageWidth - 20, lineGap: 3 });
    y += summaryHeight + 14;
  }

  // --- OCR / label evidence ---
  y += 10;
  ensureSpace(80);
  doc
    .fill("#0F172A")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Label text (OCR)", 56, y, { width: pageWidth });
  y += 20;
  const rawOcr = scan.ocrText?.trim() || "No OCR text was recorded for this scan.";
  const ocrLines = rawOcr.split("\n");
  const displayOcr = ocrLines.length > 40
    ? ocrLines.slice(0, 40).join("\n") + "\n\n... [remaining OCR text retained in electronic archive]"
    : rawOcr;
  const ocrHeight = doc.fontSize(8).font("Courier").heightOfString(displayOcr, { width: pageWidth - 20, lineGap: 3 });
  const ocrBoxHeight = ocrHeight + 18;
  ensureSpace(Math.min(ocrBoxHeight + 20, 200));
  doc.rect(56, y - 4, pageWidth, ocrBoxHeight).fill("#F8FAFC");
  doc.y = y + 4;
  doc
    .font("Courier")
    .fontSize(8)
    .fill("#0F172A")
    .text(displayOcr, 56 + 10, y + 4, {
      width: pageWidth - 20,
      lineGap: 3,
    });
  y += ocrBoxHeight + 20;

  // --- Evidence integrity ---
  ensureSpace(120);
  doc
    .fill("#0F172A")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("Evidence integrity", 56, y, { width: pageWidth });
  y += 22;
  doc.rect(56, y - 6, pageWidth, 58).fill("#1E40AF");
  doc.y = y;
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fill("#BFDBFE")
    .text("SHA-256 EVIDENCE HASH", 56 + 10, y, { width: pageWidth - 20, characterSpacing: 0.4 });
  doc.y = y;
  doc
    .font("Courier-Bold")
    .fontSize(8.5)
    .fill("#FFFFFF")
    .text(evidenceHash, 56 + 10, y + 14, { width: pageWidth - 20 });
  doc.y = y;
  doc
    .font("Helvetica")
    .fontSize(7.5)
    .fill("#BFDBFE")
    .text(
      `Fingerprint of reference, product, label text, checks and capture time. ` +
        `Location: ${scan.location}  •  Captured: ${scan.capturedAt.toISOString().replace("T", " ").slice(0, 19)} UTC`,
      56 + 10,
      y + 32,
      { width: pageWidth - 20 },
    );

  // --- Footer on every page ---
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.font("Helvetica").fontSize(7.5).fill("#94A3B8");
    // The footer sits inside the bottom margin (y > maxY). A normal
    // text() call would trip the line wrapper's page-break check and push
    // the footer onto a phantom page, so it is written without a wrapping
    // width and centered manually.
    const footerText = `Generated by PARAKH on ${now.toISOString().replace("T", " ").slice(0, 19)} UTC  •  Page ${i + 1} of ${pageCount}`;
    const footerX = 56 + (pageWidth - doc.widthOfString(footerText)) / 2;
    doc.text(footerText, footerX, doc.page.height - 40, { lineBreak: false });
  }

  // NOTE: the caller pipes the document to its destination and calls end()
  // (or uses doc.pipe(response)) — ending here would emit the stream before
  // any consumer could attach, producing an empty response.
  return doc;
}