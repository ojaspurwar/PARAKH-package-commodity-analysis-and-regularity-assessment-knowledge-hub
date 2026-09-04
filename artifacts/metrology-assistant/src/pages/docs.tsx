import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronRight, Code2, Database, FileCheck, Gavel, Layers, Scale, Shield, Terminal } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export default function DocsPage() {
  const { language } = useI18n();
  const [activeTab, setActiveTab] = useState<'rules' | 'architecture' | 'deployment' | 'sop'>('rules');
  const [expandedChapter, setExpandedChapter] = useState<number | null>(2);

  const toggleChapter = (ch: number) => {
    setExpandedChapter(expandedChapter === ch ? null : ch);
  };

  return (
    <div className="portal-container py-6 space-y-6">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'वैधानिक दस्तावेज एवं विधिक मापविज्ञान संहिताकरण' : 'Statutory Documents & Legal Metrology Codification'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              {language === 'hi' ? 'विधिक मापविज्ञान नियम एवं तकनीकी रूपरेखा' : 'Legal Metrology Rules & Technical Framework'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {language === 'hi'
                ? 'पैकेज्ड कमोडिटीज नियम, 2011 (अध्याय I - VII), प्रणाली वास्तुकला एवं प्रवर्तन मानक संचालन प्रक्रिया (SOP)।'
                : 'Packaged Commodities Rules, 2011 (Chapters I – VII), system architecture, and standard operating procedures.'}
            </p>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)]">
            Chapters I – VII (Rules 1–34)
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border)] pb-3" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'rules'}
            onClick={() => setActiveTab('rules')}
            className={`inline-flex items-center gap-2 rounded-[var(--r-sm)] px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'rules'
                ? 'bg-[var(--indigo-600)] text-white'
                : 'border border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-[var(--bg-sunken)]'
            }`}
          >
            <Scale size={14} /> {language === 'hi' ? 'विधिक मापविज्ञान नियम (2011)' : 'Legal Metrology Rules (2011)'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'architecture'}
            onClick={() => setActiveTab('architecture')}
            className={`inline-flex items-center gap-2 rounded-[var(--r-sm)] px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'architecture'
                ? 'bg-[var(--indigo-600)] text-white'
                : 'border border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-[var(--bg-sunken)]'
            }`}
          >
            <Layers size={14} /> {language === 'hi' ? 'सॉफ्टवेयर आर्किटेक्चर' : 'Software Architecture'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'deployment'}
            onClick={() => setActiveTab('deployment')}
            className={`inline-flex items-center gap-2 rounded-[var(--r-sm)] px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'deployment'
                ? 'bg-[var(--indigo-600)] text-white'
                : 'border border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-[var(--bg-sunken)]'
            }`}
          >
            <Terminal size={14} /> {language === 'hi' ? 'परिनियोजन ढांचा' : 'Deployment Framework'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'sop'}
            onClick={() => setActiveTab('sop')}
            className={`inline-flex items-center gap-2 rounded-[var(--r-sm)] px-4 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'sop'
                ? 'bg-[var(--indigo-600)] text-white'
                : 'border border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-[var(--bg-sunken)]'
            }`}
          >
            <FileCheck size={14} /> {language === 'hi' ? 'अधिकारी निरीक्षण एसओपी (SOP)' : 'Officer Inspection SOP'}
          </button>
        </div>

        {/* Tab 1: Legal Metrology Rules (Chapters I - VII) */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div className="portal-banner portal-banner--pink flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="portal-icon-well portal-icon-well--pink size-9 shrink-0">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">Legal Metrology (Packaged Commodities) Rules, 2011</h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Enacted under the Legal Metrology Act, 2009 (Came into force April 1, 2011). Select a chapter below for statutory provisions and rule enforcement specifications.
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs px-2 py-0.5 rounded-[var(--r-sm)] bg-white/70 border border-[#C462AD] text-[#80376C] hidden sm:inline">
                G.S.R. 202(E)
              </span>
            </div>

            <div className="space-y-3">
              {/* Chapter I */}
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
                <button
                  type="button"
                  onClick={() => toggleChapter(1)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-[var(--indigo-050)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-[var(--r-sm)] bg-[var(--indigo-100)] font-mono text-xs font-semibold text-[var(--indigo-600)]">I</span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">Chapter I: Preliminary (Rules 1 & 2)</h3>
                      <p className="text-xs text-[var(--text-muted)]">Short title, commencement & statutory definitions</p>
                    </div>
                  </div>
                  {expandedChapter === 1 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                </button>
                {expandedChapter === 1 && (
                  <div className="portal-prose--statute border-t border-[var(--border)] bg-[var(--bg-sunken)] p-5 text-sm text-[var(--text)] space-y-3">
                    <p><strong>Rule 1 (Title & Date):</strong> Legal Metrology (Packaged Commodities) Rules, 2011. Came into force April 1, 2011, superseding the Standards of Weights and Measures (Packaged Commodities) Rules, 1977.</p>
                    <p><strong>Rule 2(l) Pre-packaged Commodity:</strong> Commodity which without the purchaser being present is placed in a package of whatever nature, so that the quantity of product contained therein has a predetermined value and that cannot be altered without the package being opened or undergoing a perceptible modification.</p>
                    <p><strong>Rule 2(k) Retail Package:</strong> The packages which are produced, distributed, displayed, delivered, or offered for sale, for consumption by an individual or a group of individuals.</p>
                    <p><strong>Rule 2(m) Retail Sale Price (MRP):</strong> The maximum price at which the commodity in packaged form may be sold to the consumer, inclusive of all taxes.</p>
                    <p><strong>Rule 2(bb) & 2(bc) Industrial & Institutional Consumers:</strong> Consumers who buy packaged commodities directly from the manufacturer or packer for use by that industry or institution, exempt from retail declaration requirements under Rule 3.</p>
                  </div>
                )}
              </div>

              {/* Chapter II */}
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
                <button
                  type="button"
                  onClick={() => toggleChapter(2)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-[var(--indigo-050)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-[var(--r-sm)] bg-[var(--indigo-100)] font-mono text-xs font-semibold text-[var(--indigo-600)]">II</span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">Chapter II: Provisions Applicable to Retail Packages (Rules 3 – 23)</h3>
                      <p className="text-xs text-[var(--text-muted)]">Mandatory Rule 6 declarations, Rule 7 PDP font sizing, net quantity, MRP & USP</p>
                    </div>
                  </div>
                  {expandedChapter === 2 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                </button>
                {expandedChapter === 2 && (
                  <div className="portal-prose--statute border-t border-[var(--border)] bg-[var(--bg-sunken)] p-5 text-sm text-[var(--text)] space-y-4">
                    <div>
                      <h4 className="font-semibold text-[var(--indigo-600)]">Rule 6: Mandatory Declarations on Every Retail Package</h4>
                      <ul className="mt-2 list-disc pl-5 space-y-1">
                        <li><strong>Identity:</strong> Common or generic name of the commodity [Rule 6(1)(a)].</li>
                        <li><strong>Manufacturer / Packer / Importer:</strong> Complete physical name and address with postal PIN code [Rule 6(1)(b) & Rule 10].</li>
                        <li><strong>Country of Origin:</strong> Mandatory declaration of country of origin or manufacture on all imported commodities [Rule 6(1)(a) & Rule 6(10)].</li>
                        <li><strong>Net Quantity:</strong> Standard metric unit declaration excluding tare weight (g, kg, ml, l, pcs) [Rule 6(1)(c) & Rules 11–13].</li>
                        <li><strong>Date Marking:</strong> Month and year of manufacture, packing, or import [Rule 6(1)(d)].</li>
                        <li><strong>Retail Sale Price (MRP):</strong> &ldquo;Maximum Retail Price ₹ / Rs. ...... inclusive of all taxes&rdquo; [Rule 6(1)(e) & Rule 2(m)].</li>
                        <li><strong>Unit Sale Price (USP):</strong> Price per gram, per milliliter, per kilogram, per litre, or per item where packages contain more than one unit [Rule 6(1)(f)].</li>
                        <li><strong>Consumer Care:</strong> Name, address, telephone/toll-free number, and email ID for consumer complaints [Rule 6(1)(g)].</li>
                        <li><strong>E-Commerce Listings:</strong> Digital marketplaces must display all mandatory declarations on digital listings prior to sale [Rule 6(10)].</li>
                      </ul>
                    </div>

                    <div className="border-t border-[var(--border)] pt-3">
                      <h4 className="font-semibold text-[var(--indigo-600)]">Rule 7: Principal Display Panel (PDP) & Font Sizing</h4>
                      <p className="mt-1">
                        Mandates minimum numeral and letter heights under Schedule I based on package net quantity band:
                      </p>
                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-[var(--r-sm)] bg-white border border-[var(--border)] p-3 font-mono text-xs">
                        <div><strong className="font-sans">Net Qty ≤ 200 g / ml:</strong><br />Numerals: 2.0 mm<br />Letters: 1.0 mm</div>
                        <div><strong className="font-sans">200 g – 500 g / ml:</strong><br />Numerals: 4.0 mm<br />Letters: 2.0 mm</div>
                        <div><strong className="font-sans">Above 500 g / ml:</strong><br />Numerals: 6.0 mm<br />Letters: 4.0 mm</div>
                      </div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-3">
                      <h4 className="font-semibold text-[var(--indigo-600)]">Rules 11 – 13: Standard Metric Units & Tare Weight</h4>
                      <p className="mt-1">
                        Rule 13 strictly enforces standard SI symbols (g, kg, ml, l, m, cm). Pluralisations (&ldquo;gms&rdquo;, &ldquo;kgs&rdquo;) and informal non-metric notations constitute violations. Drained weight must be declared for commodities packed in liquid media.
                      </p>
                    </div>

                    <div className="border-t border-[var(--border)] pt-3">
                      <h4 className="font-semibold text-[var(--indigo-600)]">Rules 18 – 23: Enforcement, Seizures & Deceptive Packaging</h4>
                      <p className="mt-1">
                        <strong>Rule 18:</strong> Prohibits selling above MRP and dual MRP across distribution channels.
                        <br /><strong>Rule 19–21:</strong> Authorizes Metrology Officers to inspect retail premises, draw statistical lots, and issue seizure memos.
                        <br /><strong>Rule 22:</strong> Specifies Maximum Permissible Error (MPE) tolerances for filling variance.
                        <br /><strong>Rule 23:</strong> Prohibits deceptive packages designed with slack fill or false bottoms to exaggerate apparent volume.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chapter III & IV */}
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
                <button
                  type="button"
                  onClick={() => toggleChapter(3)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-[var(--indigo-050)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-[var(--r-sm)] bg-[var(--indigo-100)] font-mono text-xs font-semibold text-[var(--indigo-600)]">III</span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">Chapters III & IV: Wholesale & Export/Import (Rules 24 & 25)</h3>
                      <p className="text-xs text-[var(--text-muted)]">Master cartons and domestic resale restrictions on export stock</p>
                    </div>
                  </div>
                  {expandedChapter === 3 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                </button>
                {expandedChapter === 3 && (
                  <div className="portal-prose--statute border-t border-[var(--border)] bg-[var(--bg-sunken)] p-5 text-sm text-[var(--text)] space-y-2">
                    <p><strong>Rule 24 (Wholesale Packages):</strong> Master shipping cartons must declare manufacturer identity, commodity generic name, and total bulk net quantity or count of retail units inside.</p>
                    <p><strong>Rule 25 (Export Packages):</strong> Packages labeled specifically for foreign export cannot be diverted into Indian domestic commerce without supplementary labels ensuring domestic Legal Metrology and MRP compliance.</p>
                  </div>
                )}
              </div>

              {/* Chapter V */}
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
                <button
                  type="button"
                  onClick={() => toggleChapter(5)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-[var(--indigo-050)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-[var(--r-sm)] bg-[var(--indigo-100)] font-mono text-xs font-semibold text-[var(--indigo-600)]">V</span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">Chapter V: Exemptions (Rule 26)</h3>
                      <p className="text-xs text-[var(--text-muted)]">Packages containing 10 g / 10 ml or less, fast food, and DPCO medical devices</p>
                    </div>
                  </div>
                  {expandedChapter === 5 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                </button>
                {expandedChapter === 5 && (
                  <div className="portal-prose--statute border-t border-[var(--border)] bg-[var(--bg-sunken)] p-5 text-sm text-[var(--text)] space-y-2">
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
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
                <button
                  type="button"
                  onClick={() => toggleChapter(6)}
                  className="flex w-full items-center justify-between p-4 text-left font-medium hover:bg-[var(--indigo-050)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-7 place-items-center rounded-[var(--r-sm)] bg-[var(--indigo-100)] font-mono text-xs font-semibold text-[var(--indigo-600)]">VI</span>
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text)]">Chapters VI & VII: Registration, Penalties & Compounding (Rules 27 – 34)</h3>
                      <p className="text-xs text-[var(--text-muted)]">LMPC registration, Section 36 penalties, and Rule 32A settlement procedures</p>
                    </div>
                  </div>
                  {expandedChapter === 6 ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                </button>
                {expandedChapter === 6 && (
                  <div className="portal-prose--statute border-t border-[var(--border)] bg-[var(--bg-sunken)] p-5 text-sm text-[var(--text)] space-y-3">
                    <p><strong>Rule 27 (LMPC Certificate):</strong> Every manufacturer, packer, or importer must register with the Director or Controller within 90 days of commencing packaging operations.</p>
                    <p><strong>Rule 32 (Penalties):</strong> Non-compliance attracts monetary fines and prosecution under Section 36 and Section 49 (director liability) of the Legal Metrology Act, 2009.</p>
                    <p><strong>Rule 32A (Compounding of Offences):</strong> First-time non-compliance can be compounded (settled administratively) upon payment of compounding fees prescribed by the Controller.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Software Architecture */}
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5">
              <h2 className="text-base font-semibold text-[var(--text)]">System Architecture & Data Flow</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                PARAKH is engineered as a secure, distributed field compliance assistant operating under edge-first computing principles.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="portal-card portal-card--cyan">
                <div className="portal-icon-well portal-icon-well--cyan">
                  <Code2 size={24} />
                </div>
                <h3 className="portal-card-title">Frontend edge layer (React 19 + Vite)</h3>
                <p className="portal-card-desc">
                  Runs client-side OCR via Tesseract.js Web Worker and native BarcodeDetector directly on the officer&apos;s device without transmitting raw multi-megabyte captures.
                </p>
              </div>

              <div className="portal-card portal-card--green">
                <div className="portal-icon-well portal-icon-well--green">
                  <Gavel size={24} />
                </div>
                <h3 className="portal-card-title">Legal Metrology rule engine (Express 5)</h3>
                <p className="portal-card-desc">
                  Evaluates declarations against Rules 6, 7, 10, 11-13, and Schedule I font heights with physical millimeter conversion and readability analysis.
                </p>
              </div>

              <div className="portal-card portal-card--violet">
                <div className="portal-icon-well portal-icon-well--violet">
                  <Database size={24} />
                </div>
                <h3 className="portal-card-title">Database & storage layer (SQLite + Drizzle)</h3>
                <p className="portal-card-desc">
                  Embedded Better-SQLite3 engine tracking repeat offenders by barcode and product name, with offline sync queue for zero-connectivity field sites.
                </p>
              </div>

              <div className="portal-card portal-card--rose">
                <div className="portal-icon-well portal-icon-well--rose">
                  <Shield size={24} />
                </div>
                <h3 className="portal-card-title">Cryptographic chain of custody (SHA-256)</h3>
                <p className="portal-card-desc">
                  Generates an immutable cryptographic hash over commodity details, word coordinates, verdicts, and timestamp for courtroom-admissible evidence sheets.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Deployment Framework */}
        {activeTab === 'deployment' && (
          <div className="space-y-4">
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5">
              <h2 className="text-base font-semibold text-[var(--text)]">Deployment Framework & Operating Environments</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Deployment protocols for local hackathon workstations, field mobile devices, and high-availability government cloud instances.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--text)]">
                  <span className="size-2 rounded-full bg-[var(--green-border)]" /> Local & Field HTTPS Mode
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Mobile browsers strictly require HTTPS (or localhost) to grant camera access to <code className="text-xs font-mono bg-[var(--bg-sunken)] px-1.5 py-0.5 rounded border border-[var(--border)]">getUserMedia</code>. PARAKH includes an automated HTTPS runner:
                </p>
                <div className="rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)] p-3 font-mono text-xs text-[var(--text)] space-y-1">
                  <p><span className="text-[var(--green-action)]">$</span> pnpm dev</p>
                  <p className="text-[var(--text-muted)] text-xs"># Development mode with live reload (proxies /api to Express)</p>
                  <p className="mt-2"><span className="text-[var(--green-action)]">$</span> pnpm dev:https</p>
                  <p className="text-[var(--text-muted)] text-xs"># Generates self-signed certificate on LAN IP for phone camera barcode scanning</p>
                </div>
              </div>

              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--text)]">
                  <span className="size-2 rounded-full bg-[var(--indigo-600)]" /> Production Single-Server Build
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Builds and hosts both the Express API and the optimized React SPA from a single high-performance Node.js process:
                </p>
                <div className="rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)] p-3 font-mono text-xs text-[var(--text)] space-y-1">
                  <p><span className="text-[var(--indigo-600)]">$</span> pnpm run build</p>
                  <p><span className="text-[var(--indigo-600)]">$</span> pnpm start</p>
                  <p className="text-[var(--text-muted)] text-xs"># Server listens on port 5000 with SPA fallback and API routes</p>
                </div>
              </div>

              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--text)]">
                  <span className="size-2 rounded-full bg-[var(--amber-border)]" /> Container & Air-Gapped Warehouse Deployment
                </h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Can be packaged into standard Docker containers (<code className="text-xs font-mono bg-[var(--bg-sunken)] px-1.5 py-0.5 rounded border border-[var(--border)]">node:24-alpine</code>) and deployed across state district headquarters without requiring internet access once the English traineddata model is bundled locally.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Officer Inspection SOP */}
        {activeTab === 'sop' && (
          <div className="space-y-4">
            <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5">
              <h2 className="text-base font-semibold text-[var(--text)]">Field Enforcement Officer Standard Operating Procedure (SOP)</h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Statutory guidance under Rules 19 to 21 of the Legal Metrology (Packaged Commodities) Rules, 2011.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-4 space-y-2">
                <span className="text-xs font-semibold text-[var(--indigo-600)]">Step 1</span>
                <h3 className="text-sm font-semibold text-[var(--text)]">Photograph & scan</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Capture the entire Principal Display Panel (PDP) and scan the barcode. Ensure framing covers all four edges to prevent false placement alerts.
                </p>
              </div>

              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-4 space-y-2">
                <span className="text-xs font-semibold text-[var(--indigo-600)]">Step 2</span>
                <h3 className="text-sm font-semibold text-[var(--text)]">Automated audit</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  PARAKH runs client-side OCR and checks mandatory Rule 6 declarations (MRP, USP, Net Qty, Dates, Consumer Care, Packer address, Origin).
                </p>
              </div>

              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-4 space-y-2">
                <span className="text-xs font-semibold text-[var(--indigo-600)]">Step 3</span>
                <h3 className="text-sm font-semibold text-[var(--text)]">Verify & review</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Officer inspects any items marked &ldquo;Needs review&rdquo; against the physical packaging. If a declaration is missing, flag as &ldquo;Violation&rdquo;.
                </p>
              </div>

              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-4 space-y-2">
                <span className="text-xs font-semibold text-[var(--indigo-600)]">Step 4</span>
                <h3 className="text-sm font-semibold text-[var(--text)]">Seize or compound</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Export the signed court-admissible evidence sheet. Issue a Seizure Memo under Rules 19–21 or process compounding under Rule 32A.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
