import { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, ShieldAlert, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';
import type { ComplianceCheck, OcrDetails } from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';

interface AnnotatedPhotoProps {
  imageUrl: string;
  ocrDetails?: OcrDetails | null;
  checks: ComplianceCheck[];
  productName: string;
}

export function AnnotatedPhoto({ imageUrl, ocrDetails, checks, productName }: AnnotatedPhotoProps) {
  const { language } = useI18n();
  const [showOverlays, setShowOverlays] = useState(true);
  const [showAllWords, setShowAllWords] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2>(1);
  const [activeWord, setActiveWord] = useState<{ text: string; note: string; status: 'failed' | 'passed' | 'review' } | null>(null);

  const failedChecks = checks.filter((c) => c.status === 'failed');

  // Helper to test if a word corresponds to a violation / non-standard declaration
  const isViolationWord = (wordText: string): { isViolation: boolean; note: string } => {
    const text = wordText.toLowerCase();

    // 1. Prohibited non-standard units under Rule 12 & Rule 13
    if (/\b(?:gms|kgs|gm\b|g\.|ml\.|litres?|ltrs?)\b/i.test(text)) {
      return {
        isViolation: true,
        note: `Rule 13 Violation: Non-standard unit '${wordText}'. Must use SI symbol without plural (e.g. 'g', 'kg', 'ml')`,
      };
    }

    // 2. Dual MRP / Overwriting or failed MRP
    if (failedChecks.some((c) => c.key === 'mrp') && /\b(?:mrp|rs|₹|price|retail)\b/i.test(text)) {
      return {
        isViolation: true,
        note: 'Rule 6(1)(e) Violation: Incomplete or non-compliant MRP marking on package',
      };
    }

    // 3. Font size failure
    if (failedChecks.some((c) => c.key === 'font')) {
      if (/\b(?:mrp|net|qty|mfd|mfg|exp|batch)\b/i.test(text)) {
        return {
          isViolation: true,
          note: 'Rule 7(3) & Schedule II Violation: Font height below statutory minimum requirement for this net quantity tier',
        };
      }
    }

    // 4. Missing / failed date marking
    if (failedChecks.some((c) => c.key === 'date') && /\b(?:mfg|mfd|exp|best|date)\b/i.test(text)) {
      return {
        isViolation: true,
        note: 'Rule 6(1)(d) Violation: Month & year of manufacture/packing missing or invalid',
      };
    }

    // 5. Incomplete packer details
    if (failedChecks.some((c) => c.key === 'packer') && /\b(?:mfg|packed|marketed|import)\b/i.test(text)) {
      return {
        isViolation: true,
        note: 'Rule 6(1)(a) Violation: Incomplete manufacturer/packer postal address or PIN code missing',
      };
    }

    return { isViolation: false, note: '' };
  };

  const imgWidth = ocrDetails?.imageWidth || 1000;
  const imgHeight = ocrDetails?.imageHeight || 1000;

  return (
    <div className="relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden" data-testid="annotated-photo-container">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Eye size={14} className="text-secondary" />
            {language === 'hi' ? 'साक्ष्य फोटो व उल्लंघन मार्कर' : 'Supporting Evidence & Violation Overlays'}
          </span>
          {failedChecks.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-bold text-destructive">
              <AlertCircle size={11} /> {failedChecks.length} {language === 'hi' ? 'उल्लंघन' : 'Violations'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowOverlays(!showOverlays)}
            className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
              showOverlays
                ? 'bg-destructive text-destructive-foreground'
                : 'border border-border bg-card text-muted-foreground hover:bg-muted'
            }`}
            title="Toggle Red Non-compliance Overlays"
          >
            {showOverlays
              ? (language === 'hi' ? 'लाल मार्कर सक्रिय' : 'Red Markers: ON')
              : (language === 'hi' ? 'मार्कर दिखाएं' : 'Show Red Markers')}
          </button>

          {ocrDetails?.words?.length ? (
            <button
              type="button"
              onClick={() => setShowAllWords(!showAllWords)}
              className={`rounded-lg px-2.5 py-1 font-medium transition-colors ${
                showAllWords
                  ? 'bg-secondary text-secondary-foreground'
                  : 'border border-border bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {showAllWords
                ? (language === 'hi' ? 'सभी शब्द' : 'All OCR')
                : (language === 'hi' ? 'केवल उल्लंघन' : 'Violations Only')}
            </button>
          ) : null}

          {/* Zoom controls */}
          <div className="flex items-center rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setZoomLevel(zoomLevel === 2 ? 1.5 : zoomLevel === 1.5 ? 1 : 1)}
              disabled={zoomLevel === 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-1.5 font-mono text-[10px] font-semibold">{zoomLevel}x</span>
            <button
              type="button"
              onClick={() => setZoomLevel(zoomLevel === 1 ? 1.5 : 2)}
              disabled={zoomLevel === 2}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Photo Area with SVG Overlays */}
      <div className="relative min-h-[340px] max-h-[580px] overflow-auto bg-black/90 flex items-center justify-center p-2">
        <div
          className="relative transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
          }}
        >
          <img
            src={imageUrl}
            alt={`Supporting evidence photo for ${productName}`}
            className="block max-h-[520px] w-auto max-w-full rounded-lg object-contain select-none shadow-2xl"
          />

          {/* Overlay Layer for Bounding Boxes */}
          {showOverlays && ocrDetails && ocrDetails.words && (
            <svg
              viewBox={`0 0 ${imgWidth} ${imgHeight}`}
              className="absolute inset-0 size-full pointer-events-none"
              style={{ overflow: 'visible' }}
            >
              {ocrDetails.words.map((w, idx) => {
                const { isViolation, note } = isViolationWord(w.text);

                if (!isViolation && !showAllWords) return null;

                const isRed = isViolation;
                const strokeColor = isRed ? '#EF4444' : '#10B981';
                const fillColor = isRed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.12)';

                return (
                  <g
                    key={idx}
                    className="pointer-events-auto cursor-pointer transition-opacity hover:opacity-100"
                    onClick={() =>
                      setActiveWord({
                        text: w.text,
                        note: isViolation ? note : `Detected OCR token '${w.text}' (confidence: ${Math.round(w.confidence)}%)`,
                        status: isViolation ? 'failed' : 'passed',
                      })
                    }
                  >
                    {/* Bounding Box rectangle */}
                    <rect
                      x={w.x}
                      y={w.y}
                      width={w.width}
                      height={w.height}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isRed ? 3 : 1.5}
                      rx={2}
                    />

                    {/* Red Violation Tag Pill */}
                    {isRed && (
                      <g transform={`translate(${w.x}, ${Math.max(0, w.y - 14)})`}>
                        <rect width={Math.max(48, w.width)} height={14} fill="#EF4444" rx={2} />
                        <text
                          x={4}
                          y={10}
                          fill="#FFFFFF"
                          fontSize={9}
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          VIOLATION
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          )}

          {/* Prominent Floating Red Violation Badges for Missing Declarations */}
          {showOverlays && failedChecks.length > 0 && (
            <div className="absolute top-3 left-3 right-3 flex flex-col gap-1.5 pointer-events-none">
              {failedChecks.slice(0, 3).map((fail) => (
                <div
                  key={fail.key}
                  className="pointer-events-auto inline-flex items-center gap-2 rounded-lg bg-destructive/95 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-lg ring-2 ring-white/30"
                  data-testid={`badge-violation-${fail.key}`}
                >
                  <AlertCircle size={14} className="shrink-0 text-white animate-pulse" />
                  <span className="truncate">
                    <strong className="font-bold">VIOLATION:</strong> {fail.label} — {fail.note}
                  </span>
                </div>
              ))}
              {failedChecks.length > 3 && (
                <div className="inline-flex self-start rounded-md bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                  +{failedChecks.length - 3} more statutory violations marked
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Box Info / Tooltip Drawer */}
      {activeWord && (
        <div
          className={`flex items-start justify-between gap-3 border-t p-3 text-xs ${
            activeWord.status === 'failed'
              ? 'border-destructive/30 bg-destructive/10 text-destructive'
              : 'border-border bg-muted/40 text-foreground'
          }`}
        >
          <div className="flex items-start gap-2">
            {activeWord.status === 'failed' ? (
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-destructive" />
            ) : (
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-secondary" />
            )}
            <div>
              <p className="font-bold font-mono">
                &ldquo;{activeWord.text}&rdquo; — {activeWord.status === 'failed' ? 'Non-compliant element' : 'Compliant element'}
              </p>
              <p className="mt-0.5 text-[11px] leading-4 opacity-90">{activeWord.note}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveWord(null)}
            className="rounded p-1 hover:bg-black/10 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Evidence Integrity Tag Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-card px-4 py-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-secondary" />
          {language === 'hi'
            ? 'लाल आयताकार बॉक्स गैर-अनुपालित व गायब घोषणाओं को दर्शाते हैं।'
            : 'Red rectangular boxes highlight non-compliant, non-standard, or missing mandatory markings.'}
        </span>
        <span className="font-mono text-[10px]">LMPC Rules 2011 • Rule 6 / 7 / 12 / 13</span>
      </div>
    </div>
  );
}
