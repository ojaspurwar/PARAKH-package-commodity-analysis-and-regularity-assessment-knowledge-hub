# 🎨 UI/UX Design System & Frontend Architecture
**Project:** SIH26034 - Legal Metrology Enforcement Assistant
**Stack:** Next.js (App Router), Tailwind CSS, Shadcn UI, Framer Motion, next-intl (for localization)

---

## 🧭 1. Core Design Philosophy
The goal is to build a **"Government-Grade"** application. It must look highly professional, trustworthy, and be incredibly easy to use for enforcement officers who might not be tech-savvy. 
*   **Zero Cognitive Load:** The officer should not have to guess what to do. The app should guide them (e.g., "Point camera at label", "Processing...", "Violation Detected").
*   **Vernacular Accessibility (Bilingual):** To support ground-level officers across India, the app must have full bilingual support. While English is the default, users must be prompted to choose between English and Hindi before entering the main app.
*   **High Contrast & Accessibility:** Officers work outdoors in bright sunlight and in dim warehouses. Contrast ratios must meet WCAG AA standards.
*   **Tactile & Responsive:** Every action (scanning, button press, error) must have immediate visual and physical (haptic) feedback.

---

## 🎨 2. Visual Identity & Theme

### **Color Palette**
*   **Primary (Trust & Authority):** `Blue-800` (#1E40AF) to `Blue-600` (#2563EB). Used for primary actions, headers, and official branding.
*   **Success (Compliance):** `Emerald-600` (#059669). Used for "Passed" status and compliant fields.
*   **Danger (Violation/Alert):** `Rose-600` (#E11D48). Used for missing fields, undersized fonts, and critical errors.
*   **Background (Mobile - Outdoor Visibility):** `Slate-50` (#F8FAFC) - High contrast light mode.
*   **Background (Desktop - Command Center):** Dark mode support with `Slate-900` (#0F172A) to reduce eye strain for admins staring at screens all day.

### **Typography**
*   **Primary Font:** `Inter` (Google Fonts). Highly legible, clean, and professional for dense data tables and small mobile screens.
*   **Hindi Font Support:** `Noto Sans Devanagari` (Google Fonts) to ensure perfect rendering of Hindi script without layout breaks.

---

## 📱 3. Mobile UI (The Field Scanner View)
*Optimized for one-handed use, bright environments, and offline scenarios.*

**Key Screens:**
1.  **Welcome & Language Selection (Splash Screen):**
    *   First-time open screen featuring the Ministry Logo.
    *   Simple, massive toggle: **"Choose Language / भाषा चुनें"** -> [English] | [हिन्दी]
    *   This preference is saved locally so they don't have to choose every time.
2.  **The Viewfinder (Home):**
    *   Full-screen camera feed.
    *   A semi-transparent targeting reticle in the center.
    *   **AR Overlay:** When a barcode or text is detected, thin green/red bounding boxes briefly flash over the live video feed.
    *   A massive, thumb-friendly circular capture button at the bottom.
3.  **Processing State (Skeleton UI):**
    *   While the AI processes the image, show a scanning laser animation over the frozen image.
    *   Do *not* use a boring spinning wheel. Make it look like the AI is "reading" the package.
4.  **Result Bottom-Sheet (Swipe Up):**
    *   Once processed, a sleek card slides up from the bottom.
    *   Large bold status: **"✅ Compliant"** or **"❌ Violation Detected" (उल्लंघन पाया गया)**.
    *   A visual checklist of the 5 mandatory rules (MRP, Date, Qty, Font Size, Contact).
    *   One-tap "Submit to Database" button.
5.  **Offline Indicator:** A small cloud icon with a slash at the top right indicating "Offline Mode: 4 Scans Queued".

---

## 💻 4. Desktop UI (The Command Center Dashboard)
*Optimized for widescreen monitors, heavy data analysis, and supervisor oversight.*

**Key Screens:**
1.  **Live Audit Feed (The Dashboard):**
    *   **Layout:** Sidebar navigation on the left, main content area on the right.
    *   **Top Nav:** A quick language toggle (EN | HI) embedded in the header.
    *   **WebSocket Stream:** A dynamic list on the right side of the screen that pushes new scans down in real-time as field officers submit them. 
    *   **Top Metrics Cards:** "Total Scans Today", "Compliance Rate (%)", "Top Violation Type".
2.  **Detailed Evidence Viewer (The Split-Screen):**
    *   When an admin clicks a scan, the screen splits.
    *   *Left Side:* The high-res image with drawn bounding boxes.
    *   *Right Side:* Extracted OCR text, the broken rules highlighted in red, and the GPS map location of where the scan happened.
    *   *Action:* A prominent "Generate PDF Report" button.
3.  **E-Commerce Scanner Tab:**
    *   A clean, centered search bar: "Paste Amazon/Flipkart URL here".
    *   Progress bar while scraping.
    *   Results display identical to physical scans for consistency.

---

## 🧩 5. Component Library (Shadcn UI)
We will use Shadcn UI to rapidly build these accessible components without writing CSS from scratch:
*   `Toast`: For instant non-intrusive notifications ("Scan Synced to Server").
*   `Badge`: For labeling status (e.g., `<Badge variant="destructive">Tampered</Badge>`).
*   `DataTable`: For sorting and filtering the thousands of historical scans on the desktop.
*   `Skeleton`: For loading states to prevent layout shifts.
*   `Drawer` (Bottom Sheet): For the mobile results view.

---

## ⚡ 6. Interactive UX Elements (The "Wow" Factors)
*   **Haptic Feedback:** Using `navigator.vibrate([200, 100, 200])` to trigger a physical double-buzz on the phone when an illegal label is found. 
*   **Client-Side Validation Checks:** Before even hitting the "Scan" button, if the camera detects a blurry image (using a basic Laplacian variance check in JS), it warns: *"Focus camera for better AI results."*
*   **Micro-interactions:** Framer Motion will be used to make buttons "press down" slightly when tapped, making the app feel like a premium native iOS/Android app.

---

## 🛠️ 7. Execution Workflow (How AI & Human will build this)

1.  **AI Provides CLI:** I will give you the command `npx create-next-app@latest` with the exact Tailwind/Shadcn flags, plus the `next-intl` localization library.
2.  **Component Generation:** I will write isolated, plug-and-play React components (e.g., `CameraScanner.tsx`, `LiveDashboard.tsx`) with built-in translation hooks (`const t = useTranslations()`).
3.  **Human Integration:** You copy/paste the components into the Next.js `/components` folder and run the dev server to see the magic instantly.