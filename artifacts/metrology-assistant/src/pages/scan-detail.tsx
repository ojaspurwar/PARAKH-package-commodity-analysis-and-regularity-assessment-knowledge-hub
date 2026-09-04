import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Copy, Download, FileSpreadsheet, FileText, Gavel, LoaderCircle, MapPin, Send, ShieldAlert, ShieldCheck, Trash2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { getGetScanQueryKey, getGetScansQueryKey, useGetScan, useSubmitScan } from '@workspace/api-client-react';
import { CheckIcon, EmptyState, ErrorState, SkeletonRows, StatusPill, formatDateTime } from '@/components/scan-ui';
import { AnnotatedPhoto } from '@/components/annotated-photo';
import { FontReadabilityCard } from '@/components/font-readability-card';
import { CategoryComplianceSection } from '@/components/category-compliance-section';
import { getTranslatedCheckLabel, getTranslatedCheckStatus, useI18n } from '@/lib/i18n';

export default function ScanDetailPage() {
  const { language, t } = useI18n();
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const scanId = Number(params.id);
  const scanQuery = useGetScan(scanId);
  const submitScan = useSubmitScan();
  const [notice, setNotice] = useState('');
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!Number.isFinite(scanId)) return <EmptyState title={language === 'hi' ? 'साक्ष्य संदर्भ अमान्य' : 'Scan reference not recognised'} body={language === 'hi' ? 'इस लिंक में साक्ष्य आईडी मान्य नहीं है।' : 'The evidence ID in this link is not valid.'} />;
  if (scanQuery.isPending) return <SkeletonRows count={2} />;
  if (scanQuery.isError || !scanQuery.data) return <ErrorState onRetry={() => scanQuery.refetch()} />;

  const scan = scanQuery.data;
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  const handleSubmit = () => {
    submitScan.mutate({ id: scan.id, data: { submitted: true } }, {
      onSuccess: (result) => {
        queryClient.setQueryData(getGetScanQueryKey(scan.id), result);
        queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
        setNotice(language === 'hi' ? 'रिकॉर्ड सफलतापूर्वक सबमिट किया गया। अब यह सुपरवाइज़र कतार में दिखाई देगा।' : 'Record submitted successfully. It is now visible to the supervisor queue.');
      },
    });
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(t.deleteConfirm);
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/scans/${scan.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete scan');
      await queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
      setLocation('/');
    } catch (err: any) {
      alert(language === 'hi' ? 'हटाने में विफल: ' + (err.message || '') : 'Failed to delete: ' + (err.message || ''));
      setIsDeleting(false);
    }
  };

  const failedChecks = scan.checks.filter((c) => c.status === 'failed');
  const reviewChecks = scan.checks.filter((c) => c.status === 'review');

  const copyLegalMemo = () => {
    const memo = [
      `OFFICE OF THE CONTROLLER OF LEGAL METROLOGY`,
      `INSPECTION & SEIZURE MEMO / NOTICE UNDER RULE 19-21 & SECTION 36`,
      `================================================================`,
      `Reference Number  : ${scan.reference}`,
      `Commodity Name    : ${scan.productName} (${scan.category})`,
      `Inspection Date   : ${new Date(scan.capturedAt).toLocaleString('en-IN')}`,
      `Location / Outlet : ${scan.location}`,
      `Inspecting Officer: ${scan.officerName}`,
      `Barcode / EAN     : ${scan.barcode || 'N/A'}`,
      `Evidence Hash     : SHA-256 [${scan.evidenceHash || 'Generated on export'}]`,
      ``,
      `VIOLATIONS DETECTED UNDER LEGAL METROLOGY (PACKAGED COMMODITIES) RULES, 2011:`,
      ...failedChecks.map((c, i) => `${i + 1}. [${c.label}]: ${c.note} (Detected value: '${c.value}')`),
      ...(reviewChecks.length ? ['', `ITEMS REQUIRING VERIFICATION:`, ...reviewChecks.map((c, i) => `${i + 1}. [${c.label}]: ${c.note}`)] : []),
      ``,
      `STATUTORY CITATION:`,
      `Contravention of Rule 6/7/11-13 punishable under Section 36 of the Legal Metrology Act, 2009.`,
      `Compounding of offence available for eligible first-time infractions under Rule 32A.`,
      `================================================================`,
    ].join('\n');

    navigator.clipboard.writeText(memo).then(() => {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 3000);
    });
  };

  return (
    <div className="space-y-7">
      <div className="appear flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-scans"><ArrowLeft size={16} /> {t.backToScans}</Link>
        <span className="font-mono text-[11px] uppercase tracking-[.16em] text-muted-foreground">{t.evidenceRecord} / {scan.reference}</span>
      </div>
      <section className="appear delay-1 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex flex-col justify-between gap-6 border-b border-border bg-primary px-6 py-7 text-primary-foreground md:flex-row md:items-end md:px-8">
          <div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-primary-foreground/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.15em] text-primary-foreground/65">{scan.source === 'ecommerce' ? (language === 'hi' ? 'ऑनलाइन उत्पाद' : 'Online product') : (language === 'hi' ? 'फ़ील्ड कैप्चर' : 'Field capture')}</span><span className="font-mono text-[10px] text-primary-foreground/45">{scan.reference}</span></div><h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-.05em] md:text-4xl">{scan.productName}</h1><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary-foreground/60"><span>{scan.category}</span><span className="inline-flex items-center gap-1"><MapPin size={13} />{scan.location}</span><span>{language === 'hi' ? `निरीक्षक: ${scan.officerName}` : `Captured by ${scan.officerName}`}</span></div></div>
          <StatusPill status={scan.status} submitted={scan.submitted} />
        </div>
        <div className="grid divide-y divide-border md:grid-cols-[1.1fr_1fr] md:divide-x md:divide-y-0">
          <div className="min-h-[330px] bg-muted/20 p-4 md:p-6">
            {scan.imageUrl ? (
              <AnnotatedPhoto
                imageUrl={scan.imageUrl}
                ocrDetails={scan.ocrDetails}
                checks={scan.checks}
                productName={scan.productName}
              />
            ) : (
              <div className="field-grid flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center" data-testid="state-no-image">
                <span className="grid size-12 place-items-center rounded-2xl bg-card text-muted-foreground">
                  <FileText size={21} />
                </span>
                <p className="mt-4 text-sm font-semibold">{t.noImageAttached}</p>
                <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">{t.noImageSub}</p>
              </div>
            )}
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">{t.reviewTrail}</p>
                <h2 className="mt-1 text-lg font-semibold">{t.complianceChecks}</h2>
              </div>
              <ShieldCheck size={21} className="text-secondary" />
            </div>
            <div className="mt-5 space-y-2">
              {scan.checks.map((check) => (
                <div key={check.key} className="rounded-xl border border-border p-3.5" data-testid={`check-${check.key}`}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5"><CheckIcon status={check.status} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold">{getTranslatedCheckLabel(check.key, check.label, t)}</p>
                        <span className="font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">{getTranslatedCheckStatus(check.status, language)}</span>
                      </div>
                      <p className="mt-1 text-xs text-foreground/70">{check.value}</p>
                      <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{check.note}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category-Specific Statutory Requirements Section */}
      <CategoryComplianceSection
        category={scan.category}
        productName={scan.productName}
        ocrText={scan.ocrText}
        checks={scan.checks}
      />

      {/* Font Size & Readability Analysis Card */}
      <FontReadabilityCard
        checks={scan.checks}
        ocrDetails={scan.ocrDetails}
        ocrText={scan.ocrText}
      />

      <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
        <div className="space-y-7">
          <section className="appear delay-2 rounded-2xl border border-border bg-card p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.machineTranscription}</p>
                <h2 className="mt-1 text-lg font-semibold">{t.labelTextCaptured}</h2>
              </div>
              {scan.ocrDetails ? (
                <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] text-muted-foreground" data-testid="text-ocr-meta">
                  {scan.ocrDetails.engine} · {scan.ocrDetails.words.length} {language === 'hi' ? 'शब्द' : 'words'} · {scan.ocrDetails.imageWidth}×{scan.ocrDetails.imageHeight}
                </span>
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] text-muted-foreground">OCR</span>
              )}
            </div>
            <div className="mt-5 whitespace-pre-wrap rounded-xl bg-muted/45 p-4 font-mono text-xs leading-6 text-foreground/75" data-testid="text-ocr">
              {scan.ocrText || t.noOcrText}
            </div>
          </section>

          {/* Statutory Notice & Enforcement Memo Block */}
          {failedChecks.length > 0 && (
            <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 md:p-7">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="text-destructive size-5" />
                  <h3 className="font-semibold text-destructive text-base">{t.enforcementNoticeTitle}</h3>
                </div>
                <button
                  type="button"
                  onClick={copyLegalMemo}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-card px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  {copiedMemo ? <Check size={13} /> : <Copy size={13} />}
                  {copiedMemo ? t.copied : t.copyNoticeMemo}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-5">
                {t.enforcementNoticeDesc}
              </p>
              <div className="mt-3 space-y-1.5 border-t border-destructive/15 pt-3">
                {failedChecks.map((c) => (
                  <p key={c.key} className="text-xs text-foreground/85">
                    • <strong className="font-medium text-destructive">{getTranslatedCheckLabel(c.key, c.label, t)}:</strong> {c.note}
                  </p>
                ))}
              </div>
            </section>
          )}
        </div>

        <section className="appear delay-3 rounded-2xl border border-border bg-card p-6 md:p-7">
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.recordControls}</p>
          <h2 className="mt-1 text-lg font-semibold">{t.inspectionReports}</h2>

          <div className="mt-5 flex items-center gap-3 rounded-xl bg-muted/45 p-4">
            <span className={`grid size-9 place-items-center rounded-full ${scan.submitted ? 'bg-secondary/10 text-secondary' : 'bg-accent/30 text-foreground'}`}>
              {scan.submitted ? <Check size={17} /> : <FileText size={17} />}
            </span>
            <div>
              <p className="text-sm font-semibold">{scan.submitted ? t.submittedToRegister : t.awaitingSubmission}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(scan.capturedAt)}</p>
            </div>
          </div>

          {scan.evidenceHash && (
            <div className="mt-4 rounded-xl bg-muted/45 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">{t.evidenceHashLabel}</p>
              <p className="mt-2 break-all font-mono text-[11px] leading-5 text-foreground/70" data-testid="text-evidence-hash">
                {scan.evidenceHash}
              </p>
            </div>
          )}

          {notice && (
            <p className="mt-4 rounded-xl bg-secondary/10 px-3 py-3 text-xs font-medium leading-5 text-secondary" data-testid="status-submit-notice">
              {notice}
            </p>
          )}

          {/* Court-Admissible PDF Report */}
          <a
            href={`${baseUrl}/api/scans/${scan.id}/report`}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            data-testid="link-download-report"
          >
            <Download size={16} /> {t.downloadPdfReport}
          </a>

          {/* Editable Formats */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a
              href={`${baseUrl}/api/scans/${scan.id}/export?format=csv`}
              download={`parakh-${scan.reference.toLowerCase()}.csv`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold hover:bg-muted"
            >
              <FileSpreadsheet size={15} /> {t.exportCsv}
            </a>
            <a
              href={`${baseUrl}/api/scans/${scan.id}/export?format=json`}
              download={`parakh-${scan.reference.toLowerCase()}.json`}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold hover:bg-muted"
            >
              <FileText size={15} /> {t.exportJson}
            </a>
          </div>

          {!scan.submitted ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitScan.isPending}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-60"
              data-testid="button-submit-detail"
            >
              {submitScan.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />} {t.submitEvidenceToRegister}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setLocation('/dashboard')}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted"
              data-testid="button-view-dashboard"
            >
              {language === 'hi' ? 'सुपरवाइज़र डैशबोर्ड देखें' : 'View supervisor dashboard'} <ArrowLeft size={15} className="rotate-180" />
            </button>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
              data-testid="button-delete-record"
            >
              {isDeleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
              {isDeleting ? t.deleting : t.deleteRecord}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}