# PARAKH — Legal Metrology Enforcement Portal

> **Autonomous Compliance Verification & Statutory Inspection Platform**
> Built on the Legal Metrology (Packaged Commodities) Rules, 2011

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg?logo=typescript)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Backend-Express%205-green.svg?logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB.svg?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build-Vite%207-646CFF.svg?logo=vite)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## Overview

**PARAKH** is a full-stack compliance inspection platform that enables enforcement officers to scan packaged retail products, extract declared label information using AI vision, and check it against the Legal Metrology (Packaged Commodities) Rules, 2011 — including Rule 6 mandatory declarations, Rule 7 font sizing, net quantity, MRP, unit sale price, country of origin, and consumer care details.

### Key capabilities

- **AI-powered label scanning** — captures a package photo, extracts all statutory declarations via OpenRouter Vision AI (Google Gemini 2.5 Flash)
- **In-browser OCR** — Tesseract.js for offline/fallback text extraction
- **LMPC compliance engine** — automated checks against Rule 6, Rule 7, and Rule 13
- **Verdict panel** — visual compliance report with per-declaration pass/fail status
- **PDF inspection reports** — court-admissible statutory certificates via PDFKit
- **Bilingual UI** — English / हिन्दी toggle for all statutory terms
- **Mobile-first camera** — HTTPS-enabled live camera capture for phone scanning

---

## Architecture

```
PROJECT/
├── artifacts/
│   ├── api-server/           # Express 5 + TypeScript backend
│   │   └── src/
│   │       ├── routes/       # REST API endpoints (scans, AI analysis, health)
│   │       ├── lib/          # AI vision, metrology engine, PDF reports
│   │       └── app.ts        # Express app configuration
│   │
│   ├── metrology-assistant/  # React 19 + Vite 7 frontend
│   │   └── src/
│   │       ├── pages/        # Home, Dashboard, Products, Docs, E-commerce
│   │       ├── components/   # Verdict panel, scan UI, barcode scanner
│   │       └── styles/       # Tailwind CSS + Government design tokens
│   │
│   └── mockup-sandbox/       # Component preview sandbox
│
├── lib/
│   ├── api-client-react/     # Typed React Query API client
│   ├── api-spec/             # OpenAPI specification
│   ├── api-zod/              # Zod-validated API types
│   └── db/                   # Drizzle ORM + SQLite schema
│
├── scripts/
│   ├── dev.mjs               # Local dev runner (HTTPS + auto ports)
│   └── start.mjs             # Production single-server launcher
│
├── reference/                # Design reference screenshots
└── .env.example              # Required environment variables
```

---

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, Radix UI, TanStack React Query, Recharts, Framer Motion, Wouter |
| **Backend** | Express 5, TypeScript, Drizzle ORM, better-sqlite3, PDFKit, Pino logger |
| **AI Vision** | OpenRouter API (Google Gemini 2.5 Flash) |
| **OCR** | Tesseract.js (in-browser), OpenRouter Vision (cloud) |
| **Database** | SQLite (auto-created, zero-config) |
| **Build** | pnpm workspaces, esbuild, TypeScript 5.9 |

---

## Quickstart

### Prerequisites

- **Node.js 20+** and **pnpm**
- An **OpenRouter API key** (free tier available at [openrouter.ai](https://openrouter.ai))

### 1. Install and start

```bash
# Install dependencies
pnpm install

# Copy environment config and add your API key
cp .env.example .env
# Edit .env and set OPENROUTER_API_KEY=sk-or-v1-...

# Start development servers (HTTPS for camera access)
pnpm dev
```

The dev runner automatically:
- Starts the API server on an available port
- Starts the Vite dev server on an available port
- Proxies `/api` requests to the backend
- Generates a self-signed HTTPS certificate for mobile camera testing

### 2. Open in browser

- **Local:** `https://localhost:<web-port>` (shown in terminal)
- **Mobile:** Use the LAN URL shown in terminal (same network required)

Your phone will show a certificate warning on first visit — tap "Advanced" → "Proceed" to enable camera scanning.

### 3. Production build

```bash
pnpm build    # Typecheck + build API + build frontend
pnpm start    # Serve everything from http://localhost:5000
```

---

## Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes | API key from [openrouter.ai](https://openrouter.ai/keys) |
| `AI_VISION_MODEL` | No | AI model (default: `google/gemini-2.5-flash`) |
| `DATABASE_PATH` | No | SQLite path (default: `.data/parakh.db`) |
| `WEB_PORT` | No | Frontend port (default: auto-picked) |
| `API_PORT` | No | Backend port (default: auto-picked) |
| `HTTPS` | No | Set `0` to disable HTTPS in dev |

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/healthz` | Health check |
| `POST` | `/api/scans` | Submit a package scan (image or text) |
| `GET` | `/api/scans` | List past scans |
| `GET` | `/api/scans/:id` | Get scan details with verdict |
| `POST` | `/api/ai/analyze-image` | AI vision analysis endpoint |
| `GET` | `/api/ai/status` | AI service availability check |

---

## Statutory reference

- The Legal Metrology Act, 2009 (No. 1 of 2010)
- The Legal Metrology (Packaged Commodities) Rules, 2011
- Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Government of India

---

## License

MIT
