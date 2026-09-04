import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Camera,
  Check,
  CircleAlert,
  Cpu,
  FileText,
  Filter,
  HeartPulse,
  ImagePlus,
  Leaf,
  LoaderCircle,
  RefreshCw,
  ScanBarcode,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
  Zap,
} from 'lucide-react';
import { Link } from 'wouter';
import { VerdictPanel } from '@/components/verdict-panel';
import { getGetScanQueryKey, getGetScansQueryKey, useCreateScan, useGetScans, useSubmitScan } from '@workspace/api-client-react';
import type { ComplianceCheck, Scan, ScanInput } from '@workspace/api-client-react';
import { appConfig } from '@/config';
import { EmptyState, ErrorState, ScanRow, SkeletonRows, StatusPill } from '@/components/scan-ui';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { LiveCameraCapture } from '@/components/live-camera-capture';
import { ScanTable } from '@/components/scan-table';
import { preparePhoto, runImageOcr, type OcrResult } from '@/lib/ocr';
import { prepareEnhancedPhoto } from '@/lib/image-enhancer';
import { buildCategorySpecificChecks } from '@/lib/date-compliance';
import { useAuth } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';

export interface HealthImpactReport {
  ingredients: string[];
  benefits: string[];
  harmsAndRisks: string[];
  healthScore: string;
  safetyRating: string;
  dietaryAdvisories: string[];
  allergens: string[];
}

export interface TechnicalSafetyReport {
  technicalSpecs: Array<{ label: string; value: string }>;
  safetyWarnings: string[];
  certificationMarks: string[];
  precautions: string[];
}

export interface AiAnalysisData {
  productName: string;
  category: 'Packaged food' | 'Personal care' | 'Household goods' | 'Electrical goods' | 'Textiles & Apparel' | 'Other';
  mrp: string | null;
  unitSalePrice: string | null;
  netQuantity: string | null;
  dateMarking: string | null;
  consumerCare: string | null;
  manufacturerPacker: string | null;
  countryOfOrigin: string | null;
  summary: string;
  status: 'compliant' | 'violation' | 'pending';
  fullOcrText: string;
  missingDeclarations: string[];
  confidence: number;
  healthReport?: HealthImpactReport | null;
  technicalSafetyReport?: TechnicalSafetyReport | null;
}

