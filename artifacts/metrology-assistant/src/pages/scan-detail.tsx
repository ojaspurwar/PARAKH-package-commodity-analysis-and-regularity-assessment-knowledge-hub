import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Copy, Download, FileSpreadsheet, FileText, LoaderCircle, ShieldAlert, Trash2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { getGetScanQueryKey, getGetScansQueryKey, useGetScan, useSubmitScan } from '@workspace/api-client-react';
import { EmptyState, ErrorState, SkeletonRows, formatDateTime } from '@/components/scan-ui';
import { VerdictPanel } from '@/components/verdict-panel';
import { CategoryComplianceSection } from '@/components/category-compliance-section';
import { getTranslatedCheckLabel, useI18n } from '@/lib/i18n';

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

  if (!Number.isFinite(scanId)) {
    return (
      <EmptyState
        title={language === 'hi' ? 'साक्ष्य संदर्भ अमान्य' : 'Scan reference not recognised'}
        body={language === 'hi' ? 'इस लिंक में साक्ष्य आईडी मान्य नहीं है।' : 'The evidence ID in this link is not valid.'}
      />
    );
  }
  if (scanQuery.isPending) return <SkeletonRows count={2} />;
  if (scanQuery.isError || !scanQuery.data) return <ErrorState onRetry={() => scanQuery.refetch()} />;

  const scan = scanQuery.data;
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  const handleSubmit = async () => {
    return new Promise<void>((resolve, reject) => {
      submitScan.mutate(
        { id: scan.id, data: { submitted: true } },
        {
          onSuccess: (result) => {
            queryClient.setQueryData(getGetScanQueryKey(scan.id), result);
            queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
            setNotice(
              language === 'hi'
                ? 'रिकॉर्ड सफलतापूर्वक सबमिट किया गया। अब यह सुपरवाइज़र कतार में दिखाई देगा।'
                : 'Finding recorded successfully. The evidence record is now entered into the supervisor queue.'
            );
            resolve();
          },
          onError: (err) => reject(err),
        }
      );
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
    <div className="portal-container py-6 space-y-6" data-testid="page-scan-detail">
      {/* Back button and breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--link)] hover:text-[var(--link-hover)]"
          data-testid="link-back-scans"
        >
          <ArrowLeft size={14} /> {t.backToScans}
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs text-[var(--text-muted)]">
          <span>{t.evidenceRecord}:</span>
          <span className="font-semibold text-[var(--text)]">{scan.reference}</span>
        </div>
      </div>

      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'कमोडिटी निरीक्षण साक्ष्य एवं सत्यापन विवरण' : 'Commodity Inspection Evidence & Verification Detail'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        {/* Notice if submitted */}
        {notice && (
          <div className="rounded-[var(--r-md)] border-[1.5px] border-green-br bg-green-t p-3 text-xs font-medium text-green-act">
            {notice}
          </div>
        )}

        {/* The 5-part Verdict Panel per AGENTS.md §7 */}
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
          onRecordFinding={handleSubmit}
          isSubmitting={submitScan.isPending}
          exportUrl={`${baseUrl}/api/scans/${scan.id}/report`}
          triggerSignatureAnimation={true}
        />

        {/* Category-Specific Statutory Deep Dive (Food FSSAI / Electronics ISI) */}
        <CategoryComplianceSection
          category={scan.category}
          productName={scan.productName}
          ocrText={scan.ocrText}
          checks={scan.checks}
        />

        {/* Machine OCR Transcription Text */}
        {scan.ocrText && (
          <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 space-y-2">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <h4 className="text-xs font-semibold text-[var(--text)]">
                {language === 'hi' ? 'ऑप्टिकल कैरेक्टर रिकॉग्निशन (OCR) ट्रांसक्रिप्शन' : 'Machine OCR Packaging Transcription'}
              </h4>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                {scan.ocrDetails ? `${scan.ocrDetails.words.length} words` : 'Raw text'}
              </span>
            </div>
            <div className="whitespace-pre-wrap rounded-[var(--r-sm)] bg-[var(--bg-sunken)] p-3 font-mono text-xs leading-6 text-[var(--text-muted)]" data-testid="text-ocr">
              {scan.ocrText}
            </div>
          </div>
        )}

        {/* Statutory Notice & Enforcement Memo Block (for Court & Seizure Memos) */}
        {failedChecks.length > 0 && (
          <div className="rounded-[var(--r-md)] border-[1.5px] border-rose-br bg-rose-t p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="text-rose-act size-5" />
                <h3 className="font-semibold text-rose-act text-sm">{t.enforcementNoticeTitle}</h3>
              </div>
              <button
                type="button"
                onClick={copyLegalMemo}
                className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border-[1.5px] border-rose-br bg-white px-3 py-1 text-xs font-semibold text-rose-act hover:bg-rose-t"
              >
                {copiedMemo ? <Check size={13} /> : <Copy size={13} />}
                {copiedMemo ? t.copied : t.copyNoticeMemo}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-5">
              {t.enforcementNoticeDesc}
            </p>
            <div className="space-y-1 border-t border-rose-br/30 pt-3">
              {failedChecks.map((c) => (
                <p key={c.key} className="text-xs text-[var(--text)]">
                  • <strong className="font-semibold text-rose-act">{getTranslatedCheckLabel(c.key, c.label, t)}:</strong> {c.note}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Secondary Export & Administrative Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`${baseUrl}/api/scans/${scan.id}/export?format=csv`}
              download={`parakh-${scan.reference.toLowerCase()}.csv`}
              className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--link)] hover:bg-[var(--bg-sunken)]"
            >
              <FileSpreadsheet size={14} /> {t.exportCsv}
            </a>
            <a
              href={`${baseUrl}/api/scans/${scan.id}/export?format=json`}
              download={`parakh-${scan.reference.toLowerCase()}.json`}
              className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--link)] hover:bg-[var(--bg-sunken)]"
            >
              <FileText size={14} /> {t.exportJson}
            </a>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] border border-rose-br bg-white px-3 py-1.5 text-xs font-semibold text-rose-act hover:bg-rose-t disabled:opacity-60"
            data-testid="button-delete-record"
          >
            {isDeleting ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {isDeleting ? t.deleting : t.deleteRecord}
          </button>
        </div>
      </div>
    </div>
  );
}
