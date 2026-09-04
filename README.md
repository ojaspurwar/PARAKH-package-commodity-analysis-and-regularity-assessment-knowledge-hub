# Nirikshan — Legal Metrology Assistant (SIH26034)

A field enforcement workspace that **scans and analyzes packaged commodities** to automatically
check compliance under the **Legal Metrology (Packaged Commodities) Rules, 2011**.

Officers photograph a product label (or scan its barcode), and the system reads the
declarations, verifies them against the rules, flags missing/non-compliant declarations, and
produces court-admissible PDF compliance reports — no manual checklist needed.

## What it does

- **Scans package images & labels** — attach a photo and the label text is read automatically
  (on-device OCR with word-level boxes and confidence)
- **Detects mandatory declarations** — MRP, Unit Sale Price (2022 amendment), net quantity,
  date marking, consumer care contact, and packer/importer details
- **Checks correctness, completeness and placement** — verifies the declarations are actually
  on the package image, not clipped or missing
- **Checks readability and font size** — compares estimated font height against the
  Rule 7(3) / Schedule I minimums (keyed on the package's net-quantity band) and uses OCR
  confidence as a legibility proxy
- **Identifies missing / non-compliant declarations** — every check returns
  `passed` / `failed` / `review`, and any failure marks the scan a violation
- **Generates compliance reports and violation summaries** — tamper-evident PDF reports with
  a SHA-256 evidence hash, embedded package image, and a violation summary block
- **Maintains a product repository** — every scanned product grouped with its full
  compliance history and repeat-offender flags
- **Provides an enforcement dashboard** — compliance rate, products tracked, violation
  breakdown by declaration type, pending exceptions, and the live evidence stream

Also supports **barcode scanning** (camera works in every browser via native
`BarcodeDetector` + ZXing fallback), **e-commerce listing scans**, and an
**English / हिन्दी** interface.

## Built with

| Layer | Technology |
|---|---|
| **Language** | TypeScript (5.9) — the entire project, frontend + backend + shared libraries |
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, wouter, TanStack Query, lucide-react |
| **Backend** | Node.js (24), Express 5, Zod validation, pino logging |
| **Database** | SQLite (embedded file — zero setup) via better-sqlite3 + Drizzle ORM |
| **OCR** | tesseract.js (in-browser, word boxes + confidence) |
| **Barcode** | BarcodeDetector API + @zxing/browser (pure-JS fallback) |
| **Reports** | pdfkit (A4 PDF with evidence hash) |
| **API contract** | OpenAPI 3.1 spec → generated Zod schemas + typed React Query client |

## Run it

Requires **Node.js 20+** and **pnpm**.

```bash
pnpm install
pnpm dev
```

`pnpm dev` auto-picks free ports and prints the URLs (including a LAN link to share).
The SQLite database auto-creates and seeds at `.data/nirikshan.db` on first run.

Other commands:

- `pnpm dev:https` — HTTPS dev mode (self-signed cert with your LAN IP) so phone
  browsers allow camera access
- `pnpm start` — production-style single server (builds first)
- `pnpm run build` / `pnpm run typecheck` — full build / typecheck across all packages

## Repository layout

```
artifacts/metrology-assistant/   React web app (field desk, dashboard, repository)
artifacts/api-server/            Express API + Legal Metrology rule engine + PDF reports
lib/db/                          Drizzle schema + SQLite bootstrap
lib/api-spec/                    OpenAPI 3.1 contract (single source of truth)
lib/api-zod/                     Zod schemas generated from the spec
lib/api-client-react/            Typed React Query hooks generated from the spec
scripts/                         Dev runner (port picking) + start script
```

## Notes

- Use `pnpm`, never `npm`/`yarn` (a preinstall hook enforces this).
- Photo OCR needs internet on first use (loads the engine + English traineddata
  from the jsDelivr CDN, cached afterwards).
- See `TECH_STACK.txt` for a detailed technology breakdown and
  `SIH_PROJECT_OVERVIEW.md` for the problem statement.