export default function HomePage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const [started, setStarted] = useState(false);
  const [barcodeScanning, setBarcodeScanning] = useState(false);
  const [liveCameraScanning, setLiveCameraScanning] = useState(false);
  const [photo, setPhoto] = useState<{ dataUrl: string; width: number; height: number } | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisData | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [ocrError, setOcrError] = useState('');
  const [reviewScan, setReviewScan] = useState<Scan | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'compliant' | 'violation' | 'pending'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [notice, setNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');
  const [form, setForm] = useState<ScanInput>({
    productName: '',
    category: 'Packaged food',
    officerName: user.name,
    location: user.jurisdiction,
    status: 'pending',
    imageUrl: null,
    ocrText: '',
    ocrDetails: null,
  });

  const scanQuery = useGetScans({ search: search || undefined, status: status === 'all' ? undefined : status });
  const createScan = useCreateScan();
  const submitScan = useSubmitScan();

  const update = (key: keyof ScanInput, value: string) => {
    setForm((current) => {
      const updated = { ...current, [key]: value };
      if (key === 'category' && aiAnalysis) {
        const recomputedChecks = buildCategorySpecificChecks(value, {
          mrp: aiAnalysis.mrp,
          unitSalePrice: aiAnalysis.unitSalePrice,
          netQuantity: aiAnalysis.netQuantity,
          dateMarking: aiAnalysis.dateMarking,
          consumerCare: aiAnalysis.consumerCare,
          manufacturerPacker: aiAnalysis.manufacturerPacker,
          countryOfOrigin: aiAnalysis.countryOfOrigin,
          fullOcrText: aiAnalysis.fullOcrText || '',
        });
        const hasViolations = recomputedChecks.some((c) => c.status === 'failed');
        updated.checks = recomputedChecks;
        updated.status = hasViolations ? 'violation' : (aiAnalysis.status === 'violation' ? 'violation' : 'compliant');
      }
      return updated;
    });
  };

  const triggerAiVision = async (dataUrl: string) => {
    setAiRunning(true);
    setOcrStatus(language === 'hi' ? 'एआई विज़न (Google Gemini 2.5) लेबल स्कैन कर रहा है…' : 'AI Vision (Google Gemini 2.5) analyzing package label…');
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        const a: AiAnalysisData = data.analysis;
        setAiAnalysis(a);

        // Build deterministic Legal Metrology compliance checks from AI analysis
        const generatedChecks = buildCategorySpecificChecks(a.category, {
          mrp: a.mrp,
          unitSalePrice: a.unitSalePrice,
          netQuantity: a.netQuantity,
          dateMarking: a.dateMarking,
          consumerCare: a.consumerCare,
          manufacturerPacker: a.manufacturerPacker,
          countryOfOrigin: a.countryOfOrigin,
          fullOcrText: a.fullOcrText || '',
        });

        // Strict statutory violation determination:
        const hasViolations = generatedChecks.some((c) => c.status === 'failed');
        const calculatedStatus = hasViolations ? 'violation' : (a.status === 'violation' ? 'violation' : 'compliant');

        // Format structured transcription text with clear labels at top so it is never lost in saved scans or PDFs
        const structuredSummary = [
          `PRODUCT: ${a.productName}`,
          `CATEGORY: ${a.category}`,
          a.mrp ? `MRP: ${a.mrp}` : 'MRP: Not detected',
          a.unitSalePrice ? `UNIT SALE PRICE: ${a.unitSalePrice}` : '',
          a.netQuantity ? `NET QUANTITY: ${a.netQuantity}` : '',
          a.dateMarking ? `DATE OF MFG / PACKING: ${a.dateMarking}` : '',
          a.consumerCare ? `CONSUMER CARE: ${a.consumerCare}` : '',
          a.manufacturerPacker ? `MANUFACTURER / PACKER: ${a.manufacturerPacker}` : '',
          a.countryOfOrigin ? `COUNTRY OF ORIGIN: ${a.countryOfOrigin}` : '',
          '',
          '--- STATUTORY COMPLIANCE STATUS ---',
          `VERDICT: ${calculatedStatus.toUpperCase()}`,
          ...(hasViolations
            ? ['VIOLATIONS DETECTED:', ...generatedChecks.filter((c) => c.status === 'failed').map((c) => `• [${c.label}]: ${c.note}`)]
            : ['All primary statutory declarations verified under LMPC Rules, 2011.']),
          '',
          '--- RAW OCR & PACKAGING TRANSCRIPTION ---',
          a.fullOcrText || '',
        ].filter(Boolean).join('\n');

        setForm((cur) => ({
          ...cur,
          productName: a.productName || cur.productName,
          category: a.category || cur.category,
          ocrText: structuredSummary || cur.ocrText,
          status: calculatedStatus,
          checks: generatedChecks,
        }));

        setNotice(
          language === 'hi'
            ? `✨ एआई स्वतः श्रेणी: "${a.category}" | मूल्य: ${a.mrp || 'अज्ञात'} | स्थिति: ${calculatedStatus === 'violation' ? 'उल्लंघन' : 'अनुपालक'}`
            : `✨ AI auto-classified "${a.category}" | MRP: ${a.mrp || 'N/A'} | Status: ${calculatedStatus.toUpperCase()}`
        );
      }
    } catch (err) {
      console.warn('AI Vision call failed, local OCR will be used:', err);
    } finally {
      setAiRunning(false);
    }
  };

  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setOcrError('');
    setNotice('');
    setErrorNotice('');
    setStarted(true);
    try {
      const prepared = await prepareEnhancedPhoto(file);
      setPhoto(prepared);
      setForm((current) => ({ ...current, imageUrl: prepared.dataUrl }));
      setOcrRunning(true);
      setOcrProgress(0.15);

      // Run Vision AI analysis with OpenRouter
      await triggerAiVision(prepared.dataUrl);

      // Also gather physical bounding boxes via Tesseract in background for font/placement millimeter checks
      runImageOcr(prepared.dataUrl, prepared, (progress) => {
        if (progress.progress >= 0) setOcrProgress(progress.progress);
      }).then((result) => {
        setOcrResult(result);
        setForm((current) => ({
          ...current,
          ocrDetails: {
            engine: result.engine,
            imageWidth: result.imageWidth,
            imageHeight: result.imageHeight,
            words: result.words,
          },
        }));
      }).catch(() => {
        // Tesseract failure is non-fatal when AI Vision has run
      });
    } catch {
      setOcrError(language === 'hi' ? 'तस्वीर को प्रोसेस नहीं किया जा सका।' : 'The photo could not be read on this device.');
    } finally {
      setOcrRunning(false);
    }
  };

  const handleLiveCapture = async (captured: { dataUrl: string; width: number; height: number; panelsCount?: number }) => {
    setLiveCameraScanning(false);
    setOcrError('');
    setNotice(
      captured.panelsCount && captured.panelsCount > 1
        ? (language === 'hi'
            ? `${captured.panelsCount} पैकेज पैनल सफलतापूर्वक कैप्चर किए गए। एआई विश्लेषण जारी है…`
            : `${captured.panelsCount} package panels captured. Vision AI analyzing all sides…`)
        : ''
    );
    setErrorNotice('');
    setStarted(true);
    setPhoto(captured);
    setForm((current) => ({ ...current, imageUrl: captured.dataUrl }));
    setOcrRunning(true);
    setOcrProgress(0.15);

    // Run Vision AI analysis with OpenRouter
    await triggerAiVision(captured.dataUrl);

    // Also gather physical bounding boxes via Tesseract in background
    runImageOcr(captured.dataUrl, captured, (progress) => {
      if (progress.progress >= 0) setOcrProgress(progress.progress);
    }).then((result) => {
      setOcrResult(result);
      setForm((current) => ({
        ...current,
        ocrDetails: {
          engine: result.engine,
          imageWidth: result.imageWidth,
          imageHeight: result.imageHeight,
          words: result.words,
        },
      }));
    }).catch(() => {});
  };

  const removePhoto = () => {
    setPhoto(null);
    setOcrResult(null);
    setAiAnalysis(null);
    setOcrError('');
    setForm((current) => ({ ...current, imageUrl: null, ocrDetails: null }));
  };
  const handleBarcode = (barcode: { rawValue: string; format: string }) => {
    setNotice('');
    setErrorNotice('');
    setBarcodeScanning(false);
    // Create a scan directly from the scanned barcode so it lands in the
    // register immediately; the officer can open it and attach the label text.
    createScan.mutate(
      {
        data: {
          productName: `Scanned product (${barcode.format.toUpperCase()} ${barcode.rawValue})`,
          category: 'Other',
          officerName: user.name,
          location: user.jurisdiction,
          status: 'pending',
          imageUrl: null,
          barcode: barcode.rawValue,
          ocrText: `Barcode ${barcode.rawValue} (${barcode.format})`,
        },
      },
      {
        onSuccess: (scan) => {
          setReviewScan(scan);
          setNotice(`Barcode ${barcode.rawValue} captured. Add the label details, then submit.`);
          queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
        },
        onError: () => {
          setErrorNotice('Could not save the scanned barcode. Check the API server and try again.');
        },
      },
    );
  };
  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    createScan.mutate({ data: form }, {
      onSuccess: (scan) => {
        setReviewScan(scan);
        setStarted(false);
        setErrorNotice('');
        setNotice('Evidence captured. Review the checks before submitting.');
        queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
      },
      onError: () => {
        setNotice('');
        setErrorNotice('Could not reach the evidence service. Make sure the API server is running, then try again.');
      },
    });
  };
  const handleSubmit = () => {
    if (!reviewScan) return;
    submitScan.mutate({ id: reviewScan.id, data: { submitted: true } }, {
      onSuccess: (scan) => {
        setReviewScan(scan);
        setErrorNotice('');
        setNotice('Scan submitted to the supervisor queue.');
        queryClient.setQueryData(getGetScanQueryKey(scan.id), scan);
        queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
      },
      onError: () => {
        setErrorNotice('Could not submit this record. Check the connection and try again.');
      },
    });
  };

  const handleDeleteScan = async (e: React.MouseEvent, scan: Scan) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmed = window.confirm(
      language === 'hi'
        ? `क्या आप वाकई "${scan.productName}" के इस निरीक्षण रिकॉर्ड को हटाना चाहते हैं?`
        : `Are you sure you want to delete this inspection record for "${scan.productName}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/scans/${scan.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete scan');
      await queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
      if (reviewScan?.id === scan.id) {
        setReviewScan(null);
      }
      setNotice(
        language === 'hi'
          ? `"${scan.productName}" का रिकॉर्ड सफलतापूर्वक हटा दिया गया।`
          : `Inspection record for "${scan.productName}" deleted successfully.`
      );
    } catch (err: any) {
      setErrorNotice(language === 'hi' ? 'हटाने में विफल: ' + (err.message || '') : 'Failed to delete record: ' + (err.message || ''));
    }
  };

  const cityLabel = language === 'hi' ? 'जयपुर' : (appConfig.defaultLocation.split(' • ')[0] || 'Jaipur');
  const dateStamp = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date())
    .toUpperCase();

  return (
    <div className="portal-container py-6 space-y-6">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'फील्ड स्कैनर एवं भौतिक लेबल मूल्यांकन' : 'Field Scanner & Physical Label Assessment'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        {/* Notice Banners */}
        {notice && (
          <div className="rounded-[var(--r-sm)] border border-[var(--green-br)] bg-[var(--green-t)] px-4 py-3 text-xs font-medium text-[var(--green-ac)] flex items-center justify-between">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} className="font-bold ml-2">×</button>
          </div>
        )}
        {errorNotice && (
          <div className="rounded-[var(--r-sm)] border border-[var(--rose-br)] bg-[var(--rose-t)] px-4 py-3 text-xs font-medium text-[var(--rose-ac)] flex items-center justify-between">
            <span>{errorNotice}</span>
            <button type="button" onClick={() => setErrorNotice('')} className="font-bold ml-2">×</button>
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(350px,1fr)]">
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
              <div>
                <h2 className="text-base font-semibold text-[var(--text)]">{t.startNewInspection}</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {language === 'hi' ? 'पैकेज की तस्वीरें लें या बारकोड स्कैन करके घोषणाओं की पुष्टि करें।' : 'Capture package images or scan barcodes to verify mandatory declarations.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!started && !barcodeScanning && !liveCameraScanning && (
                  <>
                    <button
                      type="button"
                      onClick={() => { setBarcodeScanning(true); setLiveCameraScanning(false); setStarted(false); }}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-white text-xs font-medium hover:bg-[var(--bg-sunken)] transition-colors"
                      data-testid="button-scan-barcode"
                    >
                      <ScanBarcode size={14} /> {t.scanBarcode}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setLiveCameraScanning(true); setBarcodeScanning(false); setStarted(false); }}
                      className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] bg-[var(--cyan-ac)] text-white text-xs font-medium transition-transform active:scale-[0.985]"
                      data-testid="button-live-camera-scanner"
                    >
                      <Camera size={14} />
                      <span>{language === 'hi' ? 'लाइव कैमरा स्कैनर' : 'Live camera scanner'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

          {liveCameraScanning ? (
            <LiveCameraCapture onCapture={handleLiveCapture} onCancel={() => setLiveCameraScanning(false)} />
          ) : barcodeScanning ? (
            <BarcodeScanner onDetected={handleBarcode} onCancel={() => setBarcodeScanning(false)} />
          ) : !started ? (
            <div
              className="rounded-[var(--r-md)] border-[1.5px] border-cyan-br bg-cyan-t p-5 md:p-6 space-y-5"
              data-testid="box-field-scanner-priority"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white border-[1.5px] border-cyan-br text-cyan-act">
                    <Camera size={28} />
                  </div>
                  <div>
                    <span className="rounded-[var(--r-sm)] bg-white border border-cyan-br text-cyan-act px-2 py-0.5 text-xs font-semibold">
                      {language === 'hi' ? 'फील्ड निरीक्षण प्राथमिकता डेस्क' : 'Field Inspection Priority Desk'}
                    </span>
                    <h3 className="mt-1.5 text-base font-semibold text-[var(--text)]">
                      {language === 'hi' ? 'लाइव कैमरा एवं एआई विज़न पैकेज मूल्यांकन' : 'Live Camera & AI Vision Package Assessment'}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-muted)] max-w-xl leading-5">
                      {language === 'hi'
                        ? 'पैकेज लेबल को फ्रेम में केंद्रित करें। प्रणाली नियम 6 अनिवार्य घोषणाओं (MRP, USP, Net Qty) एवं नियम 7 फ़ॉन्ट ऊंचाई का स्वतः सत्यापन करेगी।'
                        : 'Capture retail commodity packaging. The rule engine validates Rule 6 mandatory declarations (MRP, USP, Net Quantity, Packer) and measures Rule 7 numeral height to statutory standards.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Three primary actions, 46px tall, --r-sm, white 600-weight label */}
              <div className="grid gap-2 sm:grid-cols-3 pt-2 border-t border-cyan-br/30">
                <button
                  type="button"
                  onClick={() => { setLiveCameraScanning(true); setBarcodeScanning(false); setStarted(false); }}
                  className="inline-flex items-center justify-center gap-2 h-[46px] rounded-[var(--r-sm)] bg-cyan-act px-4 text-xs font-semibold text-white shadow-xs hover:opacity-90 active:scale-[0.985] transition-all"
                  data-testid="button-begin-live-camera"
                >
                  <Camera size={16} />
                  <span>{language === 'hi' ? 'लाइव कैमरा खोलें' : 'Open live camera'}</span>
                </button>

                <label
                  className="inline-flex cursor-pointer items-center justify-center gap-2 h-[46px] rounded-[var(--r-sm)] bg-cyan-act px-4 text-xs font-semibold text-white shadow-xs hover:opacity-90 active:scale-[0.985] transition-all"
                  data-testid="label-quick-ai-scan"
                >
                  <ImagePlus size={16} />
                  <span>{language === 'hi' ? 'फोटो अपलोड करें' : 'Upload package photo'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} data-testid="input-quick-ai-scan" />
                </label>

                <button
                  type="button"
                  onClick={() => { setBarcodeScanning(true); setLiveCameraScanning(false); setStarted(false); }}
                  className="inline-flex items-center justify-center gap-2 h-[46px] rounded-[var(--r-sm)] bg-cyan-act px-4 text-xs font-semibold text-white shadow-xs hover:opacity-90 active:scale-[0.985] transition-all"
                  data-testid="button-begin-barcode"
                >
                  <ScanBarcode size={16} />
                  <span>{language === 'hi' ? 'बारकोड / EAN स्कैन करें' : 'Scan barcode or EAN'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                <span>{language === 'hi' ? 'अथवा भौतिक पैकेज विवरण सीधे दर्ज करें:' : 'Or enter physical packaging declarations directly:'}</span>
                <button
                  type="button"
                  onClick={() => setStarted(true)}
                  className="font-semibold text-[var(--link)] hover:text-[var(--link-hover)] underline"
                >
                  {language === 'hi' ? 'मैन्युअल डेटा प्रविष्टि' : 'Manual inspection form'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 md:p-6" data-testid="form-new-scan">
              <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)]">{t.captureModeActive}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{t.enterWhatLabelTells}</p>
                </div>
                <button type="button" onClick={() => setStarted(false)} className="text-xs font-semibold text-muted-foreground hover:text-foreground" data-testid="button-cancel-capture">{t.cancel}</button>
              </div>

              {/* 1. Category-specific Intelligence Card */}
              {/* CASE A: Food Items -> Full Nutritional Ingredients, Health Benefits & Harms */}
              {aiAnalysis?.category === 'Packaged food' && aiAnalysis?.healthReport && (
                <div className="mb-5 overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 md:p-5 shadow-xs" data-testid="box-health-report-card">
                  {/* Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/15 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-xl bg-emerald-600 text-white shadow-sm">
                        <HeartPulse size={18} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            {language === 'hi' ? 'खाद्य सामग्री, पोषण लाभ एवं स्वास्थ्य जोखिम' : 'Food Ingredients, Nutritional Benefits & Health Harms'}
                          </h4>
                          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                            FSSAI & LMPC
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {language === 'hi' ? 'सामग्री विवरण, पोषण लाभ एवं संभावित जोखिम विश्लेषण' : 'Culinary ingredient breakdown, nutrition & physiological impact'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-card px-2.5 py-1 shadow-xs">
                        <span className="text-[10px] uppercase font-mono text-muted-foreground">{language === 'hi' ? 'स्कोर:' : 'Score:'}</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {aiAnalysis.healthReport.healthScore || 'N/A'}
                        </span>
                      </div>
                      <span className="rounded-xl bg-emerald-600/15 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                        {aiAnalysis.healthReport.safetyRating || 'Standard'}
                      </span>
                    </div>
                  </div>

                  {/* Detected Ingredients Badges */}
                  {aiAnalysis.healthReport.ingredients.length > 0 && (
                    <div className="mt-3.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                          {language === 'hi' ? 'पहचानी गई सामग्री (Food Ingredients)' : 'Detected Food Ingredients on Label'}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {aiAnalysis.healthReport.ingredients.length} {language === 'hi' ? 'घटक' : 'items'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {aiAnalysis.healthReport.ingredients.map((ing, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs text-foreground/90 shadow-xs"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dual Columns: Benefits vs Harms & Risks */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-emerald-500/20 bg-card/85 p-3.5 shadow-xs">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border-b border-emerald-500/10 pb-2">
                        <Leaf size={15} />
                        <span>{language === 'hi' ? 'स्वास्थ्य लाभ एवं पोषण (Benefits)' : 'Nutritional & Health Benefits'}</span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-foreground/85">
                        {aiAnalysis.healthReport.benefits.length > 0 ? (
                          aiAnalysis.healthReport.benefits.map((b, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Check size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>{b}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-muted-foreground text-[11px] italic">
                            {language === 'hi' ? 'कोई विशेष पोषण लाभ नहीं दर्शाया गया।' : 'No notable nutritional benefits reported.'}
                          </li>
                        )}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-amber-500/25 bg-card/85 p-3.5 shadow-xs">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs border-b border-amber-500/15 pb-2">
                        <AlertTriangle size={15} />
                        <span>{language === 'hi' ? 'संभावित नुकसान एवं स्वास्थ्य जोखिम (Harms)' : 'Potential Harms & Side Effects'}</span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-foreground/85">
                        {aiAnalysis.healthReport.harmsAndRisks.length > 0 ? (
                          aiAnalysis.healthReport.harmsAndRisks.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-amber-900 dark:text-amber-200">
                              <ShieldAlert size={14} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                              <span>{h}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-muted-foreground text-[11px] italic">
                            {language === 'hi' ? 'सामान्य सीमा में कोई प्रत्यक्ष हानिकारक तत्व नहीं।' : 'No critical harms detected.'}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Dietary Advisories & Allergens */}
                  {(aiAnalysis.healthReport.dietaryAdvisories.length > 0 || aiAnalysis.healthReport.allergens.length > 0) && (
                    <div className="mt-3.5 rounded-xl border border-border/70 bg-card/90 p-3 text-xs leading-5">
                      {aiAnalysis.healthReport.dietaryAdvisories.length > 0 && (
                        <div className="mb-2">
                          <span className="font-semibold text-foreground/90 block mb-1">
                            ⚠️ {language === 'hi' ? 'आहार संबंधी चेतावनियां (Dietary Advisories):' : 'Dietary Advisories:'}
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                            {aiAnalysis.healthReport.dietaryAdvisories.map((adv, idx) => (
                              <li key={idx}>{adv}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {aiAnalysis.healthReport.allergens.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
                          <span className="font-semibold text-destructive text-[11px]">
                            {language === 'hi' ? 'एलर्जी चेतावनी (Allergens):' : 'Declared Allergens:'}
                          </span>
                          {aiAnalysis.healthReport.allergens.map((alg, idx) => (
                            <span key={idx} className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                              {alg}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* CASE B: Personal Care Items -> Cosmetic Formulation & Dermatological Safety */}
              {aiAnalysis?.category === 'Personal care' && aiAnalysis?.healthReport && (
                <div className="mb-5 overflow-hidden rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 md:p-5 shadow-xs" data-testid="box-personal-care-card">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-500/15 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-xl bg-purple-600 text-white shadow-sm">
                        <Sparkles size={18} />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                            {language === 'hi' ? 'पर्सनल केयर सामग्री व त्वचा सुरक्षा' : 'Personal Care Formulation & Dermatological Safety'}
                          </h4>
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300">
                            Cosmetic Safety
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {language === 'hi' ? 'सक्रिय घटक, कॉस्मेटिक लाभ एवं त्वचा संवेदनशीलता विश्लेषण' : 'Active ingredients, grooming benefits & topical sensitization'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-xl bg-purple-600/15 px-2.5 py-1 text-xs font-semibold text-purple-800 dark:text-purple-200">
                        {aiAnalysis.healthReport.safetyRating || 'Dermatologically Tested'}
                      </span>
                    </div>
                  </div>

                  {/* Ingredients */}
                  {aiAnalysis.healthReport.ingredients.length > 0 && (
                    <div className="mt-3.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">
                        {language === 'hi' ? 'सक्रिय घटक व रसायन (Chemical Formulation)' : 'Active Formulation Ingredients'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {aiAnalysis.healthReport.ingredients.map((ing, idx) => (
                          <span key={idx} className="rounded-lg border border-purple-500/20 bg-card px-2.5 py-1 text-xs text-foreground/90">
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dual Columns: Benefits vs Irritation Precautions */}
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-purple-500/20 bg-card/85 p-3.5">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-xs border-b border-purple-500/10 pb-2">
                        <Check size={14} />
                        <span>{language === 'hi' ? 'कॉस्मेटिक एवं त्वचा लाभ' : 'Grooming & Skin Benefits'}</span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5 text-xs text-foreground/85">
                        {aiAnalysis.healthReport.benefits.map((b, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check size={13} className="mt-0.5 text-purple-500 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-amber-500/25 bg-card/85 p-3.5">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold text-xs border-b border-amber-500/15 pb-2">
                        <AlertTriangle size={14} />
                        <span>{language === 'hi' ? 'सावधानी व एलर्जी चेतावनी' : 'Precautions & Irritation Warnings'}</span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5 text-xs text-foreground/85">
                        {aiAnalysis.healthReport.harmsAndRisks.length > 0 ? (
                          aiAnalysis.healthReport.harmsAndRisks.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-amber-900 dark:text-amber-200">
                              <ShieldAlert size={13} className="mt-0.5 text-amber-500 shrink-0" />
                              <span>{h}</span>
                            </li>
                          ))
                        ) : (
                          <li className="text-muted-foreground text-[11px] italic">
                            {language === 'hi' ? 'आंखों के संपर्क से बचाएं। बाहरी उपयोग हेतु।' : 'For external use only. Avoid contact with eyes.'}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* CASE C: Non-Food Items (Electrical goods, Household goods, Other) -> Technical Specifications & Safety Card */}
              {aiAnalysis && aiAnalysis.category !== 'Packaged food' && aiAnalysis.category !== 'Personal care' && (
                <div className="mb-5 overflow-hidden rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4 md:p-5 shadow-xs" data-testid="box-technical-specs-card">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-500/15 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-xl bg-sky-600 text-white shadow-sm">
                        {aiAnalysis.category === 'Electrical goods' ? <Zap size={18} /> : <Cpu size={18} />}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                            {language === 'hi' ? 'तकनीकी विनिर्देश व सुरक्षा मानक' : 'Technical Specifications & Safety Compliance'}
                          </h4>
                          <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                            {aiAnalysis.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {language === 'hi' ? 'विद्युत/घरेलू उत्पाद विनिर्देश, ISI/BIS मानक व सुरक्षा सावधानियां' : 'Product specifications, statutory BIS/ISI standards & safety notices'}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-xl bg-sky-600/15 px-2.5 py-1 text-xs font-semibold text-sky-800 dark:text-sky-200">
                      {language === 'hi' ? 'गैर-खाद्य वस्तु (Non-Food)' : 'Non-Food Commodity'}
                    </span>
                  </div>

                  {/* Technical specs grid */}
                  {aiAnalysis.technicalSafetyReport?.technicalSpecs && aiAnalysis.technicalSafetyReport.technicalSpecs.length > 0 && (
                    <div className="mt-3.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block mb-1.5">
                        {language === 'hi' ? 'उत्पाद विनिर्देश (Specifications)' : 'Detected Product Specifications'}
                      </span>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {aiAnalysis.technicalSafetyReport.technicalSpecs.map((spec, idx) => (
                          <div key={idx} className="rounded-xl border border-border/80 bg-card p-2.5 shadow-xs">
                            <span className="font-mono text-[10px] uppercase text-muted-foreground block">{spec.label}</span>
                            <span className="text-xs font-semibold text-foreground mt-0.5 block">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Safety Warnings & Certification Marks */}
                  <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
                    {/* Safety Warnings */}
                    <div className="rounded-xl border border-border/70 bg-card/90 p-3 text-xs leading-5">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/90 border-b border-border/50 pb-1.5 mb-2">
                        <AlertTriangle size={14} className="text-amber-500" />
                        <span>{language === 'hi' ? 'सुरक्षा चेतावनियां (Safety Warnings)' : 'Safety & Hazard Warnings'}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                        {aiAnalysis.technicalSafetyReport?.safetyWarnings && aiAnalysis.technicalSafetyReport.safetyWarnings.length > 0 ? (
                          aiAnalysis.technicalSafetyReport.safetyWarnings.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))
                        ) : (
                          <li>{language === 'hi' ? 'घरेलू उपयोग हेतु मानक विनिर्देश।' : 'Standard domestic use specifications declared.'}</li>
                        )}
                      </ul>
                    </div>

                    {/* Certification Marks & Precautions */}
                    <div className="rounded-xl border border-border/70 bg-card/90 p-3 text-xs leading-5">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground/90 border-b border-border/50 pb-1.5 mb-2">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>{language === 'hi' ? 'मानक प्रमाणीकरण व सावधानियां' : 'Certification & Precautions'}</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px]">
                        {aiAnalysis.technicalSafetyReport?.certificationMarks && aiAnalysis.technicalSafetyReport.certificationMarks.length > 0 ? (
                          aiAnalysis.technicalSafetyReport.certificationMarks.map((m, idx) => (
                            <li key={idx} className="font-medium text-foreground/90">{m}</li>
                          ))
                        ) : (
                          <li>{language === 'hi' ? 'विधिक मापविज्ञान नियम, 2011 का अनुपालन आवश्यक।' : 'Compliance with Legal Metrology Rules, 2011 mandatory.'}</li>
                        )}
                        {aiAnalysis.technicalSafetyReport?.precautions?.map((p, idx) => (
                          <li key={`p-${idx}`}>{p}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Legal Metrology Declarations Intelligence Card */}
              {aiAnalysis && (
                <div className="mb-5 overflow-hidden rounded-2xl border border-secondary/30 bg-secondary/5 p-4 md:p-5" data-testid="box-ai-summary-card">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-secondary/15 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-lg bg-secondary text-secondary-foreground shadow-sm">
                        <Sparkles size={15} />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">
                          {language === 'hi' ? 'विधिक मापविज्ञान निष्कर्ष (Rule 6, 2011)' : 'Legal Metrology Intelligence (Rule 6, 2011)'}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          {language === 'hi' ? 'विधिक मापविज्ञान (पैक वस्तुएं) नियम, 2011' : 'Prescribed under Legal Metrology Rules, 2011'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-secondary/20 px-2.5 py-1 text-[11px] font-semibold text-secondary">
                        ✓ {language === 'hi' ? 'फ़ॉर्म में स्वतः भरा गया' : 'Auto-filled into form'}
                      </span>
                      {photo && (
                        <button
                          type="button"
                          onClick={() => triggerAiVision(photo.dataUrl)}
                          disabled={aiRunning}
                          className="inline-flex items-center gap-1 rounded-lg border border-secondary/30 bg-card px-2.5 py-1 text-[11px] font-semibold text-secondary hover:bg-secondary/10 disabled:opacity-50"
                          title={language === 'hi' ? 'एआई से पुनः स्कैन करें' : 'Re-run AI Analysis'}
                        >
                          <RefreshCw size={11} className={aiRunning ? 'animate-spin' : ''} />
                          {language === 'hi' ? 'पुनः विश्लेषण' : 'Re-analyze'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="mt-3 rounded-xl bg-card/80 p-3 text-xs leading-5 text-foreground/85 border border-border/60">
                    <span className="font-semibold text-secondary">{language === 'hi' ? 'सारांश: ' : 'Executive Summary: '}</span>
                    {aiAnalysis.summary}
                  </div>

                  {/* Extracted Key Declarations Badges */}
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-border/70 bg-card/90 p-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                        {language === 'hi' ? 'अधिकतम खुदरा मूल्य (MRP)' : 'MRP Declaration'}
                      </span>
                      <span className="text-xs font-semibold text-foreground mt-0.5 block">
                        {aiAnalysis.mrp ? <span className="text-secondary font-bold">{aiAnalysis.mrp}</span> : <span className="text-destructive">{language === 'hi' ? 'अनुपस्थित (उल्लंघन)' : 'Not detected (Violation)'}</span>}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/90 p-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                        {language === 'hi' ? 'इकाई विक्रय मूल्य (USP)' : 'Unit Sale Price (USP)'}
                      </span>
                      <span className="text-xs font-semibold text-foreground mt-0.5 block">
                        {aiAnalysis.unitSalePrice || (language === 'hi' ? 'लागू नहीं / नहीं मिला' : 'Not detected')}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/90 p-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                        {language === 'hi' ? 'शुद्ध मात्रा (Net Qty)' : 'Net Quantity'}
                      </span>
                      <span className="text-xs font-semibold text-foreground mt-0.5 block">
                        {aiAnalysis.netQuantity ? <span className="text-secondary font-bold">{aiAnalysis.netQuantity}</span> : <span className="text-destructive">{language === 'hi' ? 'अनुपस्थित' : 'Not detected'}</span>}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/90 p-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                        {language === 'hi' ? 'विनिर्माण / पैकिंग तिथि' : 'Date Marking'}
                      </span>
                      <span className="text-xs font-semibold text-foreground mt-0.5 block">
                        {aiAnalysis.dateMarking || (language === 'hi' ? 'अनुपस्थित' : 'Not detected')}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border/70 bg-card/90 p-2.5 sm:col-span-2">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
                        {language === 'hi' ? 'निर्माता / पैकर विवरण' : 'Packer / Manufacturer Details'}
                      </span>
                      <span className="text-xs text-foreground/90 mt-0.5 block truncate" title={aiAnalysis.manufacturerPacker || ''}>
                        {aiAnalysis.manufacturerPacker || (language === 'hi' ? 'अनुपस्थित' : 'Not detected')}
                      </span>
                    </div>
                  </div>

                  {/* Missing Declarations Alert */}
                  {aiAnalysis.missingDeclarations.length > 0 && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                      <CircleAlert size={16} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">{language === 'hi' ? 'लापता अनिवार्य विधिक घोषणाएं (नियम 6): ' : 'Missing Mandatory Declarations (Rule 6): '}</span>
                        <span>{aiAnalysis.missingDeclarations.join(', ')}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className="field-label">{t.productName}</span><input required value={form.productName} onChange={(e) => update('productName', e.target.value)} placeholder={language === 'hi' ? 'उदा. शक्ति गोल्ड हल्दी पाउडर' : 'e.g. Shakti Gold Turmeric Powder'} className="field-input" data-testid="input-product-name" /></label>
                <label><span className="field-label">{t.category}</span><select value={form.category} onChange={(e) => update('category', e.target.value)} className="field-input" data-testid="select-category"><option value="Packaged food">{t.catFood}</option><option value="Personal care">{t.catPersonalCare}</option><option value="Household goods">{t.catHousehold}</option><option value="Electrical goods">{t.catElectrical}</option><option value="Textiles & Apparel">{language === 'hi' ? 'वस्त्र एवं परिधान' : 'Textiles & Apparel'}</option><option value="Other">{t.catOther}</option></select></label>
                <label><span className="field-label">{t.location}</span><input required value={form.location} onChange={(e) => update('location', e.target.value)} className="field-input" data-testid="input-location" /></label>
                <label><span className="field-label">{language === 'hi' ? 'निरीक्षण अधिकारी' : 'Officer name'}</span><input required value={form.officerName} onChange={(e) => update('officerName', e.target.value)} className="field-input" data-testid="input-officer-name" /></label>
                <label><span className="field-label">{language === 'hi' ? 'प्रारंभिक स्थिति' : 'Initial assessment'}</span><select value={form.status} onChange={(e) => update('status', e.target.value)} className="field-input" data-testid="select-assessment"><option value="pending">{t.pendingReview}</option><option value="compliant">{t.compliant}</option><option value="violation">{t.violation}</option></select></label>
                <div className="sm:col-span-2">
                  <span className="field-label">{t.capturedEvidence}</span>
                  {photo ? (
                    <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/25 p-3" data-testid="box-photo-preview">
                      <img src={photo.dataUrl} alt="Package photo selected" className="h-20 w-20 shrink-0 rounded-lg object-cover" data-testid="img-photo-preview" />
                      <div className="min-w-0 flex-1">
                        {aiRunning || ocrRunning ? (
                          <div className="space-y-2">
                            <p className="flex items-center gap-2 text-xs font-medium text-foreground/80"><LoaderCircle size={13} className="animate-spin text-secondary" />{ocrStatus}</p>
                            <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary transition-all duration-200" style={{ width: `${Math.max(6, Math.round(ocrProgress * 100))}%` }} /></div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            {aiAnalysis ? (
                              <span className="rounded-full bg-secondary/15 px-2.5 py-1 text-[11px] font-semibold text-secondary" data-testid="text-ai-analyzed">
                                ✨ {language === 'hi' ? 'एआई विज़न सत्यापित' : 'AI Vision Analyzed'}
                              </span>
                            ) : null}
                            <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-[11px] font-semibold text-secondary" data-testid="text-ocr-words">✓ {ocrResult?.words.length ?? 0} {language === 'hi' ? 'शब्द' : 'words'}</span>
                            <button
                              type="button"
                              onClick={() => triggerAiVision(photo.dataUrl)}
                              disabled={aiRunning}
                              className="inline-flex items-center gap-1 rounded-full border border-secondary/30 bg-card px-2.5 py-0.5 text-[10px] font-medium text-secondary hover:bg-secondary/10"
                            >
                              <Sparkles size={11} /> {language === 'hi' ? 'एआई पुनः चलाएं' : 'Re-run AI'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setLiveCameraScanning(true)}
                              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-medium text-foreground hover:bg-muted"
                              title={language === 'hi' ? 'लाइव कैमरा से दोबारा फोटो लें' : 'Retake photo with live camera'}
                            >
                              <Camera size={11} /> {language === 'hi' ? 'कैमरा से पुनः लें' : 'Retake Live'}
                            </button>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={removePhoto} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-destructive" aria-label={t.removePhoto} data-testid="button-remove-photo"><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setLiveCameraScanning(true)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-4 text-xs font-semibold text-secondary transition-colors hover:bg-secondary/20"
                        data-testid="button-open-live-cam-form"
                      >
                        <Camera size={16} />
                        {language === 'hi' ? 'लाइव कैमरा से फोटो लें' : 'Capture with Live Camera'}
                        <Sparkles size={14} className="text-accent" />
                      </button>

                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/15 px-4 py-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40" data-testid="label-upload-photo">
                        <ImagePlus size={16} />
                        {language === 'hi' ? 'फ़ाइल से फोटो चुनें' : 'Choose photo from file'}
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} data-testid="input-upload-photo" />
                      </label>
                    </div>
                  )}
                  {ocrError && <p className="mt-2 text-xs leading-5 text-destructive" data-testid="text-ocr-error">{ocrError}</p>}
                </div>
                <label className="sm:col-span-2"><span className="field-label">{t.labelText}</span><textarea required value={form.ocrText} onChange={(e) => update('ocrText', e.target.value)} rows={4} placeholder={language === 'hi' ? 'फोटो से स्वतः ट्रांसक्राइब हुआ, या पैकेज पर दिखाई देने वाली प्रमुख घोषणाएं दर्ज करें…' : 'Transcribed from the photo, or enter the key declarations visible on the package…'} className="field-input resize-none" data-testid="textarea-ocr-text" /></label>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                <p className="inline-flex max-w-xs items-start gap-2 text-xs leading-5 text-muted-foreground"><Sparkles size={14} className="mt-0.5 shrink-0 text-secondary" />{language === 'hi' ? 'नियम इंजन एमआरपी, यूनिट बिक्री मूल्य, शुद्ध मात्रा, विनिर्माण तिथि, उपभोक्ता सेवा और निर्माता विवरण की विधिक जांच करता है।' : 'The rule engine checks MRP, unit sale price, net quantity, date marking, consumer care and packer details. With a photo it also verifies font size, readability and placement.'}</p>
                <button disabled={createScan.isPending} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground disabled:opacity-60" data-testid="button-create-scan">{createScan.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <FileText size={16} />} {createScan.isPending ? t.savingScan : t.saveAndAnalyze}</button>
              </div>
            </form>
          )}
          {notice && <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary" data-testid="status-action-notice"><Check size={16} />{notice}</div>}
          {errorNotice && <div className="mt-3 flex items-start gap-2 rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive" data-testid="status-action-error"><CircleAlert size={16} className="mt-0.5 shrink-0" />{errorNotice}</div>}
          {reviewScan && (
            <ReviewCard
              scan={reviewScan}
              onSubmit={handleSubmit}
              submitting={submitScan.isPending}
              onDelete={(s) => handleDeleteScan({ preventDefault: () => {}, stopPropagation: () => {} } as any, s)}
            />
          )}
        </section>

        <section className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-4 border-b border-[var(--border)] pb-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--text)]">{t.recentScans}</h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">{scanQuery.data?.length ?? 0} {language === 'hi' ? 'रिकॉर्ड्स' : 'records'}</span>
          </div>

          {/* Category Filter Pills */}
          <div className="mb-3 flex flex-wrap gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', labelEn: 'All Categories', labelHi: 'सभी श्रेणियां' },
              { id: 'Packaged food', labelEn: 'Packaged Food', labelHi: 'खाद्य सामग्री' },
              { id: 'Personal care', labelEn: 'Personal Care', labelHi: 'व्यक्तिगत देखभाल' },
              { id: 'Household goods', labelEn: 'Household Goods', labelHi: 'घरेलू वस्तुएं' },
              { id: 'Electrical goods', labelEn: 'Electrical Goods', labelHi: 'विद्युत उपकरण' },
              { id: 'Textiles & Apparel', labelEn: 'Textiles & Apparel', labelHi: 'वस्त्र एवं परिधान' },
              { id: 'Other', labelEn: 'Other', labelHi: 'अन्य' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-border bg-card text-muted-foreground hover:bg-muted'
                }`}
                data-testid={`filter-category-${cat.id.replaceAll(' ', '-')}`}
              >
                {language === 'hi' ? cat.labelHi : cat.labelEn}
              </button>
            ))}
          </div>

          <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_145px]">
            <label className="relative block"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t.searchPlaceholder} className="field-input pl-9" data-testid="input-search-scans" /></label>
            <label className="relative block"><Filter size={14} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" /><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="field-input pl-8" data-testid="select-filter-status"><option value="all">{t.filterAll}</option><option value="pending">{t.filterPending}</option><option value="compliant">{t.filterCompliant}</option><option value="violation">{t.filterViolation}</option></select></label>
          </div>
          {scanQuery.isPending ? (
            <SkeletonRows />
          ) : scanQuery.isError ? (
            <ErrorState onRetry={() => scanQuery.refetch()} />
          ) : (scanQuery.data ?? []).filter((s) => categoryFilter === 'all' || s.category === categoryFilter).length ? (
            <ScanTable
              scans={(scanQuery.data ?? []).filter((s) => categoryFilter === 'all' || s.category === categoryFilter)}
              onDelete={handleDeleteScan}
              showCategory={true}
              showLocation={true}
            />
          ) : (
            <EmptyState title={t.noScansYet} body={t.noScansSub} />
          )}
        </section>
      </div>
    </div>
  </div>
  );
}

