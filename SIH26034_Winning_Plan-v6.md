# 🏆 SIH 2026 Master Plan: Winning Strategy for SIH26034

**Problem Statement:** Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.  
**Organization:** Ministry of Consumer Affairs, Food & Public Distribution  
**Category:** Software

---

## 🌟 1. The "Winning Edge" Strategy (How to Stand Out)
Most teams build a generic OCR script. Winning requires building an **Enforcement Officer's Assistant** designed for field reality, backed by actual Indian metrology regulations.

**Key Differentiators:**
1.  **Dual-Mode Architecture (Field vs. Desk):** Synchronized workflow where a **Phone** serves as the field scanner (native camera, barcode scanning, image upload), while a **Laptop/Desktop** acts as the command center (database review, report generation, real-time WebSocket sync).
2.  **Hardcoded Legal Metrology Rules:** Explicitly test compliance with Rule 7:
    *   Minimum font height of 1mm (normal) and 2mm (embossed/molded).
    *   Scale numerals dynamically by net weight (e.g., 2mm up to 200g, 4mm from 200g to 500g, 6mm above 500g).
    *   **Unit Sale Price (USP) Check (2022 Amendment):** Automatically check for mandatory price-per-gram or price-per-millilitre declarations.
3.  **Multi-Channel Auditing (Physical Labels + E-Commerce Listings):** Support physical packaging scans AND e-commerce URL inspections (satisfying the Problem Statement requirement for "product listings").
4.  **Tamper-Proof Audit Trail:** Capture device GPS coordinates and attach a cryptographic SHA-256 hash to scan images and generated PDF reports to guarantee chain-of-custody for courtroom enforcement.
5.  **Offline-First Resilience:** Progressive Web App (PWA) with local IndexedDB caching to queue scans when officers operate in low-connectivity rural warehouses.

---

## 📱 2. Mobile-First Optimization Architecture
*   **Native Barcode Detection:** Runs client-side using the browser's native `BarcodeDetector` API for zero latency before sending photos.
*   **In-Browser Canvas Compression:** Compresses raw 10MB+ camera frames to under 500KB using an off-screen HTML5 `<canvas>` before uploading, preventing slow-network failures.
*   **EXIF Auto-Orientation:** Automatically corrects sensor rotation quirks in JavaScript so OCR models receive upright text.
*   **Thumb-Centric UI & Haptics:** High-contrast buttons and HTML5 Vibration API triggers for physical feedback on successful scan or violation alerts.

---

## 🛠️ 3. Tech Stack (100% Free & Open Source)

### **Frontend (Mobile & Desktop Web)**
*   **Framework:** Next.js (React) + PWA setup (App Router).
*   **Styling & UI:** Tailwind CSS + Lucide Icons + Framer Motion.
*   **Camera & Barcode:** Native `navigator.mediaDevices.getUserMedia` + HTML5 `BarcodeDetector` API.

### **Backend & APIs**
*   **Framework:** FastAPI (Python) - High-speed, async, native ML interoperability.
*   **Real-time Layer:** WebSockets (FastAPI built-in) for phone-to-laptop live broadcast.
*   **Database:** PostgreSQL (local or free-tier Supabase).
*   **Scraper Engine:** `httpx` + `BeautifulSoup4` for online product listing audits.
*   **Report Engine:** `ReportLab` or `WeasyPrint` for official digital PDF exports with SHA-256 signatures.

### **Vision & Rule Processing**
*   **OCR:** `EasyOCR` (better on textured backgrounds) and `pytesseract`.
*   **Image Processing:** `OpenCV` (contrast enhancement, binarization, contour bounding boxes).
*   **Rule Engine:** Custom Python regex and standard unit validation pipelines.

---

## 📋 4. Prerequisites & Environment Setup

**You (The Developer) will provide:**
*   Environment configurations (`.env` file with database URLs or session secrets when requested).
*   Test photos of packaging labels (good labels, missing MRP, missing date, curved surfaces).

**The AI Assistant will provide:**
*   Ready-to-run terminal commands (CLI) for setup and dependencies.
*   Complete source code files for backend processing, CV logic, and UI components.
*   Folder scaffolding and database migration scripts.

---

## 🚀 5. Realistic Execution Plan

### **Phase 1: Legal Metrology Rule Matrix (Days 1-2)**
Map exact requirements into a JSON validation schema:
*   *Manufacturer/Packer Details:* Address, pin code, name.
*   *Net Quantity:* Valid numerical value + allowed units (`g`, `kg`, `ml`, `l`, `m`, `u`).
*   *Pricing:* Presence of MRP, "inclusive of all taxes", and Unit Sale Price (`/g`, `/ml`, `/unit`).
*   *Consumer Care:* Valid email pattern or 10-digit/1800 contact number.
*   *Manufacturing Date:* Format validation (`MM/YYYY` or `MM/YY`).

### **Phase 2: Vision & Parsing Pipeline (Days 3-7)**
*   Build image pre-processing in OpenCV (grayscale, Gaussian blur, Otsu thresholding).
*   Extract text regions and bounding box heights via EasyOCR.
*   Run the custom RegEx rule matrix against extracted text to calculate compliance percentage.
*   Estimate font height against bounding box aspect ratios and reference markers.

### **Phase 3: E-Commerce Listing Checker (Days 8-10)**
*   Build an endpoint accepting product URLs (e.g., Amazon, Blinkit, Flipkart).
*   Extract product detail HTML tables using `BeautifulSoup`.
*   Pass the extracted text into the same legal validation matrix used for physical labels.

### **Phase 4: Backend API & Synchronization (Days 11-14)**
*   `POST /api/scan`: Accepts compressed image, runs vision pipeline, records GPS/hash.
*   `POST /api/audit-url`: Scrapes listing, checks mandatory declarations.
*   `WS /ws/live`: Real-time WebSocket connection to stream phone scan events to desktop.
*   `GET /api/report/{id}`: Generates an official signed PDF report with embedded photo evidence and GPS stamp.

### **Phase 5: Frontend Dual-Screen UI (Days 15-20)**
*   **Mobile View (`/scanner`):** Camera viewport, barcode reticle, tactile capture button, quick pass/fail checklist.
*   **Desktop View (`/dashboard`):** Real-time activity feed, product listing URL auditor, compliance heatmaps, violation filter table.

### **Phase 6: Integration, Testing & Pitch Prep (Days 21-25)**
*   Test edge cases: wrinkled packets, low-light photos, truncated manufacturer addresses.
*   Prepare offline demo mode with mock data in case hackathon venue Wi-Fi fails.

---

## 🎯 6. Hackathon Deliverable Checklist
- [ ] Dual-device workflow: Live phone capture updating laptop dashboard via WebSockets.
- [ ] Automated check for MRP, Unit Sale Price (USP), Net Quantity, Mfg Date, and Consumer Care.
- [ ] Font size estimation using bounding box height metrics.
- [ ] E-Commerce URL audit mode for digital packaged listings.
- [ ] Cryptographic hash (SHA-256) and GPS timestamp on audit reports.
- [ ] Instant export of printable, court-admissible PDF violation reports.