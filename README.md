# PARAKH — Automated Legal Metrology Compliance Checker
> **Autonomous Compliance Verification & Statutory Inspection Platform based on LMPC Rules, 2011**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115-009688.svg?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg?logo=next.js)](https://nextjs.org)
[![EasyOCR](https://img.shields.io/badge/OCR-EasyOCR%20%2B%20PyTorch-orange.svg)](https://github.com/JaidedAI/EasyOCR)
[![ReportLab](https://img.shields.io/badge/Reports-ReportLab%20PDF-blue.svg)](https://www.reportlab.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## 📋 Overview

**PARAKH** is an end-to-end, full-stack Computer Vision and Rule-Based Audit platform designed to automate Legal Metrology inspections for packaged commodities in India. Built strictly according to the **Legal Metrology (Packaged Commodities) Rules, 2011 (LMPC Rules)**, the system enables enforcement officers and manufacturers to scan package images, identify mandatory declarations, detect statutory violations in real time, and generate tamper-evident PDF inspection certificates.

---

## 🏛️ LMPC Compliance Checks Explained

The system implements the core provisions of the **Legal Metrology (Packaged Commodities) Rules, 2011**:

### 1. Rule 6 Check — Mandatory Declarations
Under Rule 6 of the LMPC Rules, 2011, every package must bear clear and conspicuous mandatory declarations:
- **Maximum Retail Price (MRP)**: Must state the retail price in Indian Rupees with statutory wording *(e.g., "MRP ₹ XX.XX incl. of all taxes")*.
- **Net Quantity**: Standard metric declaration of weight or volume of the commodity contained in the package.
- **Manufacturer / Packer Name & Address**: Clear identification of the manufacturer, packer, or importer.
- **Consumer Care Details**: Mandatory name, address, telephone number, and email ID of the grievance handling officer.
- **Date of Manufacture / Packing / Import**: Month and year of manufacturing, pre-packing, or importation.

> *Engine Behavior:* Extracts entity text and bounding boxes using EasyOCR and NLP regular expressions. Missing declarations trigger a severe violation flag and lower the overall compliance score.

### 2. Rule 13 Check — Standard Units of Weight & Measure
Rule 13 strictly prohibits non-standard abbreviations and pluralized metric symbols on commercial packages.
- **Prohibited Symbols:** `gms`, `gm`, `g.`, `kgs`, `kg.`, `ltrs`, `ltr`, `litres`, `ml.`, `m.l.`.
- **Statutory Standard Symbols:** Only metric symbols prescribed in the Second Schedule are permissible: `g`, `kg`, `ml`, `l` (or `L`).

> *Engine Behavior:* Analyzes the detected Net Quantity declaration with strict regex pattern matching. Non-standard symbols are immediately flagged as **Rule 13 Non-Compliance** with the exact violating snippet highlighted.

### 3. Rule 7 Check — Font Size & Minimum Height
Rule 7 and the First Schedule prescribe minimum numeral and letter heights to ensure consumer readability.
- To account for varying camera distances, package aspect ratios, and resolutions, the engine calculates the **Bounding Box Height to Image Height Ratio**:
  $$\text{Font Height Ratio} = \frac{\text{BBox Height}}{\text{Image Height}} \times 100\%$$
- **Statutory Minimum Ratio:** **2.0%** of total package label height.
- Text blocks with a ratio below **2.0%** are flagged for insufficient font size and low consumer legibility.

---

## 🏗️ Monorepo Architecture

```
PROJECT/
├── backend/                  # FastAPI + Python 3.14 + PyTorch / EasyOCR
│   ├── main.py               # REST API endpoints & upload handlers
│   ├── models.py             # SQLAlchemy models & Pydantic schemas
│   ├── rule_engine.py        # LMPCRuleEngine (Rule 6, 7, 13 audits)
│   ├── pdf_generator.py      # ReportLab statutory inspection certificate generator
│   ├── requirements.txt      # Python dependencies
│   ├── uploads/              # Storage for inspected package images
│   └── lmpc_inspections.db   # SQLite database (auto-created)
│
├── frontend/                 # Next.js 14 + Tailwind CSS + Lucide React
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Dashboard (Stats, Donut chart, Rule violations)
│   │   │   ├── scan/page.tsx     # Drag & drop upload + Live Camera scanner
│   │   │   ├── results/[id]/     # Interactive bounding box overlays + Rule breakdown
│   │   │   ├── history/page.tsx  # Searchable scan history repository
│   │   │   └── globals.css       # Dark mode glassmorphism UI theme
│   │   ├── components/navbar.tsx # Cyber-glass navigation bar
│   │   └── lib/api.ts            # Typed backend client
│   ├── tailwind.config.js
│   ├── next.config.mjs
│   └── package.json
│
├── run.sh                    # Linux / macOS / Git Bash concurrent launcher
├── run.ps1                   # Windows PowerShell concurrent launcher
└── README.md
```

---

## 🚀 Quickstart Guide

### Prerequisites
- **Node.js 20+** and **pnpm**
- **Python 3.10 - 3.14**

### 1. Launch with One Command (Recommended)

#### On Windows (PowerShell):
```powershell
.\run.ps1
```

#### On Linux / macOS / Git Bash:
```bash
chmod +x run.sh
./run.sh
```

The script will automatically start:
- **Frontend Web UI (HTTPS)**: [https://localhost:41052](https://localhost:41052)
- **Mobile Phone Camera (LAN)**: `https://<YOUR-LAN-IP>:41052` (e.g., `https://10.7.25.165:41052`)
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Interactive OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

> **Mobile Camera Note**: Phone browsers (Chrome, Safari, iOS/Android) enforce TLS security and disable camera access (`getUserMedia`) over unencrypted HTTP. Serving the frontend over HTTPS on port `41052` ensures that live camera scanning works seamlessly on your phone.

---

### 2. Manual Startup

#### Backend Setup
```bash
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup (HTTPS on Port 41052)
```bash
cd frontend

# Install dependencies
pnpm install

# Start Next.js HTTPS development server
pnpm run dev:https
```

---

## 📡 Backend API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/inspect` | Upload commodity image for EasyOCR & LMPC Rule Engine audit |
| `GET` | `/api/inspections` | Retrieve all past inspection records (supports `?limit=50`) |
| `GET` | `/api/inspections/{id}` | Retrieve full inspection details, OCR boxes, and violations |
| `GET` | `/api/inspections/{id}/report` | Download statutory PDF Inspection Certificate (ReportLab) |
| `GET` | `/api/stats` | Aggregated dashboard statistics (compliance rate, violation counts) |
| `GET` | `/api/healthz` | System health and OCR engine readiness check |

---

## 🖥️ Frontend Features

1. **Enforcement Dashboard (`/`)**:
   - Total inspections counter, compliance rate gauge with animated SVG donut chart.
   - Live breakdown of Rule 6, Rule 7, and Rule 13 violation counts.
   - Table of recent scans with status badges and one-click access to reports.

2. **Compliance Scanner (`/scan`)**:
   - Drag-and-drop package image upload with format validation.
   - Integrated live webcam/phone camera viewfinder with snapshot capture.
   - Multi-stage progress indicator (*Uploading → Running OCR → Auditing LMPC Rules → Finalizing*).

3. **Inspection Results View (`/results/[id]`)**:
   - Side-by-side view with HTML5 Canvas bounding box overlay.
   - Compliant text detected highlighted in **Neon Green**; non-compliant or violating text highlighted in **Vibrant Red**.
   - Tabular declaration audit (MRP, Net Qty, Mfg Address, Consumer Care, Date).
   - Instant download button for court-admissible PDF Inspection Certificate.

4. **Historical Repository (`/history`)**:
   - Search by file name or inspection ID.
   - Filter by status (**All**, **Compliant**, **Non-Compliant**).
   - Direct links to re-inspect results and re-download certificates.

---

## ⚖️ Statutory Reference
- *The Legal Metrology Act, 2009 (No. 1 of 2010)*
- *The Legal Metrology (Packaged Commodities) Rules, 2011*
- *Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution, Government of India*