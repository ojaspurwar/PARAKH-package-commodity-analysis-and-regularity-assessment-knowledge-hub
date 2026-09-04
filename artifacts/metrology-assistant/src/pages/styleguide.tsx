import { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  CircleDot,
  Download,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Info,
  Scale,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react';
import { Link } from 'wouter';

export default function StyleguidePage() {
  const [inputValue, setInputValue] = useState('LM-861635');
  const [selectValue, setSelectValue] = useState('packaged_food');

  return (
    <div className="space-y-12 pb-24" style={{ fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
      {/* Page Header */}
      <div className="border-b border-[var(--border)] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-[var(--r-sm)]"
              style={{ background: 'var(--indigo-100)', color: 'var(--indigo-700)' }}
            >
              AGENTS.md Design System
            </span>
            <h1 className="mt-2 font-semibold" style={{ fontSize: 'var(--fs-h1)', letterSpacing: 'var(--ls-heading)', lineHeight: 'var(--lh-heading)' }}>
              PARAKH Design System & Token Styleguide
            </h1>
            <p className="mt-2 max-w-3xl text-[var(--text-muted)]" style={{ fontSize: 'var(--fs-body)' }}>
              Living component inventory and token verification page sampled from voters.eci.gov.in (ECINET Citizen Service Portal). High information density, indigo slab headers, pastel category cards with saturated borders, and zero hero sections.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-[var(--r-sm)] border border-[var(--border)] bg-white hover:bg-[var(--indigo-050)] transition-colors"
          >
            Return to App <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* SECTION 1: Type Scale & Font Families */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            1. Typography & Font Stacks (§4)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Noto Sans (all UI/prose), Noto Sans Devanagari (Hindi), and IBM Plex Mono (codes, quantities, prices, timestamps only).
          </p>
        </div>

        <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-1">--fs-slab: 20px / 1.3 / weight 600 (Slab Header Text)</p>
                <div className="bg-[var(--indigo-600)] text-white px-4 py-2.5 rounded-[var(--r-sm)] font-semibold text-[20px] leading-[1.3]">
                  वैध मापविज्ञान प्रवर्तन पोर्टल / Legal Metrology Enforcement Portal
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-1">--fs-h1: 26px / 1.25 / weight 600 (Page Title)</p>
                <div className="font-semibold text-[26px] leading-[1.25] tracking-[-0.008em]">
                  Inspection Register & Statutory Evidence Records
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-1">--fs-h2: 20px / 1.3 / weight 600 (Section Heading)</p>
                <div className="font-semibold text-[20px] leading-[1.3] tracking-[-0.008em]">
                  Legal Metrology (Packaged Commodities) Rules, 2011
                </div>
              </div>

              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-1">--fs-h3: 16px / 1.4 / weight 600 (Card Title)</p>
                <div className="font-semibold text-[16px] leading-[1.4] tracking-[-0.008em]">
                  Mandatory Declaration Verification under Rule 6
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-1">--fs-body: 15px / 1.6 / weight 400 (Default Body Prose)</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text)] max-w-[68ch]">
                  Every package shall bear thereon the name and address of the manufacturer, packer or importer, the common or generic names of the commodity, net quantity in standard metric units, and maximum retail price inclusive of all taxes.
                </p>
              </div>

              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-1">--font-hi: Noto Sans Devanagari (Full Hindi Support)</p>
                <p className="text-[15px] leading-[1.6] text-[var(--text)] font-medium" style={{ fontFamily: 'var(--font-hi)' }}>
                  प्रत्येक डिब्बाबंद वस्तु पर निर्माता का नाम, पूरा पता, वस्तु का सामान्य नाम, शुद्ध मात्रा और सभी करों सहित अधिकतम खुदरा मूल्य अंकित होना अनिवार्य है।
                </p>
              </div>

              <div>
                <p className="text-xs font-mono text-[var(--text-muted)] mb-1">--font-mono: IBM Plex Mono (IDs, Quantities, Prices, Timestamps Only)</p>
                <div className="p-3 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)] font-mono text-[14px] leading-relaxed space-y-1">
                  <div className="flex justify-between"><span>Record ID:</span> <span className="font-semibold">LM-861635</span></div>
                  <div className="flex justify-between"><span>Declared Net Quantity:</span> <span className="font-semibold">500 g</span></div>
                  <div className="flex justify-between"><span>Maximum Retail Price:</span> <span className="font-semibold">₹ 249.00</span></div>
                  <div className="flex justify-between"><span>Rule 7 Font Height:</span> <span className="font-semibold">4.2 mm (min req: 4.0 mm)</span></div>
                  <div className="flex justify-between"><span>Timestamp (UTC):</span> <span className="font-semibold">2026-09-04T13:45:00Z</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: The Six Category Triplets */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            2. The Six Category Triplets (§5)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Every card and badge draws strictly from these six triplets: {'{'}tint, 1.5px border, action{'}'}. No decoration, no random colours.
          </p>
        </div>

        {/* Category Cards Grid (Two-up on desktop) */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Card 1: Rose (Violation / Urgent) */}
          <div
            className="rounded-[var(--r-md)] p-5 transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--rose-t)', border: '1.5px solid var(--rose-br)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ border: '1.5px solid var(--rose-br)' }}
              >
                <ShieldAlert size={26} style={{ color: 'var(--rose-ac)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-semibold tracking-wide" style={{ background: 'var(--rose-ac)', color: '#ffffff' }}>
                  Rose · Violation & Urgent
                </span>
                <h3 className="mt-1 font-semibold text-[16px] leading-[1.4]">Statutory Non-Compliance Notice</h3>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--text-muted)]">
                  Critical violation under Rule 6(1)(e): Mandatory Maximum Retail Price declaration missing from package.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                    style={{ backgroundColor: 'var(--rose-ac)' }}
                  >
                    Issue Notice <ArrowUpRight size={14} />
                  </button>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    <Download size={14} /> Download Memo
                  </a>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    Guidelines <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Green (Compliant / Verified) */}
          <div
            className="rounded-[var(--r-md)] p-5 transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--green-t)', border: '1.5px solid var(--green-br)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ border: '1.5px solid var(--green-br)' }}
              >
                <ShieldCheck size={26} style={{ color: 'var(--green-ac)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-semibold tracking-wide" style={{ background: 'var(--green-ac)', color: '#ffffff' }}>
                  Green · Compliant & Verified
                </span>
                <h3 className="mt-1 font-semibold text-[16px] leading-[1.4]">Rule 6 Mandatory Declarations Passed</h3>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--text-muted)]">
                  All eight mandatory package declarations verified: MRP, Unit Sale Price, net quantity, mfg date, and consumer care.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                    style={{ backgroundColor: 'var(--green-ac)' }}
                  >
                    Record Finding <ArrowUpRight size={14} />
                  </button>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    <Download size={14} /> Certificate
                  </a>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    Audit History <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Amber (Needs Review / Pending) */}
          <div
            className="rounded-[var(--r-md)] p-5 transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--amber-t)', border: '1.5px solid var(--amber-br)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ border: '1.5px solid var(--amber-br)' }}
              >
                <AlertTriangle size={26} style={{ color: 'var(--amber-ac)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-semibold tracking-wide" style={{ background: 'var(--amber-ac)', color: '#ffffff' }}>
                  Amber · Needs Review & Pending
                </span>
                <h3 className="mt-1 font-semibold text-[16px] leading-[1.4]">Faint Inkjet Stamp Verification</h3>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--text-muted)]">
                  Date marking requires manual scale confirmation. Dot-matrix characters detected near crimp seal.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                    style={{ backgroundColor: 'var(--amber-ac)' }}
                  >
                    Review Package <ArrowUpRight size={14} />
                  </button>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    <Download size={14} /> Inspection Sheet
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Cyan (Field Capture / Live Tools) */}
          <div
            className="rounded-[var(--r-md)] p-5 transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--cyan-t)', border: '1.5px solid var(--cyan-br)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ border: '1.5px solid var(--cyan-br)' }}
              >
                <Zap size={26} style={{ color: 'var(--cyan-ac)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-semibold tracking-wide" style={{ background: 'var(--cyan-ac)', color: '#ffffff' }}>
                  Cyan · Field Capture & Live Tools
                </span>
                <h3 className="mt-1 font-semibold text-[16px] leading-[1.4]">Multi-Panel Live Camera Scan</h3>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--text-muted)]">
                  Capture front, rear and side panels in continuous sequence with hardware contrast enhancement and unsharp masking.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                    style={{ backgroundColor: 'var(--cyan-ac)' }}
                  >
                    Start Capture <ArrowUpRight size={14} />
                  </button>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    Camera Guide <ArrowUpRight size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: Violet (Repository / Records / Exports) */}
          <div
            className="rounded-[var(--r-md)] p-5 transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--violet-t)', border: '1.5px solid var(--violet-br)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ border: '1.5px solid var(--violet-br)' }}
              >
                <FolderOpen size={26} style={{ color: 'var(--violet-ac)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-semibold tracking-wide" style={{ background: 'var(--violet-ac)', color: '#ffffff' }}>
                  Violet · Repository & Exports
                </span>
                <h3 className="mt-1 font-semibold text-[16px] leading-[1.4]">Enforcement Records Archive</h3>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--text-muted)]">
                  Searchable register of every audited commodity, evidence photograph, SHA-256 hash and supervisor determination.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                    style={{ backgroundColor: 'var(--violet-ac)' }}
                  >
                    Open Archive <ArrowUpRight size={14} />
                  </button>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    <Download size={14} /> Export CSV
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Pink (Statutory Reference / Rules) */}
          <div
            className="rounded-[var(--r-md)] p-5 transition-transform duration-150 hover:-translate-y-0.5"
            style={{ backgroundColor: 'var(--pink-t)', border: '1.5px solid var(--pink-br)' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ border: '1.5px solid var(--pink-br)' }}
              >
                <BookOpen size={26} style={{ color: 'var(--pink-ac)' }} />
              </div>
              <div className="min-w-0 flex-1">
                <span className="inline-block px-2 py-0.5 rounded-[var(--r-sm)] text-[11px] font-semibold tracking-wide" style={{ background: 'var(--pink-ac)', color: '#ffffff' }}>
                  Pink · Statutory Reference
                </span>
                <h3 className="mt-1 font-semibold text-[16px] leading-[1.4]">Legal Metrology Rules, 2011</h3>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--text-muted)]">
                  Statutory gazette text covering Rule 6 declarations, Rule 7 principal display panels, and Schedule II font sizing.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                    style={{ backgroundColor: 'var(--pink-ac)' }}
                  >
                    Read Rules <ArrowUpRight size={14} />
                  </button>
                  <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--link)] hover:text-[var(--link-hover)]">
                    <Download size={14} /> Gazette PDF
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Slab Header on Panel (§7) */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            3. Slab Header Flush on Panel (§7)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            54px height, --indigo-600 background, 14px top corners only, white text at --fs-slab (20px / 1.3 / 600 weight). Sits flush atop a white panel with 0 0 14px 14px radius and --sh-1.
          </p>
        </div>

        <div>
          {/* Slab Header */}
          <div
            className="w-full flex items-center px-6 font-semibold text-white"
            style={{
              height: '54px',
              backgroundColor: 'var(--indigo-600)',
              borderRadius: '14px 14px 0 0',
              fontSize: 'var(--fs-slab)',
            }}
          >
            Field Scanner & Physical Label Assessment
          </div>

          {/* Panel flush below */}
          <div
            className="bg-white p-5 space-y-4 border border-t-0 border-[var(--border)]"
            style={{
              borderRadius: '0 0 14px 14px',
              boxShadow: 'var(--sh-1)',
            }}
          >
            <p className="text-[15px] leading-[1.6] text-[var(--text-muted)]">
              This panel demonstrates the structural container layout. Each page opens with exactly one slab header naming that page's function. No marketing heroes exist above or beside it.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--r-sm)] text-white text-sm font-medium transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--indigo-600)' }}
              >
                Scan Package <ArrowUpRight size={14} />
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 h-9 px-4 rounded-[var(--r-sm)] border border-[var(--border)] text-sm font-medium hover:bg-[var(--bg-sunken)] transition-colors"
              >
                Manual Entry
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Priority Block (§7) */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            4. Priority Block (§7)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Used for the highest-urgency item on a page. Category tint, 1.5px category border, 20px padding, 56px circular icon well at top left, title at --fs-h3, then up to three stacked 46px primary actions.
          </p>
        </div>

        <div
          className="rounded-[var(--r-md)] p-5"
          style={{ backgroundColor: 'var(--rose-t)', border: '1.5px solid var(--rose-br)' }}
        >
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <div className="flex items-start gap-4 flex-1">
              <div
                className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm"
                style={{ border: '1.5px solid var(--rose-br)' }}
              >
                <ShieldAlert size={28} style={{ color: 'var(--rose-ac)' }} />
              </div>
              <div>
                <h3 className="font-semibold text-[18px] leading-[1.3]">
                  Immediate Enforcement Action Required — Expired Stock Detected
                </h3>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--text-muted)] max-w-2xl">
                  Package commodity has an expired date marking (December 2020). Sale of expired consumer goods constitutes an offence under Section 36 of the Legal Metrology Act, 2009.
                </p>
              </div>
            </div>

            {/* Stacked Primary Actions (46px tall, full-width within their column, 8px gap) */}
            <div className="w-full md:w-80 space-y-2 shrink-0">
              <button
                type="button"
                className="w-full h-[46px] rounded-[var(--r-sm)] font-semibold text-white text-sm flex items-center justify-center transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--green-ac)' }}
              >
                Issue Formal Seizure Notice
              </button>
              <button
                type="button"
                className="w-full h-[46px] rounded-[var(--r-sm)] font-semibold text-white text-sm flex items-center justify-center transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--cyan-ac)' }}
              >
                Export Tamper-Proof Evidence Sheet
              </button>
              <button
                type="button"
                className="w-full h-[46px] rounded-[var(--r-sm)] font-semibold text-white text-sm flex items-center justify-center transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--indigo-600)' }}
              >
                Escalate to District Controller
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Wide Banner (§7) */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            5. Wide Banner (§7)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Full width of panel, category tint, 1.5px category border, 56px tall, icon on left, single-line label, action on right, pinned 'New' badge top right.
          </p>
        </div>

        <div
          className="relative h-14 rounded-[var(--r-md)] px-5 flex items-center justify-between"
          style={{ backgroundColor: 'var(--green-t)', border: '1.5px solid var(--green-br)' }}
        >
          <span
            className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-[var(--r-sm)] text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: 'var(--rose-ac)' }}
          >
            New Amendment
          </span>

          <div className="flex items-center gap-3">
            <Sparkles size={20} style={{ color: 'var(--green-ac)' }} />
            <span className="text-sm font-semibold text-[var(--text)]">
              Legal Metrology (Packaged Commodities) Amendment Rules — Mandatory Unit Sale Price Provisions
            </span>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[var(--r-sm)] text-white transition-transform active:scale-[0.985]"
            style={{ backgroundColor: 'var(--green-ac)' }}
          >
            <Download size={13} /> Download Gazette (PDF, 1.8 MB)
          </a>
        </div>
      </section>

      {/* SECTION 6: Data Table with Category Status Badges (§7) */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            6. Statutory Data Table with Category Badges (§7)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            --bg-panel, --border row rules, --bg-sunken header, 40px row height, no shadow. Identifiers and numbers in mono, right-aligned. Hover fills --indigo-050. Status is always colour + glyph + word.
          </p>
        </div>

        <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
          <table className="w-full text-left border-collapse" style={{ fontSize: 'var(--fs-sm)' }}>
            <thead>
              <tr className="bg-[var(--bg-sunken)] border-b border-[var(--border)] h-10 text-[var(--text-muted)] font-medium text-xs">
                <th className="px-4">Reference Code</th>
                <th className="px-4">Commodity Name</th>
                <th className="px-4">Category</th>
                <th className="px-4 text-right">Net Quantity</th>
                <th className="px-4 text-right">Declared Price</th>
                <th className="px-4 text-center">Statutory Status</th>
                <th className="px-4 text-right">Inspection Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {/* Row 1: Compliant */}
              <tr className="h-10 hover:bg-[var(--indigo-050)] transition-colors">
                <td className="px-4 font-mono text-xs font-semibold">LM-260901</td>
                <td className="px-4 font-medium">Saffola Gold Cooking Oil</td>
                <td className="px-4 text-[var(--text-muted)]">Packaged food</td>
                <td className="px-4 font-mono text-right tabular-nums">500 g</td>
                <td className="px-4 font-mono text-right tabular-nums">₹ 249.00</td>
                <td className="px-4 text-center">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-sm)] text-xs font-semibold"
                    style={{ backgroundColor: 'var(--green-t)', border: '1.5px solid var(--green-br)', color: 'var(--green-ac)' }}
                  >
                    <Check size={12} strokeWidth={3} /> Compliant
                  </span>
                </td>
                <td className="px-4 font-mono text-xs text-right text-[var(--text-muted)] tabular-nums">04 Sep 2026</td>
              </tr>

              {/* Row 2: Violation */}
              <tr className="h-10 hover:bg-[var(--indigo-050)] transition-colors">
                <td className="px-4 font-mono text-xs font-semibold">LM-207634</td>
                <td className="px-4 font-medium">Razer DeathAdder V2 Mouse</td>
                <td className="px-4 text-[var(--text-muted)]">Electrical goods</td>
                <td className="px-4 font-mono text-right tabular-nums">1 U</td>
                <td className="px-4 font-mono text-right tabular-nums">₹ 5,999.00</td>
                <td className="px-4 text-center">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-sm)] text-xs font-semibold"
                    style={{ backgroundColor: 'var(--rose-t)', border: '1.5px solid var(--rose-br)', color: 'var(--rose-ac)' }}
                  >
                    <X size={12} strokeWidth={3} /> Violation
                  </span>
                </td>
                <td className="px-4 font-mono text-xs text-right text-[var(--text-muted)] tabular-nums">04 Sep 2026</td>
              </tr>

              {/* Row 3: Needs Review */}
              <tr className="h-10 hover:bg-[var(--indigo-050)] transition-colors">
                <td className="px-4 font-mono text-xs font-semibold">LM-260899</td>
                <td className="px-4 font-medium">Cotton Comfort Bedsheet</td>
                <td className="px-4 text-[var(--text-muted)]">Textiles & Apparel</td>
                <td className="px-4 font-mono text-right tabular-nums">1 Unit</td>
                <td className="px-4 font-mono text-right tabular-nums">₹ 899.00</td>
                <td className="px-4 text-center">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-sm)] text-xs font-semibold"
                    style={{ backgroundColor: 'var(--amber-t)', border: '1.5px solid var(--amber-br)', color: 'var(--amber-ac)' }}
                  >
                    <CircleDot size={12} strokeWidth={2.5} /> Needs review
                  </span>
                </td>
                <td className="px-4 font-mono text-xs text-right text-[var(--text-muted)] tabular-nums">03 Sep 2026</td>
              </tr>

              {/* Row 4: Compliant */}
              <tr className="h-10 hover:bg-[var(--indigo-050)] transition-colors">
                <td className="px-4 font-mono text-xs font-semibold">LM-884298</td>
                <td className="px-4 font-medium">Tata Tea Premium Leaf</td>
                <td className="px-4 text-[var(--text-muted)]">Packaged food</td>
                <td className="px-4 font-mono text-right tabular-nums">250 g</td>
                <td className="px-4 font-mono text-right tabular-nums">₹ 150.00</td>
                <td className="px-4 text-center">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[var(--r-sm)] text-xs font-semibold"
                    style={{ backgroundColor: 'var(--green-t)', border: '1.5px solid var(--green-br)', color: 'var(--green-ac)' }}
                  >
                    <Check size={12} strokeWidth={3} /> Compliant
                  </span>
                </td>
                <td className="px-4 font-mono text-xs text-right text-[var(--text-muted)] tabular-nums">04 Sep 2026</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 7: Buttons in All States (§8) */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            7. Buttons in Every State (§8)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Institutional indigo buttons and category action buttons. Press motion: scale(0.985) over 90ms. No shadows.
          </p>
        </div>

        <div className="p-6 rounded-[var(--r-md)] border border-[var(--border)] bg-white space-y-6">
          <div>
            <p className="text-xs font-mono text-[var(--text-muted)] mb-2.5">Institutional Primary Button (--indigo-600) — Default, Hover, Pressed, Disabled</p>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                type="button"
                className="h-9 px-4 rounded-[var(--r-sm)] bg-[var(--indigo-600)] text-white text-sm font-medium transition-all hover:bg-[var(--indigo-700)] active:scale-[0.985]"
              >
                Record finding
              </button>

              <button
                type="button"
                className="h-9 px-4 rounded-[var(--r-sm)] bg-[var(--indigo-700)] text-white text-sm font-medium"
              >
                Hover state
              </button>

              <button
                type="button"
                className="h-9 px-4 rounded-[var(--r-sm)] bg-[var(--indigo-700)] text-white text-sm font-medium scale-[0.985]"
              >
                Pressed (scale .985)
              </button>

              <button
                type="button"
                disabled
                className="h-9 px-4 rounded-[var(--r-sm)] bg-[var(--indigo-600)] text-white text-sm font-medium opacity-50 cursor-not-allowed"
              >
                Disabled
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-mono text-[var(--text-muted)] mb-2.5">Category Action Buttons with Trailing Outbound Element</p>
            <div className="flex flex-wrap gap-3 items-center">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--rose-ac)' }}
              >
                Flag for review <ArrowUpRight size={13} />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--green-ac)' }}
              >
                Verify compliance <ArrowUpRight size={13} />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--amber-ac)' }}
              >
                Request clarification <ArrowUpRight size={13} />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--cyan-ac)' }}
              >
                Start camera <ArrowUpRight size={13} />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--violet-ac)' }}
              >
                Export evidence <ArrowUpRight size={13} />
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                style={{ backgroundColor: 'var(--pink-ac)' }}
              >
                Consult rule <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: Form Fields & Focus Rings (§8, §10) */}
      <section className="space-y-4">
        <div className="border-b border-[var(--border)] pb-2">
          <h2 className="font-semibold" style={{ fontSize: 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)' }}>
            8. Form Fields & Focus Rings (§8, §10)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Focus: instant 2px --indigo-600 ring, outline-offset: 2px. Touch target floor: 44px height.
          </p>
        </div>

        <div className="p-6 rounded-[var(--r-md)] border border-[var(--border)] bg-white space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Standard Input */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                Commodity Reference Code
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full h-11 px-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)] focus:ring-offset-2"
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">Rule citation: Section 36 inspection code</p>
            </div>

            {/* Select Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
                Commodity Category
              </label>
              <select
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
                className="w-full h-11 px-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)] focus:ring-offset-2"
              >
                <option value="packaged_food">Packaged food</option>
                <option value="personal_care">Personal care</option>
                <option value="electrical">Electrical goods</option>
                <option value="household">Household goods</option>
                <option value="textiles">Textiles & Apparel</option>
                <option value="other">Other</option>
              </select>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Determines statutory checklist</p>
            </div>

            {/* Error State Field */}
            <div>
              <label className="block text-xs font-semibold text-[var(--rose-ac)] mb-1.5">
                Maximum Retail Price Declaration
              </label>
              <input
                type="text"
                defaultValue="Not detected on visible panels"
                className="w-full h-11 px-3 rounded-[var(--r-sm)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--rose-ac)] focus:ring-offset-2"
                style={{ backgroundColor: 'var(--rose-t)', border: '1.5px solid var(--rose-br)', color: 'var(--rose-ac)' }}
              />
              <p className="mt-1 text-xs font-semibold" style={{ color: 'var(--rose-ac)' }}>
                Rule 6(1)(e) violation: Mandatory MRP missing
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
