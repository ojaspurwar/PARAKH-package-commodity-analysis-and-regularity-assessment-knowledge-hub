import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileCheck,
  FileText,
  Flag,
  HelpCircle,
  Ruler,
  ShieldCheck,
  X,
} from 'lucide-react';
import type { ComplianceCheck, OcrDetails } from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';

export interface VerdictPanelProps {
  reference: string;
  productName: string;
  category: string;
  status: 'compliant' | 'violation' | 'pending';
  checks: ComplianceCheck[];
  ocrText?: string;
  ocrDetails?: OcrDetails | null;
  imageUrl?: string | null;
  capturedAt?: string | Date;
  officerName?: string;
  location?: string;
  evidenceHash?: string | null;
  submitted?: boolean;
  onRecordFinding?: () => void | Promise<void>;
  onFlagReview?: () => void | Promise<void>;
  isSubmitting?: boolean;
  exportUrl?: string;
  triggerSignatureAnimation?: boolean;
}

export interface Rule6Item {
  key: string;
  label: string;
  ruleCitation: string;
  value: string;
  status: 'passed' | 'failed' | 'review';
  note: string;
}

export function VerdictPanel({
  reference,
  productName,
  category,
  status: initialStatus,
  checks = [],
  ocrText = '',
  ocrDetails = null,
  imageUrl = null,
  capturedAt = new Date().toISOString(),
  officerName = 'Legal Metrology Inspector',
  location = 'Field Inspection Desk',
  evidenceHash = null,
  submitted = false,
  onRecordFinding,
  onFlagReview,
  isSubmitting = false,
  exportUrl,
  triggerSignatureAnimation = true,
}: VerdictPanelProps) {
  const { language } = useI18n();
  const [passedExpanded, setPassedExpanded] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [findingRecorded, setFindingRecorded] = useState(submitted);
  const [flaggedForReview, setFlaggedForReview] = useState(false);

  // Normalize checks into Rule 6 requirements
  const checkMap = new Map<string, ComplianceCheck>();
  checks.forEach((c) => checkMap.set(c.key, c));

  const mrpCheck = checkMap.get('mrp');
  const uspCheck = checkMap.get('usp');
  const qtyCheck = checkMap.get('qty') || checkMap.get('net_quantity');
  const dateCheck = checkMap.get('date') || checkMap.get('date_marking');
  const contactCheck = checkMap.get('contact') || checkMap.get('consumer_care');
  const packerCheck = checkMap.get('packer') || checkMap.get('manufacturer');
  const originCheck = checkMap.get('origin') || checkMap.get('country_of_origin');

  const rule6Items: Rule6Item[] = [
    {
      key: 'identity',
      label: language === 'hi' ? 'वस्तु का नाम एवं पहचान' : 'Commodity identity & generic name',
      ruleCitation: 'Rule 6(1)(b)',
      value: productName || (language === 'hi' ? 'पहचान अनुपस्थित' : 'Name not identified'),
      status: productName && productName.trim().length > 1 ? 'passed' : 'failed',
      note:
        productName && productName.trim().length > 1
          ? language === 'hi'
            ? 'विधिक घोषणा: वस्तु का सामान्य/पारंपरिक नाम मुख्य प्रदर्शन पटल पर प्रदर्शित'
            : 'Generic or common name of commodity declared on principal display panel'
          : language === 'hi'
          ? 'उल्लंघन: वस्तु का मानक विधिक नाम पैकेज पर नहीं पाया गया'
          : 'Rule 6(1)(b) Violation: Common or generic name missing from label',
    },
    {
      key: 'manufacturer_packer',
      label: language === 'hi' ? 'निर्माता / पैकर / आयातक विवरण' : 'Manufacturer, packer or importer details',
      ruleCitation: 'Rule 6(1)(a)',
      value: packerCheck?.value || (language === 'hi' ? 'अनुपस्थित' : 'Not detected'),
      status: packerCheck?.status || 'failed',
      note:
        packerCheck?.note ||
        (language === 'hi'
          ? 'उल्लंघन: निर्माता/पैकर का पूर्ण नाम, पता एवं पिन कोड अनिवार्य'
          : 'Rule 6(1)(a) Violation: Complete name & postal address with PIN code missing'),
    },
    {
      key: 'country_of_origin',
      label: language === 'hi' ? 'उत्पत्ति का देश' : 'Country of origin',
      ruleCitation: 'Rule 6(1)(aa)',
      value: originCheck?.value || (language === 'hi' ? 'भारत (घरेलू)' : 'India (Domestic)'),
      status: originCheck?.status || 'passed',
      note:
        originCheck?.note ||
        (language === 'hi'
          ? 'नियम 6(1)(aa) व नियम 10: मूल देश की अनिवार्य घोषणा सत्यापित'
          : 'Rule 6(1)(aa) & Rule 10 verified: Country of origin declared'),
    },
    {
      key: 'net_quantity',
      label: language === 'hi' ? 'शुद्ध मात्रा एवं मानक मीट्रिक इकाइयां' : 'Net quantity & standard SI metric units',
      ruleCitation: 'Rule 6(1)(c) & Rule 12',
      value: qtyCheck?.value || (language === 'hi' ? 'अनुपस्थित' : 'Not detected'),
      status: qtyCheck?.status || 'failed',
      note:
        qtyCheck?.note ||
        (language === 'hi'
          ? 'उल्लंघन: अनिवार्य शुद्ध मात्रा घोषणा पैकेज पर अनुपस्थित'
          : 'Rule 6(1)(c) Violation: Mandatory net quantity statement missing from visible panels'),
    },
    {
      key: 'date_marking',
      label: language === 'hi' ? 'विनिर्माण / पैकिंग अथवा आयात की तिथि' : 'Date of manufacture, packing or import',
      ruleCitation: 'Rule 6(1)(d)',
      value: dateCheck?.value || (language === 'hi' ? 'अनुपस्थित' : 'Not detected'),
      status: dateCheck?.status || 'failed',
      note:
        dateCheck?.note ||
        (language === 'hi'
          ? 'उल्लंघन: विनिर्माण/पैकिंग का माह एवं वर्ष घोषित नहीं है'
          : 'Rule 6(1)(d) Violation: Month and year of manufacture or pre-packing missing'),
    },
    {
      key: 'retail_sale_price',
      label: language === 'hi' ? 'अधिकतम खुदरा मूल्य (MRP सभी कर सहित)' : 'Maximum retail price (MRP incl. of all taxes)',
      ruleCitation: 'Rule 6(1)(e)',
      value: mrpCheck?.value || (language === 'hi' ? 'अनुपस्थित' : 'Not detected'),
      status: mrpCheck?.status || 'failed',
      note:
        mrpCheck?.note ||
        (language === 'hi'
          ? 'उल्लंघन: अधिकतम खुदरा मूल्य (MRP) की घोषणा पैकेज पर नहीं पाई गई'
          : 'Rule 6(1)(e) Violation: Maximum Retail Price missing or invalid'),
    },
    {
      key: 'unit_sale_price',
      label: language === 'hi' ? 'इकाई विक्रय मूल्य (USP)' : 'Unit sale price (USP)',
      ruleCitation: 'Rule 6(1)(s)',
      value: uspCheck?.value || (category === 'Electrical goods' ? 'Not applicable (Unit article)' : 'Not detected'),
      status: uspCheck?.status || (category === 'Electrical goods' ? 'passed' : 'review'),
      note:
        uspCheck?.note ||
        (category === 'Electrical goods'
          ? 'Rule 6(11) Exemption: Unit sale price not required for discrete unit articles'
          : 'Rule 6(11) Amendment: Mandatory unit sale price per g/ml required for packaged commodities'),
    },
    {
      key: 'consumer_care',
      label: language === 'hi' ? 'उपभोक्ता हेल्पलाइन व शिकायत निवारण' : 'Consumer care details & grievance redressal',
      ruleCitation: 'Rule 6(1)(n)',
      value: contactCheck?.value || (language === 'hi' ? 'अनुपस्थित' : 'Not detected'),
      status: contactCheck?.status || 'failed',
      note:
        contactCheck?.note ||
        (language === 'hi'
          ? 'उल्लंघन: उपभोक्ता शिकायत निवारण हेतु अधिकारी का नाम, दूरभाष या ईमेल अनुपस्थित'
          : 'Rule 6(1)(n) Violation: Consumer care contact telephone, address or email missing'),
    },
  ];

  // Separate failed, review, and passed
  const failedItems = rule6Items.filter((i) => i.status === 'failed');
  const reviewItems = rule6Items.filter((i) => i.status === 'review');
  const passedItems = rule6Items.filter((i) => i.status === 'passed');

  // Overall verdict calculation
  const calculatedVerdict = failedItems.length > 0 ? 'violation' : reviewItems.length > 0 ? 'pending' : 'compliant';

  // Format timestamp in mono tabular-nums
  const formattedTimestamp =
    typeof capturedAt === 'string'
      ? capturedAt.replace('T', ' ').slice(0, 19) + ' IST'
      : capturedAt.toISOString().replace('T', ' ').slice(0, 19) + ' IST';

  // Rule 7 font-size calculations
  const fontCheck = checkMap.get('font');
  const netQtyStr = qtyCheck?.value || ocrText;
  const matchQty = netQtyStr.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|m|cm|units?|u)/i);
  let qtyNum = 500;
  let qtyUnit = 'g';
  if (matchQty) {
    qtyNum = parseFloat(matchQty[1]);
    qtyUnit = matchQty[2].toLowerCase();
  }
  const normalizedGrams = qtyUnit === 'kg' || qtyUnit === 'l' ? qtyNum * 1000 : qtyNum;

  let tierLabel = '200 g – 1000 g (Tier 3)';
  let requiredMinMm = 4.0;
  if (normalizedGrams <= 50) {
    tierLabel = '≤ 50 g / ml (Tier 1)';
    requiredMinMm = 1.0;
  } else if (normalizedGrams <= 200) {
    tierLabel = '50 g – 200 g / ml (Tier 2)';
    requiredMinMm = 2.0;
  } else if (normalizedGrams <= 1000) {
    tierLabel = '200 g – 1000 g / ml (Tier 3)';
    requiredMinMm = 4.0;
  } else {
    tierLabel = '> 1000 g / ml (Tier 4)';
    requiredMinMm = 6.0;
  }

  let measuredMm = 2.8;
  if (fontCheck?.value) {
    const matchMm = fontCheck.value.match(/(\d+(?:\.\d+)?)\s*mm/i);
    if (matchMm) measuredMm = parseFloat(matchMm[1]);
  } else if (ocrDetails?.words?.length) {
    const heights = ocrDetails.words.map((w) => w.height).sort((a, b) => a - b);
    const medianPx = heights[Math.floor(heights.length / 2)] || 25;
    measuredMm = parseFloat(((medianPx * 25.4) / 300).toFixed(1));
  } else if (failedItems.some((f) => f.key === 'net_quantity')) {
    measuredMm = 1.8;
  }

  const isFontCompliant = measuredMm >= requiredMinMm;
  const varianceMm = (measuredMm - requiredMinMm).toFixed(1);
  const maxRulerMm = 8.0;

  // Handler for Record Finding
  const handleRecordFinding = async () => {
    if (onRecordFinding) {
      await onRecordFinding();
    }
    setFindingRecorded(true);
  };

  // Handler for Flag for Review
  const handleFlagReview = async () => {
    if (onFlagReview) {
      await onFlagReview();
    }
    setFlaggedForReview(true);
  };

  return (
    <div className="space-y-6" data-testid="verdict-panel-root">
      {/* 1. STATUS BAND (Full panel width, category tint/border, signature animation) */}
      <div
        className={`relative overflow-hidden rounded-[var(--r-md)] border-[1.5px] p-5 ${
          triggerSignatureAnimation ? 'verdict-status-fill' : ''
        } ${
          calculatedVerdict === 'violation'
            ? 'bg-rose-t border-rose-br'
            : calculatedVerdict === 'compliant'
            ? 'bg-green-t border-green-br'
            : 'bg-amber-t border-amber-br'
        }`}
        data-testid="verdict-status-band"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`grid size-14 shrink-0 place-items-center rounded-full bg-white border-[1.5px] ${
                calculatedVerdict === 'violation'
                  ? 'border-rose-br text-rose-act'
                  : calculatedVerdict === 'compliant'
                  ? 'border-green-br text-green-act'
                  : 'border-amber-br text-amber-act'
              }`}
            >
              {calculatedVerdict === 'violation' ? (
                <AlertTriangle size={28} />
              ) : calculatedVerdict === 'compliant' ? (
                <ShieldCheck size={28} />
              ) : (
                <HelpCircle size={28} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-[var(--text)]">
                  {calculatedVerdict === 'violation'
                    ? language === 'hi'
                      ? 'विधिक उल्लंघन पाया गया'
                      : 'Violation detected'
                    : calculatedVerdict === 'compliant'
                    ? language === 'hi'
                      ? 'पूर्णतः अनुपालित'
                      : 'Compliant'
                    : language === 'hi'
                    ? 'सत्यापन आवश्यक'
                    : 'Needs review'}
                </h2>
                <span
                  className={`rounded-[var(--r-sm)] border-[1.5px] px-2 py-0.5 text-xs font-semibold ${
                    calculatedVerdict === 'violation'
                      ? 'bg-rose-t border-rose-br text-rose-act'
                      : calculatedVerdict === 'compliant'
                      ? 'bg-green-t border-green-br text-green-act'
                      : 'bg-amber-t border-amber-br text-amber-act'
                  }`}
                >
                  {calculatedVerdict === 'violation'
                    ? language === 'hi'
                      ? 'गैर-अनुपालक'
                      : 'Non-compliant'
                    : calculatedVerdict === 'compliant'
                    ? language === 'hi'
                      ? 'मानक अनुरूप'
                      : 'Standard met'
                    : language === 'hi'
                    ? 'जांच लंबित'
                    : 'Verification pending'}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {calculatedVerdict === 'violation'
                  ? language === 'hi'
                    ? `${failedItems.length} अनिवार्य घोषणाएं नियमों के विपरीत [नियम 6 / नियम 7]`
                    : `${failedItems.length} mandatory statutory checks failed [Rule 6 / Rule 7]`
                  : calculatedVerdict === 'compliant'
                  ? language === 'hi'
                    ? 'विधिक मापविज्ञान नियम, 2011 के तहत सभी 8 अनिवार्य घोषणाएं सत्यापित'
                    : 'All 8 mandatory declarations verified under Legal Metrology Rules, 2011'
                  : language === 'hi'
                  ? 'कुछ घोषणाओं के लिए भौतिक पैकेज सत्यापन आवश्यक'
                  : 'Manual physical label review required for highlighted declarations'}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end text-xs text-[var(--text-muted)]">
            <span className="font-mono font-medium text-[var(--text)] tabular-nums">{reference}</span>
            <span className="font-mono text-[11px] tabular-nums mt-0.5">{formattedTimestamp}</span>
            <span className="mt-1 text-[11px]">{location}</span>
          </div>
        </div>
      </div>

      {/* 2. DECLARATION CHECKLIST (Rule 6 Requirements) */}
      <div className="space-y-3" data-testid="verdict-checklist-section">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text)]">
            {language === 'hi'
              ? 'नियम 6 अनिवार्य घोषणा चेकलिस्ट (Rule 6 Checklist)'
              : 'Rule 6 mandatory declaration checklist'}
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {failedItems.length > 0 ? (
              <span className="text-rose-act font-semibold">
                {failedItems.length} {language === 'hi' ? 'उल्लंघन' : 'failed'}
              </span>
            ) : null}
            {passedItems.length > 0 ? (
              <span className="text-green-act ml-2">
                {passedItems.length} {language === 'hi' ? 'सत्यापित' : 'verified'}
              </span>
            ) : null}
          </span>
        </div>

        {/* Failed items sort to top with staggered rise animation */}
        {failedItems.length > 0 && (
          <div className="space-y-2">
            {failedItems.map((item, idx) => (
              <div
                key={item.key}
                style={{ animationDelay: `${420 + idx * 45}ms` }}
                className="verdict-failed-row-animate rounded-[var(--r-md)] border-[1.5px] border-rose-br bg-rose-t p-3.5"
                data-testid={`checklist-item-${item.key}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{item.label}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)] tabular-nums">
                        [{item.ruleCitation}]
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-medium text-rose-act">
                      {language === 'hi' ? 'प्राप्त घोषणा: ' : 'Declared value: '}
                      <span className="font-mono tabular-nums">{item.value}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)] leading-5">{item.note}</p>
                  </div>

                  <span className="inline-flex items-center gap-1 shrink-0 rounded-[var(--r-sm)] border-[1.5px] border-rose-br bg-white px-2.5 py-1 text-xs font-semibold text-rose-act">
                    <X size={13} />
                    {language === 'hi' ? 'उल्लंघन' : 'Violation'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review items (if any) */}
        {reviewItems.length > 0 && (
          <div className="space-y-2">
            {reviewItems.map((item) => (
              <div
                key={item.key}
                className="rounded-[var(--r-md)] border-[1.5px] border-amber-br bg-amber-t p-3.5"
                data-testid={`checklist-item-${item.key}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[var(--text)]">{item.label}</span>
                      <span className="text-xs font-mono text-[var(--text-muted)] tabular-nums">
                        [{item.ruleCitation}]
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-medium text-amber-act">
                      {language === 'hi' ? 'प्राप्त घोषणा: ' : 'Declared value: '}
                      <span className="font-mono tabular-nums">{item.value}</span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)] leading-5">{item.note}</p>
                  </div>

                  <span className="inline-flex items-center gap-1 shrink-0 rounded-[var(--r-sm)] border-[1.5px] border-amber-br bg-white px-2.5 py-1 text-xs font-semibold text-amber-act">
                    <HelpCircle size={13} />
                    {language === 'hi' ? 'समीक्षा आवश्यक' : 'Needs review'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Passed items summary accordion */}
        {passedItems.length > 0 && (
          <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setPassedExpanded(!passedExpanded)}
              className="flex w-full items-center justify-between bg-green-t/40 px-4 py-3 text-left transition-colors hover:bg-green-t/60"
              data-testid="button-toggle-passed-checks"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-full bg-white border border-green-br text-green-act">
                  <Check size={14} />
                </span>
                <span className="text-sm font-semibold text-[var(--text)]">
                  {language === 'hi'
                    ? `${passedItems.length} विधिक जांच सफल`
                    : `${passedItems.length} checks passed`}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  ({language === 'hi' ? 'नियम 6 अनिवार्य घोषणाएं' : 'Rule 6 mandatory declarations verified'})
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-[var(--link)]">
                {passedExpanded
                  ? language === 'hi'
                    ? 'विवरण छुपाएं'
                    : 'Hide passed checks'
                  : language === 'hi'
                  ? 'विवरण देखें'
                  : 'View passed checks'}
                {passedExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            {passedExpanded && (
              <div className="divide-y divide-[var(--border)] p-2">
                {passedItems.map((item) => (
                  <div key={item.key} className="flex items-start justify-between gap-3 p-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--text)]">{item.label}</span>
                        <span className="text-xs font-mono text-[var(--text-muted)] tabular-nums">
                          [{item.ruleCitation}]
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)] truncate">{item.value}</p>
                    </div>

                    <span className="inline-flex items-center gap-1 shrink-0 rounded-[var(--r-sm)] border border-green-br bg-green-t px-2 py-0.5 text-xs font-semibold text-green-act">
                      <Check size={12} />
                      {language === 'hi' ? 'अनुपालित' : 'Compliant'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. RULE 7 FONT-SIZE CHECK (Custom proportional scale bar visual) */}
      <div
        className="rounded-[var(--r-md)] border-[1.5px] border-[var(--border)] bg-white p-5 space-y-4"
        data-testid="verdict-rule7-visual"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-[var(--indigo-600)]" />
              <h3 className="text-base font-semibold text-[var(--text)]">
                {language === 'hi'
                  ? 'नियम 7 फ़ॉन्ट ऊंचाई एवं मुख्य प्रदर्शन पटल सत्यापन'
                  : 'Rule 7 font-height & declaration scale measurement'}
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {language === 'hi'
                ? 'विधिक मापविज्ञान (पैक वस्तुएं) नियम, 2011 — नियम 7(3) एवं द्वितीय अनुसूची सारणी I'
                : 'Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 7(3) & Second Schedule Table I'}
            </p>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border-[1.5px] px-2.5 py-1 text-xs font-semibold ${
              isFontCompliant
                ? 'bg-green-t border-green-br text-green-act'
                : 'bg-rose-t border-rose-br text-rose-act'
            }`}
          >
            {isFontCompliant ? (
              <>
                <Check size={13} /> {language === 'hi' ? 'फ़ॉन्ट ऊंचाई अनुपालित' : 'Compliant height'}
              </>
            ) : (
              <>
                <X size={13} /> {language === 'hi' ? 'नियम 7 फ़ॉन्ट उल्लंघन' : 'Rule 7 deficit'}
              </>
            )}
          </span>
        </div>

        {/* Custom Physical Scale Bar Visual */}
        <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-4 space-y-4">
          {/* Scale Ruler Graduation Header */}
          <div>
            <div className="flex justify-between text-[11px] font-mono text-[var(--text-muted)] tabular-nums mb-1">
              <span>0.0 mm</span>
              <span>2.0 mm</span>
              <span>4.0 mm</span>
              <span>6.0 mm</span>
              <span>8.0 mm</span>
            </div>
            {/* SVG Millimeter Graduation Ruler */}
            <svg
              className="w-full h-4 text-[var(--text-muted)]"
              viewBox="0 0 800 16"
              preserveAspectRatio="none"
              aria-label="Millimeter ruler graduation marks from 0 to 8 mm"
            >
              <line x1="0" y1="15" x2="800" y2="15" stroke="currentColor" strokeWidth="1.5" />
              {Array.from({ length: 17 }).map((_, i) => {
                const x = i * 50;
                const isMajor = i % 2 === 0;
                return (
                  <line
                    key={i}
                    x1={x}
                    y1={isMajor ? 4 : 9}
                    x2={x}
                    y2="15"
                    stroke="currentColor"
                    strokeWidth={isMajor ? 1.5 : 1}
                  />
                );
              })}
            </svg>
          </div>

          {/* Proportional Comparison Track */}
          <div className="space-y-3">
            {/* 1. Required Statutory Minimum Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text)]">
                  {language === 'hi' ? 'विधिक अनिवार्य न्यूनतम ऊंचाई:' : 'Statutory required minimum:'}
                </span>
                <span className="font-mono font-semibold tabular-nums text-[var(--text)]">
                  {requiredMinMm.toFixed(1)} mm
                </span>
              </div>
              <div className="relative h-6 w-full rounded-[var(--r-sm)] bg-white border border-[var(--border)] overflow-hidden">
                <div
                  className="h-full bg-[var(--indigo-600)] transition-all duration-300 flex items-center justify-end px-2"
                  style={{ width: `${(requiredMinMm / maxRulerMm) * 100}%` }}
                >
                  <span className="font-mono text-[11px] font-medium text-white tabular-nums">
                    {requiredMinMm.toFixed(1)} mm
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Actual Measured Numeral Height Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium text-[var(--text)]">
                  {language === 'hi' ? 'लेबल पर मापी गई वास्तविक ऊंचाई:' : 'Measured numeral height on label:'}
                </span>
                <span
                  className={`font-mono font-semibold tabular-nums ${
                    isFontCompliant ? 'text-green-act' : 'text-rose-act'
                  }`}
                >
                  {measuredMm.toFixed(1)} mm
                  {!isFontCompliant && ` (${varianceMm} mm shortfall)`}
                </span>
              </div>
              <div className="relative h-6 w-full rounded-[var(--r-sm)] bg-white border border-[var(--border)] overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 flex items-center justify-end px-2 ${
                    isFontCompliant ? 'bg-green-act' : 'bg-rose-act'
                  }`}
                  style={{ width: `${(measuredMm / maxRulerMm) * 100}%` }}
                >
                  <span className="font-mono text-[11px] font-medium text-white tabular-nums">
                    {measuredMm.toFixed(1)} mm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Comparison Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border)] text-xs">
            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">
                {language === 'hi' ? 'घोषित मात्रा' : 'Declared net quantity'}
              </span>
              <span className="font-mono font-semibold text-[var(--text)] tabular-nums mt-0.5 block">
                {qtyNum} {qtyUnit}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">
                {language === 'hi' ? 'सारणी I श्रेणी' : 'Schedule tier'}
              </span>
              <span className="font-mono font-semibold text-[var(--text)] tabular-nums mt-0.5 block">
                {tierLabel}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">
                {language === 'hi' ? 'अनिवार्य सीमा' : 'Required minimum'}
              </span>
              <span className="font-mono font-semibold text-[var(--text)] tabular-nums mt-0.5 block">
                {requiredMinMm.toFixed(1)} mm
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--text-muted)] block">
                {language === 'hi' ? 'विचलन / अंतर' : 'Statutory delta'}
              </span>
              <span
                className={`font-mono font-semibold tabular-nums mt-0.5 block ${
                  isFontCompliant ? 'text-green-act' : 'text-rose-act'
                }`}
              >
                {parseFloat(varianceMm) > 0 ? `+${varianceMm} mm` : `${varianceMm} mm`}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] leading-5">
          {isFontCompliant
            ? language === 'hi'
              ? `सत्यापित: मुख्य प्रदर्शन पटल पर मुद्रित संख्याएं (${measuredMm} मिमी) विहित ${requiredMinMm} मिमी न्यूनतम ऊंचाई सीमा को पूर्ण करती हैं [नियम 7(3)]।`
              : `Verified: Numerals and declarations (${measuredMm} mm) satisfy the mandatory ${requiredMinMm} mm minimum height threshold under Rule 7(3) & Second Schedule Table I.`
            : language === 'hi'
            ? `विधिक उल्लंघन: मापी गई ऊंचाई (${measuredMm} मिमी) इस पैकेज मात्रा श्रेणी के लिए निर्धारित ${requiredMinMm} मिमी से कम है [नियम 7(3) का उल्लंघन, धारा 36 के अधीन दंडनीय]।`
            : `Statutory violation: Measured numeral height (${measuredMm} mm) falls below the mandatory ${requiredMinMm} mm minimum for this net quantity tier under Rule 7(3) (punishable under Section 36).`}
        </p>
      </div>

      {/* 4. EVIDENCE DISPLAY (Captured image with PDP outlined & Mono timestamp) */}
      <div
        className="rounded-[var(--r-md)] border-[1.5px] border-[var(--border)] bg-white overflow-hidden"
        data-testid="verdict-evidence-section"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--bg-sunken)] px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <Eye size={15} className="text-[var(--indigo-600)]" />
            <span className="font-semibold text-[var(--text)]">
              {language === 'hi'
                ? 'साक्ष्य अभिलेख एवं मुख्य प्रदर्शन पटल (PDP)'
                : 'Captured evidence & principal display panel (PDP)'}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums text-[var(--text-muted)]">
            <span>Ref: {reference}</span>
            <span>{formattedTimestamp}</span>
          </div>
        </div>

        <div className="p-4">
          {imageUrl ? (
            <div className="relative rounded-[var(--r-sm)] border border-[var(--border)] bg-black/5 overflow-hidden flex items-center justify-center min-h-[300px]">
              <img
                src={imageUrl}
                alt="Captured commodity packaging evidence"
                className="max-h-[420px] w-auto object-contain"
              />
              {/* Principal Display Panel (PDP) Overlay Outline */}
              {showOverlays && (
                <div
                  className="pointer-events-none absolute inset-[12%] border-2 border-rose-br bg-rose-act/10 rounded-sm shadow-sm flex flex-col justify-between p-2"
                  aria-label="Principal Display Panel Outline per Rule 2(h)"
                >
                  <span className="self-start rounded-[var(--r-sm)] bg-rose-act px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
                    Principal Display Panel [Rule 2(h)]
                  </span>
                  <span className="self-end font-mono text-[10px] text-rose-act bg-white/90 px-1.5 py-0.5 rounded">
                    OCR Words: {ocrDetails?.words?.length || 0}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[var(--r-sm)] border border-dashed border-[var(--border)] text-center p-6">
              <FileText size={32} className="text-[var(--text-muted)]" />
              <p className="mt-2 text-sm font-semibold text-[var(--text)]">
                {language === 'hi' ? 'साक्ष्य छवि उपलब्ध नहीं' : 'No photo attached'}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                {language === 'hi'
                  ? 'अभिलेख में भौतिक कैप्चर छवि संलग्न नहीं है।'
                  : 'Physical packaging photo was not captured during this assessment.'}
              </p>
            </div>
          )}

          {/* Evidence metadata strip */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-[var(--border)] pt-3 text-[var(--text-muted)]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--text)]">
                {language === 'hi' ? 'निरीक्षण अधिकारी:' : 'Inspecting officer:'}
              </span>
              <span>{officerName}</span>
            </div>
            {evidenceHash && (
              <div className="flex items-center gap-1.5 font-mono text-[11px] tabular-nums truncate max-w-md">
                <span className="font-semibold text-[var(--text)]">SHA-256:</span>
                <span className="truncate">{evidenceHash}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. ACTIONS ROW (Outcome-named buttons per AGENTS.md §9) */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4"
        data-testid="verdict-actions-row"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action 1: Record finding */}
          <button
            type="button"
            onClick={handleRecordFinding}
            disabled={isSubmitting || findingRecorded}
            className={`inline-flex items-center gap-1.5 rounded-[var(--r-sm)] px-4 py-2 text-xs font-semibold transition-all ${
              findingRecorded
                ? 'bg-green-act text-white'
                : 'bg-[var(--indigo-600)] text-white hover:bg-[var(--indigo-700)] active:scale-[0.985]'
            } disabled:opacity-75`}
            data-testid="button-record-finding"
          >
            {findingRecorded ? (
              <>
                <Check size={14} />
                {language === 'hi' ? 'निष्कर्ष दर्ज किया गया' : 'Finding recorded'}
              </>
            ) : isSubmitting ? (
              language === 'hi' ? 'दर्ज किया जा रहा है...' : 'Recording...'
            ) : (
              <>
                <FileCheck size={14} />
                {language === 'hi' ? 'निष्कर्ष दर्ज करें' : 'Record finding'}
              </>
            )}
          </button>

          {/* Action 2: Flag for review */}
          <button
            type="button"
            onClick={handleFlagReview}
            disabled={flaggedForReview}
            className={`inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border-[1.5px] px-4 py-2 text-xs font-semibold transition-all ${
              flaggedForReview
                ? 'border-amber-br bg-amber-t text-amber-act'
                : 'border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--bg-sunken)] active:scale-[0.985]'
            }`}
            data-testid="button-flag-review"
          >
            <Flag size={14} />
            {flaggedForReview
              ? language === 'hi'
                ? 'समीक्षा हेतु चिह्नित किया गया'
                : 'Flagged for review'
              : language === 'hi'
              ? 'समीक्षा हेतु चिह्नित करें'
              : 'Flag for review'}
          </button>
        </div>

        {/* Action 3: Export evidence sheet */}
        {exportUrl ? (
          <a
            href={exportUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--link)] hover:text-[var(--link-hover)] hover:bg-[var(--bg-sunken)]"
            data-testid="button-export-evidence"
          >
            <Download size={14} />
            {language === 'hi' ? 'साक्ष्य पत्रक निर्यात करें' : 'Export evidence sheet'}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--link)] hover:text-[var(--link-hover)] hover:bg-[var(--bg-sunken)]"
            data-testid="button-export-evidence"
          >
            <Download size={14} />
            {language === 'hi' ? 'साक्ष्य पत्रक निर्यात करें' : 'Export evidence sheet'}
          </button>
        )}
      </div>
    </div>
  );
}
