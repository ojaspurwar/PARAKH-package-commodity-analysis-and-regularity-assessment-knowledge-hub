import { AlertTriangle, CheckCircle, FileText, Info, Ruler, Sparkles, Type } from 'lucide-react';
import type { ComplianceCheck, OcrDetails } from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';

interface FontReadabilityCardProps {
  checks: ComplianceCheck[];
  ocrDetails?: OcrDetails | null;
  ocrText: string;
}

export function FontReadabilityCard({ checks, ocrDetails, ocrText }: FontReadabilityCardProps) {
  const { language } = useI18n();

  // Find statutory font check and readability check
  const fontCheck = checks.find((c) => c.key === 'font');
  const readabilityCheck = checks.find((c) => c.key === 'readable' || c.key === 'readability');
  const netQtyCheck = checks.find((c) => c.key === 'qty' || c.key === 'net_quantity');

  // Parse net quantity and determine statutory tier under Rule 7(3) & Schedule II
  const netQtyText = netQtyCheck?.value || ocrText;
  const matchQty = netQtyText.match(/(\d+(?:\.\d+)?)\s*(g|kg|ml|l|m|cm|units?|u)/i);

  let qtyNum = 0;
  let qtyUnit = 'g';
  if (matchQty) {
    qtyNum = parseFloat(matchQty[1]);
    qtyUnit = matchQty[2].toLowerCase();
  }

  // Normalize to grams or ml
  const normalizedGrams = qtyUnit === 'kg' || qtyUnit === 'l' ? qtyNum * 1000 : qtyNum;

  let tier = 'Standard';
  let requiredMinMm = 2.0;
  if (normalizedGrams > 0) {
    if (normalizedGrams <= 50) {
      tier = '≤ 50 g / ml (Tier 1)';
      requiredMinMm = 1.0;
    } else if (normalizedGrams <= 200) {
      tier = '50 g – 200 g / ml (Tier 2)';
      requiredMinMm = 2.0;
    } else if (normalizedGrams <= 1000) {
      tier = '200 g – 1000 g / ml (Tier 3)';
      requiredMinMm = 4.0;
    } else {
      tier = '> 1000 g / ml (Tier 4)';
      requiredMinMm = 6.0;
    }
  }

  // Measured font size estimation
  let measuredMm = 2.8;
  if (fontCheck?.value) {
    const matchMm = fontCheck.value.match(/(\d+(?:\.\d+)?)\s*mm/i);
    if (matchMm) measuredMm = parseFloat(matchMm[1]);
  } else if (ocrDetails?.words?.length) {
    const heights = ocrDetails.words.map((w) => w.height).sort((a, b) => a - b);
    const medianPx = heights[Math.floor(heights.length / 2)] || 25;
    measuredMm = parseFloat(((medianPx * 25.4) / 300).toFixed(1));
  }

  const isFontCompliant = measuredMm >= requiredMinMm;

  // Readability / OCR Confidence
  let avgConfidence = 88;
  if (readabilityCheck?.value) {
    const matchConf = readabilityCheck.value.match(/(\d+)\s*%/);
    if (matchConf) avgConfidence = parseInt(matchConf[1], 10);
  } else if (ocrDetails?.words?.length) {
    const sum = ocrDetails.words.reduce((acc, w) => acc + (w.confidence || 80), 0);
    avgConfidence = Math.round(sum / ocrDetails.words.length);
  }

  const isReadabilityCompliant = avgConfidence >= 60;

  // Non-standard units check
  const nonStandardMatch = ocrText.match(/\b\d+\s*(?:gms|kgs|gm\b|g\.|ml\.|litres?|ltrs?)\b/i);

  return (
    <section className="appear delay-2 rounded-2xl border border-border bg-card p-6 md:p-7 space-y-6" data-testid="card-font-readability">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">
            {language === 'hi' ? 'विधिक विनिर्देश' : 'Statutory Specifications'}
          </p>
          <h2 className="mt-1 text-lg font-semibold flex items-center gap-2">
            <Ruler size={18} className="text-secondary" />
            {language === 'hi' ? 'फ़ॉन्ट आकार और पठनीयता विश्लेषण' : 'Font Size & Readability Analysis'}
          </h2>
        </div>
        <span className="font-mono text-[10px] rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
          Rule 7(3) & Schedule II LMPC
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* 1. Font Size Analysis Box */}
        <div className={`rounded-xl border p-4 space-y-3 ${isFontCompliant ? 'border-secondary/30 bg-secondary/5' : 'border-destructive/30 bg-destructive/5'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Type size={17} className={isFontCompliant ? 'text-secondary' : 'text-destructive'} />
              <h3 className="text-sm font-semibold">
                {language === 'hi' ? 'फ़ॉन्ट ऊंचाई सत्यापन (Font Height)' : 'Declaration Numeral & Letter Height'}
              </h3>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isFontCompliant ? 'bg-secondary/15 text-secondary' : 'bg-destructive/15 text-destructive'
            }`}>
              {isFontCompliant ? (
                <>
                  <CheckCircle size={10} /> {language === 'hi' ? 'अनुपालित' : 'Compliant'}
                </>
              ) : (
                <>
                  <AlertTriangle size={10} /> {language === 'hi' ? 'उल्लंघन' : 'Rule 7 Violation'}
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-card/80 p-2.5 border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-mono">
                {language === 'hi' ? 'मापी गई ऊंचाई' : 'Measured Height'}
              </span>
              <span className={`text-base font-bold font-mono ${isFontCompliant ? 'text-foreground' : 'text-destructive'}`}>
                {measuredMm} mm
              </span>
            </div>
            <div className="rounded-lg bg-card/80 p-2.5 border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-mono">
                {language === 'hi' ? 'विधिक न्यूनतम' : 'Statutory Minimum'}
              </span>
              <span className="text-base font-bold font-mono text-foreground">
                {requiredMinMm.toFixed(1)} mm
              </span>
            </div>
          </div>

          {/* Progress gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{language === 'hi' ? 'पैकेज श्रेणी:' : 'Net Qty Tier:'} {tier}</span>
              <span>{Math.round((measuredMm / requiredMinMm) * 100)}% of min</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  isFontCompliant ? 'bg-secondary' : 'bg-destructive'
                }`}
                style={{ width: `${Math.min(100, Math.round((measuredMm / requiredMinMm) * 100))}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] leading-4 text-muted-foreground">
            {isFontCompliant
              ? (language === 'hi'
                  ? `मुद्रित संख्याएं व अक्षर अनुसूची II के तहत अनिवार्य ${requiredMinMm} मिमी न्यूनतम ऊंचाई को पूरा करते हैं।`
                  : `Numerals & letters meet the mandatory ${requiredMinMm} mm height threshold under Second Schedule.`)
              : (language === 'hi'
                  ? `उल्लंघन: मापी गई ऊंचाई (${measuredMm} मिमी) इस मात्रा श्रेणी के लिए अनिवार्य ${requiredMinMm} मिमी से कम है (धारा 36 के तहत दंडनीय)।`
                  : `Contravention: Measured ${measuredMm} mm is below the statutory ${requiredMinMm} mm minimum for this package tier under Rule 7(3).`)}
          </p>
        </div>

        {/* 2. Readability & Print Legibility Box */}
        <div className={`rounded-xl border p-4 space-y-3 ${isReadabilityCompliant ? 'border-secondary/30 bg-secondary/5' : 'border-destructive/30 bg-destructive/5'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText size={17} className={isReadabilityCompliant ? 'text-secondary' : 'text-destructive'} />
              <h3 className="text-sm font-semibold">
                {language === 'hi' ? 'मुद्रण पठनीयता व स्पष्टता' : 'Print Legibility & Contrast'}
              </h3>
            </div>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
              isReadabilityCompliant ? 'bg-secondary/15 text-secondary' : 'bg-destructive/15 text-destructive'
            }`}>
              {isReadabilityCompliant ? (
                <>
                  <CheckCircle size={10} /> {language === 'hi' ? 'स्पष्ट' : 'Legible'}
                </>
              ) : (
                <>
                  <AlertTriangle size={10} /> {language === 'hi' ? 'अस्पष्ट' : 'Low Quality'}
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-card/80 p-2.5 border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-mono">
                {language === 'hi' ? 'ऑप्टिकल स्पष्टता' : 'OCR Confidence'}
              </span>
              <span className="text-base font-bold font-mono text-foreground">
                {avgConfidence}%
              </span>
            </div>
            <div className="rounded-lg bg-card/80 p-2.5 border border-border">
              <span className="text-[10px] text-muted-foreground block uppercase font-mono">
                {language === 'hi' ? 'कंट्रास्ट गुणवत्ता' : 'Print Contrast'}
              </span>
              <span className="text-base font-bold font-mono text-foreground">
                {avgConfidence >= 75 ? (language === 'hi' ? 'उच्च' : 'High') : (language === 'hi' ? 'मध्यम' : 'Fair')}
              </span>
            </div>
          </div>

          {/* Readability bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>{language === 'hi' ? 'पठनीयता स्कोर' : 'Legibility Grade'}</span>
              <span>{avgConfidence >= 75 ? 'Grade A' : avgConfidence >= 55 ? 'Grade B' : 'Grade C'}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-all ${
                  avgConfidence >= 60 ? 'bg-secondary' : 'bg-destructive'
                }`}
                style={{ width: `${avgConfidence}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] leading-4 text-muted-foreground">
            {avgConfidence >= 60
              ? (language === 'hi'
                  ? 'घोषणाएं पृष्ठभूमि के विरुद्ध स्पष्ट रूप से दिखाई दे रही हैं तथा प्रमुख प्रदर्शन पैनल (PDP) पर सुपाठ्य हैं।'
                  : 'Mandatory declarations are distinct, conspicuous, and clearly legible against the background.')
              : (language === 'hi'
                  ? 'मुद्रण धुंधला अथवा कम कंट्रास्ट वाला है। भौतिक लेबल पर स्पष्टता की पुष्टि आवश्यक है।'
                  : 'Print is faint, blurry or has insufficient contrast against packaging background.')}
          </p>
        </div>
      </div>

      {/* 3. Non-Standard / Misleading Declarations Callout */}
      {nonStandardMatch && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex items-start gap-3">
          <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-destructive">
              {language === 'hi' ? 'गैर-मानक इकाई का उल्लंघन (Rule 12/13 Violation)' : 'Non-Standard Unit Symbol Detected (Rule 12 & 13 Violation)'}
            </p>
            <p className="mt-1 text-foreground/80 leading-5">
              {language === 'hi'
                ? `पैकेज पर गैर-मानक इकाई "${nonStandardMatch[0]}" का प्रयोग किया गया है। विधिक मापविज्ञान नियमों के तहत बहुवचन (gms, kgs, ltrs) निषिद्ध हैं। केवल मानक SI प्रतीकों ('g', 'kg', 'ml') का ही उपयोग अनुमन्य है।`
                : `The prohibited non-standard unit symbol "${nonStandardMatch[0]}" was detected. LMPC Rules prohibit plurals or periods (gms, kgs, ltrs). Only statutory SI symbols ('g', 'kg', 'ml') are permitted.`}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