function ReviewCard({
  scan,
  onSubmit,
  submitting,
  onDelete,
}: {
  scan: Scan;
  onSubmit: () => void;
  submitting: boolean;
  onDelete?: (scan: Scan) => void;
}) {
  const { language, t } = useI18n();
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <div className="mt-6 space-y-4 rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5" data-testid="card-review-scan">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <span className="text-xs font-semibold text-[var(--indigo-600)] block">{t.reviewBannerTitle}</span>
          <h3 className="text-base font-semibold text-[var(--text)]">{scan.productName}</h3>
        </div>
        <Link
          href={`/scans/${scan.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--link)] hover:text-[var(--link-hover)]"
          data-testid="link-review-detail"
        >
          {t.viewDetails} <ArrowRight size={14} />
        </Link>
      </div>

      <VerdictPanel
        reference={scan.reference}
        productName={scan.productName}
        category={scan.category}
        status={scan.status}
        checks={scan.checks}
        ocrText={scan.ocrText}
        ocrDetails={scan.ocrDetails}
        imageUrl={scan.imageUrl}
        capturedAt={scan.capturedAt}
        officerName={scan.officerName}
        location={scan.location}
        evidenceHash={scan.evidenceHash}
        submitted={scan.submitted}
        onRecordFinding={onSubmit}
        isSubmitting={submitting}
        exportUrl={`${baseUrl}/api/scans/${scan.id}/report`}
        triggerSignatureAnimation={true}
      />
    </div>
  );
}