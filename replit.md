# PARAKH — Package Commodity Analysis & Regularity Assessment Knowledge Hub (SIH26034)

Field enforcement workspace for officers inspecting packaged commodities under the
**Legal Metrology (Packaged Commodities) Rules, 2011**. Capture product label
declarations, review compliance checks, submit evidence, and let supervisors
monitor activity — all with a persistent local database.

## Run & Operate (localhost)

Requirements: Node.js 20.19+/24 and pnpm (`corepack enable` or `npm i -g pnpm`).

- `pnpm install` — install dependencies (first time only)
- `pnpm dev` — development mode, hot reload:
  - Web app → http://localhost:5173 (Vite, proxies `/api` to the API server)
  - API server → http://localhost:5000 (health: `/api/healthz`)
  - If either port is taken, a random free port is auto-picked and printed
- `pnpm dev:https` — same as `pnpm dev`, but serves the web app over **HTTPS**
  with an auto-generated self-signed certificate. **Required for barcode camera
  scanning from a phone on your wifi**: browsers only allow camera access on
  `https://` or `localhost`, so the plain `http://<LAN-IP>` link silently blocks
  the camera with no permission prompt. Open the printed `https://` link on your
  phone and accept the certificate warning once.
- `pnpm start` — production-style single server (typechecks + builds first):
  - App **and** API → http://localhost:5000
- `pnpm run build` — typecheck + build the API server and web app
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/db run push` — push DB schema changes (SQLite; normally unnecessary — tables are auto-created at startup)

### Database

- **SQLite** via `better-sqlite3` + Drizzle ORM. No Postgres/installation needed.
- Default file: `.data/parakh.db` at the repo root (override with `DATABASE_PATH`).
- Created automatically on first run, including the `scans` table.
- Data **persists** across browser refreshes, tab closes, and server restarts.
- Env overrides: `PORT` (default 5000), `API_PORT`/`WEB_PORT` for `pnpm dev`,
  `DATABASE_PATH`, `LOG_LEVEL`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite, Tailwind CSS v4, shadcn-style components, wouter router,
  TanStack Query, generated API client
- API: Express 5, Zod validation (`zod/v4`), Orval-generated schemas
- DB: SQLite + Drizzle ORM (`better-sqlite3`)
- Build: esbuild (CJS bundle) for the API, Vite for the web app

## Where things live

- `artifacts/metrology-assistant/` — the web app (pages, components, theme tokens in `src/index.css`, app config in `src/config.ts`)
- `artifacts/api-server/` — Express server (`src/app.ts`, `src/routes/`) and static hosting of the built web app
- `lib/db/` — source of truth for the DB schema (`src/schema/`) and SQLite bootstrap (`src/index.ts`)
- `lib/api-zod/` + `lib/api-client-react/` — generated from `lib/api-spec/openapi.yaml` (run `pnpm --filter @workspace/api-spec run codegen` to regenerate)
- `lib/api-spec/` — OpenAPI spec (`openapi.yaml`)
- `scripts/` — `dev.mjs` / `start.mjs` local runners
- `artifacts/mockup-sandbox/` — Replit component-preview canvas (not part of the shipped app)

## Architecture decisions

- **One server on localhost**: the Express server serves `/api` and (in production
  mode) the built frontend with SPA fallback, so `pnpm start` hosts everything on :5000.
- **Vite dev proxy**: in `pnpm dev`, Vite proxies `/api` to the API server so the
  browser stays on a single origin. On Replit the platform gateway does this routing,
  so the proxy is only enabled outside Replit.
- **SQLite instead of Postgres**: zero-setup persistent storage for a hackathon/local
  demo; the file is auto-created and seeded on first boot.
- **Defaults over required env**: PORT / BASE_PATH / DB path fall back to sensible
  values locally while still honouring Replit-injected env vars.
- **Offline-safe UI**: every mutation shows an inline success/error notice; the
  register and evidence records live server-side so nothing is lost on tab close.

## Product

- Field capture desk (attach a package photo → auto OCR → review checks → submit)
- Barcode scanning (camera, works in every browser via native BarcodeDetector +
  ZXing fallback) that creates a scan straight into the register
- Supervisor dashboard (metrics, violation breakdown by declaration type,
  evidence stream, exceptions queue)
- Products repository (scans grouped by product with full compliance history,
  repeat-offender flag)
- Scan detail / evidence viewer (compliance checks, OCR text + metadata,
  evidence hash, PDF export)
- E-commerce listing desk (submit an Amazon/Flipkart URL → reviewable scan)
- Bilingual EN/हिन्दी toggle (persisted per device)
- Seed data inserted once so the dashboard is demo-ready on first boot

## Automated compliance checking (rule engine)

- `artifacts/api-server/src/lib/metrology.ts` — rule engine for the Legal
  Metrology (Packaged Commodities) Rules, 2011. Analyzes label/OCR text and
  generates a `ComplianceCheck[]` for MRP, Unit Sale Price (2022 amendment),
  net quantity, date marking, consumer care contact, and packer/importer
  details. When structured OCR data from a package image is present, it adds
  three more checks:
  - **Declaration placement** — are the declarations actually on the image
    (not clipped at the edges)?
  - **Font size** — estimated mm height vs the Rule 7(3) / Schedule I
    minimums keyed on the package's net-quantity band (e.g. 4 mm above 500 g).
  - **Readability** — OCR confidence of the declaration words as a
    legibility proxy.
  Status semantics: `passed` (detected), `failed` (keyword present but value
  missing/invalid), `review` (not found — needs officer review).
- `POST /api/scans` runs the engine over `ocrText` (+ `ocrDetails`) when the
  client omits `checks`, and derives the overall status (`compliant` /
  `violation` / `pending`) from the checks unless the officer chose a
  specific assessment.
- Every scan gets a SHA-256 **evidence hash** (`evidenceHash`) computed at
  capture time from reference, product, barcode, OCR text (+ details), checks
  and capture time.
- Photo OCR runs **client-side** (tesseract.js in a web worker): the home
  page's capture form reads the label straight off the photo and submits the
  text plus word boxes/confidence. First use loads the engine + English
  traineddata from the jsDelivr CDN (needs internet).

## PDF compliance reports

- `GET /api/scans/:id/report` streams a court-admissible A4 PDF via pdfkit:
  product + evidence metadata, the compliance check table with verdicts, a
  **violation summary** (failed declarations listed), the raw OCR text, the
  package image when one is attached, and an evidence-integrity block with
  the SHA-256 hash, capture location and timestamp. Legacy rows get their
  hash recomputed on export.
- Reports flow onto a second page cleanly when the checks table is long (the
  layout starts a fresh page instead of pdfkit cascading blank pages).
- The scan detail page has a **Download PDF report** button and shows the
  evidence hash.

## User preferences

- Keep the UI focused on the enforcement workflow — no unrelated marketing copy.
- The language toggle should remember the officer's choice locally.

## Gotchas

- Run `pnpm install` (never `npm`/`yarn`) — a preinstall hook enforces this.
- `pnpm dev` rebuilds the API bundle before starting it (esbuild, ~1s); source
  changes to `artifacts/api-server` need a server restart.
- Do not delete `.data/` while the server is running (WAL files); stop first.
- `pnpm-workspace.yaml` intentionally no longer strips non-Linux binaries — that
  was a Replit-only optimisation that broke installs on Windows/macOS.
