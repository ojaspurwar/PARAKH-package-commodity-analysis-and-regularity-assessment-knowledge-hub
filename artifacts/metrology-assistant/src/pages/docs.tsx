import { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Code2, Database, Download, FileCheck, FileSpreadsheet, FileText, Gavel, Layers, Network, Scale, Shield, ShieldAlert, Terminal } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function DocsPage() {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'rules' | 'architecture' | 'deployment' | 'sop'>('rules');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(2);

  const toggleChapter = (ch: number) => {
    setExpandedChapter(expandedChapter === ch ? null : ch);
  };

  return (
    <div className="space-y-8">
      <section className="appear flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-secondary">
            {language === 'hi' ? 'विधिक एवं तकनीकी ज्ञान केंद्र' : 'Statutory & Technical Knowledge Hub'}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em] md:text-4xl">
            {language === 'hi' ? 'दस्तावेज़ीकरण एवं प्रणाली वास्तुकला' : 'Documentation & Architecture'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {language === 'hi' ? 'विधिक मापविज्ञान (पैकेज्ड वस्तुएं) नियम, 2011 का पूर्ण विधिक संहिताकरण, सॉफ्टवेयर आर्किटेक्चर आरेख और फील्ड परिनियोजन रूपरेखा।' : 'Complete statutory codification of the Legal Metrology (Packaged Commodities) Rules, 2011, combined with system architecture diagrams and the field deployment framework.'}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-secondary" />
          <span>{language === 'hi' ? 'संहिताबद्ध नियम: अध्याय I – VII (नियम 1–34)' : 'Rules Codified: Chapters I – VII (Rules 1–34)'}</span>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'rules' ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <Scale size={15} /> {language === 'hi' ? 'विधिक मापविज्ञान नियम (2011)' : 'Legal Metrology Rules (2011)'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'architecture' ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <Layers size={15} /> {language === 'hi' ? 'सॉफ्टवेयर आर्किटेक्चर' : 'Software Architecture'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('deployment')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'deployment' ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <Terminal size={15} /> {language === 'hi' ? 'परिनियोजन ढांचा' : 'Deployment Framework'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sop')}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${activeTab === 'sop' ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground hover:bg-muted'}`}
        >
          <FileCheck size={15} /> {language === 'hi' ? 'अधिकारी निरीक्षण एसओपी (SOP)' : 'Officer Inspection SOP'}
        </button>
      </div>

      {/* Tab 1: Legal Metrology Rules (Chapters I - VII) */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold tracking-tight">Legal Metrology (Packaged Commodities) Rules, 2011</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Enacted under the Legal Metrology Act, 2009 (Came into force April 1, 2011). Select a chapter below for detailed statutory provisions and rule enforcement specifications.
            </p>
          </div>

          <div className="space-y-4">
            {/* Chapter I */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => toggleChapter(1)}
                className="flex w-full items-center justify-between p-5 text-left font-medium hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">I</span>
                  <div>
                    <h3 className="text-sm font-semibold">Chapter I: Preliminary (Rules 1 & 2)</h3>
                    <p className="text-xs text-muted-foreground">Short Title, Commencement & Statutory Definitions</p>
                  </div>
                </div>
                {expandedChapter === 1 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
              </button>
              {expandedChapter === 1 && (
                <div className="border-t border-border bg-muted/20 p-5 text-xs leading-6 text-foreground/80 space-y-3">
                  <p><strong>Rule 1 (Title & Date):</strong> Legal Metrology (Packaged Commodities) Rules, 2011. Came into force April 1, 2011, superseding the 1977 rules.</p>
                  <p><strong>Rule 2(l) Pre-packaged Commodity:</strong> Commodity placed in packaging without the purchaser present, with predetermined quantity that cannot be altered without opening/modifying.</p>
                  <p><strong>Rule 2(k) Retail Package:</strong> Packages produced for consumption through retail distribution channels.</p>
                  <p><strong>Rule 2(m) Retail Sale Price (MRP):</strong> Maximum price at which the commodity may be sold to the consumer, explicitly inclusive of all local and central taxes.</p>
                  <p><strong>Rule 2(bb) & 2(bc) Industrial & Institutional Consumers:</strong> Bulk consumers purchasing directly from manufacturers for processing or operational use (exempt from retail rules under Rule 3).</p>
                </div>
              )}
            </div>

            {/* Chapter II */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => toggleChapter(2)}
                className="flex w-full items-center justify-between p-5 text-left font-medium hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">II</span>
                  <div>
                    <h3 className="text-sm font-semibold">Chapter II: Provisions Applicable to Retail Packages (Rules 3 – 23)</h3>
                    <p className="text-xs text-muted-foreground">Mandatory Rule 6 declarations, Rule 7 PDP, Font sizes, Net Qty, MRP & USP</p>
                  </div>
                </div>
                {expandedChapter === 2 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
              </button>
              {expandedChapter === 2 && (
                <div className="border-t border-border bg-muted/20 p-5 text-xs leading-6 text-foreground/80 space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary">Rule 6: Mandatory Declarations on Every Retail Package</h4>
                    <ul className="mt-2 list-disc pl-5 space-y-1">
                      <li><strong>Identity:</strong> Common or generic name of the commodity [Rule 6(1)(a)].</li>
                      <li><strong>Manufacturer / Packer / Importer:</strong> Complete physical address with postal PIN code [Rule 6(1)(b) & Rule 10].</li>
                      <li><strong>Country of Origin:</strong> Mandatory declaration on imported commodities [Rule 6(1)(a) & Rule 6(10)].</li>
                      <li><strong>Net Quantity:</strong> Actual usable content excluding tare weight in standard metric SI units (g, kg, ml, l, pcs) [Rule 6(1)(c) & Rules 11–13].</li>
                      <li><strong>Date Marking:</strong> Month and year of manufacture, packing, or import [Rule 6(1)(d)].</li>
                      <li><strong>Retail Sale Price (MRP):</strong> Must read &ldquo;Maximum Retail Price ₹ / Rs. ...... inclusive of all taxes&rdquo; [Rule 6(1)(e) & Rule 2(m)].</li>
                      <li><strong>Unit Sale Price (USP):</strong> Mandatory price-per-g or price-per-ml declaration for multi-unit or non-standard weights (2022 Amendment) [Rule 6(1)(f)].</li>
                      <li><strong>Consumer Care:</strong> Name/designation, address, telephone/toll-free number, and email ID for grievance redressal [Rule 6(1)(g)].</li>
                      <li><strong>E-Commerce Listings:</strong> Marketplaces must display all mandatory declarations on digital listings prior to sale [Rule 6(10)].</li>
                    </ul>
                  </div>

                  <div className="border-t border-border pt-3">
                    <h4 className="font-semibold text-primary">Rule 7: Principal Display Panel (PDP) & Font Sizing</h4>
                    <p className="mt-1">
                      Mandates minimum font and numeral heights under Schedule I based on the net quantity band:
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-card p-3 font-mono text-[11px]">
                      <div><strong>Net Qty ≤ 200g/ml:</strong><br />Numerals: 2.0 mm<br />Letters: 1.0 mm</div>
                      <div><strong>200g – 500g/ml:</strong><br />Numerals: 4.0 mm<br />Letters: 2.0 mm</div>
                      <div><strong>Above 500g/ml:</strong><br />Numerals: 6.0 mm<br />Letters: 4.0 mm</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <h4 className="font-semibold text-primary">Rules 11 – 13: Standard Metric Units & Tare Weight</h4>
                    <p className="mt-1">
                      Rule 13 strictly enforces standard SI symbols (g, kg, ml, l, m, cm). Plurals (e.g. &ldquo;gms&rdquo;, &ldquo;kgs&rdquo;) and informal terms are prohibited violations. Drained weight must be declared for commodities packed in liquid media.
                    </p>
                  </div>

                  <div className="border-t border-border pt-3">
                    <h4 className="font-semibold text-primary">Rules 18 – 23: Enforcement, Seizures & Deceptive Packaging</h4>
                    <p className="mt-1">
                      <strong>Rule 18:</strong> Prohibits selling above MRP and dual MRP across locations.
                      <br /><strong>Rule 19–21:</strong> Authorizes Metrology Officers to inspect premises, draw statistical lots, and issue seizure memos.
                      <br /><strong>Rule 22:</strong> Maximum Permissible Error (MPE) tolerances for filling variance.
                      <br /><strong>Rule 23:</strong> Prohibits deceptive packages with slack fill, false bottoms, or misleading visual dimensions.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Chapter III & IV */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => toggleChapter(3)}
                className="flex w-full items-center justify-between p-5 text-left font-medium hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">III</span>
                  <div>
                    <h3 className="text-sm font-semibold">Chapters III & IV: Wholesale & Export/Import (Rules 24 & 25)</h3>
                    <p className="text-xs text-muted-foreground">Master cartons and domestic resale restrictions on export stock</p>
                  </div>
                </div>
                {expandedChapter === 3 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
              </button>
              {expandedChapter === 3 && (
                <div className="border-t border-border bg-muted/20 p-5 text-xs leading-6 text-foreground/80 space-y-2">
                  <p><strong>Rule 24 (Wholesale Packages):</strong> Master shipping cartons must declare manufacturer identity, commodity generic name, and total bulk net quantity or count of retail units inside.</p>
                  <p><strong>Rule 25 (Export Packages):</strong> Packages labeled specifically for foreign export cannot be diverted into Indian domestic commerce without supplementary labels ensuring domestic Legal Metrology and MRP compliance.</p>
                </div>
              )}
            </div>

            {/* Chapter V */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => toggleChapter(5)}
                className="flex w-full items-center justify-between p-5 text-left font-medium hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">V</span>
                  <div>
                    <h3 className="text-sm font-semibold">Chapter V: Exemptions (Rule 26)</h3>
                    <p className="text-xs text-muted-foreground">Packages containing 10g/10ml or less, fast food, and DPCO medical devices</p>
                  </div>
                </div>
                {expandedChapter === 5 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
              </button>
              {expandedChapter === 5 && (
                <div className="border-t border-border bg-muted/20 p-5 text-xs leading-6 text-foreground/80 space-y-2">
                  <p><strong>Rule 26 Exemptions:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Small packages containing <strong>10 g or 10 ml or less</strong> (excluding tobacco products and pan masala).</li>
                    <li>Fast food items packed by restaurants or hotels for immediate consumption.</li>
                    <li>Scheduled drug formulations and medical devices governed under the Drugs (Prices Control) Order (DPCO).</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Chapter VI & VII */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => toggleChapter(6)}
                className="flex w-full items-center justify-between p-5 text-left font-medium hover:bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/10 font-mono text-xs font-bold text-primary">VI</span>
                  <div>
                    <h3 className="text-sm font-semibold">Chapters VI & VII: Registration, Penalties & Compounding (Rules 27 – 34)</h3>
                    <p className="text-xs text-muted-foreground">LMPC registration, Section 36 penalties, and Rule 32A settlement procedures</p>
                  </div>
                </div>
                {expandedChapter === 6 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
              </button>
              {expandedChapter === 6 && (
                <div className="border-t border-border bg-muted/20 p-5 text-xs leading-6 text-foreground/80 space-y-3">
                  <p><strong>Rule 27 (LMPC Certificate):</strong> Every manufacturer, packer, or importer must register within 90 days of commencing operations.</p>
                  <p><strong>Rule 32 (Penalties):</strong> Infractions attract monetary penalties and prosecution under Section 36 and Section 49 (director liability) of the Legal Metrology Act, 2009.</p>
                  <p><strong>Rule 32A (Compounding of Offences):</strong> First-time non-compliance can be compounded (settled out of court) upon payment of compounding fees prescribed by the Controller.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Software Architecture */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold tracking-tight">System Architecture & Data Flow</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              PARAKH is engineered as a secure, distributed field compliance assistant operating under edge-first computing principles.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <Code2 size={17} /> Frontend Edge Layer (React 19 + Vite)
              </div>
              <p className="text-xs text-muted-foreground leading-5">
                • <strong>Client-Side OCR:</strong> Runs Tesseract.js in a background Web Worker directly on the officer&apos;s phone or workstation. Extracts text, coordinates, bounding box dimensions, and confidence scores without sending raw multi-megabyte photos over constrained 4G/5G connections.
                <br />• <strong>Native Barcode Engine:</strong> Uses browser hardware <code className="text-[11px] bg-muted px-1 py-0.5 rounded">BarcodeDetector</code> with an in-memory pure JS ZXing fallback.
                <br />• <strong>Canvas Compression:</strong> Downscales raw 12MP camera photos to optimized ~300KB JPEG data URLs before submission.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-secondary font-semibold text-sm">
                <Gavel size={17} /> Legal Metrology Rule Engine (Express 5)
              </div>
              <p className="text-xs text-muted-foreground leading-5">
                • <strong>Automated Verification:</strong> Evaluates text against Rules 6, 7, 10, 11-13, and 26. Generates individual verdict pills (<code className="text-[11px] bg-secondary/15 text-secondary px-1 py-0.5 rounded">PASSED</code>, <code className="text-[11px] bg-destructive/15 text-destructive px-1 py-0.5 rounded">FAILED</code>, <code className="text-[11px] bg-accent/30 text-foreground px-1 py-0.5 rounded">REVIEW</code>).
                <br />• <strong>Schedule I Font Check:</strong> Converts word box pixel dimensions into physical millimeters at standard DPI, comparing against net weight bands.
                <br />• <strong>Readability Index:</strong> Averages word-level confidence scores to spot smudged, faint, or illegible print.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                <Database size={17} /> Database & Storage Layer (SQLite + Drizzle)
              </div>
              <p className="text-xs text-muted-foreground leading-5">
                • <strong>Zero-Setup Embedded Database:</strong> Runs on <code className="text-[11px] bg-muted px-1 py-0.5 rounded">better-sqlite3</code> at <code className="text-[11px] bg-muted px-1 py-0.5 rounded">.data/parakh.db</code>.
                <br />• <strong>Repeat Offender Grouping:</strong> Aggregates historical inspections by product name and barcode to detect recurring non-compliance across inspection dates.
                <br />• <strong>Offline Queue Resilience:</strong> Stores unsubmitted field captures locally so officers never lose evidence in low-connectivity rural warehouses.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                <Shield size={17} /> Cryptographic Chain of Custody (SHA-256)
              </div>
              <p className="text-xs text-muted-foreground leading-5">
                • <strong>Evidence Hash:</strong> Generates a canonical SHA-256 fingerprint over reference, commodity name, barcode, OCR transcript, word coordinates, compliance verdicts, and UTC timestamp.
                <br />• <strong>Courtroom Admissibility:</strong> Stamped permanently on all generated PDF compliance reports and verifiable against the database register.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Deployment Framework */}
      {activeTab === 'deployment' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold tracking-tight">Deployment Framework & Operating Environments</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Deployment protocols for local hackathon workstations, field mobile devices, and high-availability government cloud instances.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="size-2 rounded-full bg-secondary" /> Local & Field HTTPS Mode
              </h3>
              <p className="text-xs text-muted-foreground leading-6">
                Mobile browsers strictly require HTTPS (or localhost) to grant camera access to <code className="text-[11px] bg-muted px-1 py-0.5 rounded">getUserMedia</code>. PARAKH includes an automated HTTPS runner:
              </p>
              <div className="rounded-xl bg-muted/60 p-3 font-mono text-xs text-foreground/80 space-y-1">
                <p><span className="text-secondary">$</span> pnpm dev</p>
                <p className="text-muted-foreground text-[11px]"># Development mode with live reload (proxies /api to Express)</p>
                <p className="mt-2"><span className="text-secondary">$</span> pnpm dev:https</p>
                <p className="text-muted-foreground text-[11px]"># Generates self-signed certificate on LAN IP for phone camera barcode scanning</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" /> Production Single-Server Build
              </h3>
              <p className="text-xs text-muted-foreground leading-6">
                Builds and hosts both the Express API and the optimized React SPA from a single high-performance Node.js process:
              </p>
              <div className="rounded-xl bg-muted/60 p-3 font-mono text-xs text-foreground/80 space-y-1">
                <p><span className="text-secondary">$</span> pnpm run build</p>
                <p><span className="text-secondary">$</span> pnpm start</p>
                <p className="text-muted-foreground text-[11px]"># Server listens on port 5000 with SPA fallback and API routes</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <span className="size-2 rounded-full bg-accent" /> Container & Air-Gapped Warehouse Deployment
              </h3>
              <p className="text-xs text-muted-foreground leading-6">
                Can be packaged into standard Docker containers (<code className="text-[11px] bg-muted px-1 py-0.5 rounded">node:24-alpine</code>) and deployed across state district headquarters without requiring internet access once the English traineddata model is bundled locally.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Officer Inspection SOP */}
      {activeTab === 'sop' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold tracking-tight">Field Enforcement Officer Standard Operating Procedure (SOP)</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Statutory guidance under Rules 19 to 21 of the Legal Metrology (Packaged Commodities) Rules, 2011.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-secondary">STEP 01</span>
              <h3 className="text-sm font-semibold">Photograph & Scan</h3>
              <p className="text-xs text-muted-foreground leading-5">
                Capture the entire Principal Display Panel (PDP) and scan the barcode. Ensure framing covers all 4 edges to prevent false placement clipping alerts.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-secondary">STEP 02</span>
              <h3 className="text-sm font-semibold">Automated Audit</h3>
              <p className="text-xs text-muted-foreground leading-5">
                PARAKH runs client-side OCR and checks mandatory Rule 6 declarations (MRP, USP, Net Qty, Dates, Consumer Care, Packer address, Origin).
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-secondary">STEP 03</span>
              <h3 className="text-sm font-semibold">Verify & Review</h3>
              <p className="text-xs text-muted-foreground leading-5">
                Officer inspects any items marked &ldquo;REVIEW&rdquo; against the physical packaging. If a declaration is missing, flag as &ldquo;FAILED&rdquo;.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-secondary">STEP 04</span>
              <h3 className="text-sm font-semibold">Seize or Compound</h3>
              <p className="text-xs text-muted-foreground leading-5">
                Export the signed court-admissible PDF report or CSV worksheet. Issue a Seizure Memo (Rules 19–21) or process compounding under Rule 32A.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
