import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Download, FileText, LoaderCircle, MapPin, Send, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useParams } from 'wouter';
import { getGetScanQueryKey, getGetScansQueryKey, useGetScan, useSubmitScan } from '@workspace/api-client-react';
import { CheckIcon, EmptyState, ErrorState, SkeletonRows, StatusPill, formatDateTime } from '@/components/scan-ui';

export default function ScanDetailPage() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const scanId = Number(params.id);
  const scanQuery = useGetScan(scanId);
  const submitScan = useSubmitScan();
  const [notice, setNotice] = useState('');

  if (!Number.isFinite(scanId)) return <EmptyState title="Scan reference not recognised" body="The evidence ID in this link is not valid." />;
  if (scanQuery.isPending) return <SkeletonRows count={2} />;
  if (scanQuery.isError || !scanQuery.data) return <ErrorState onRetry={() => scanQuery.refetch()} />;

  const scan = scanQuery.data;
  const handleSubmit = () => {
    submitScan.mutate({ id: scan.id, data: { submitted: true } }, {
      onSuccess: (result) => {
        queryClient.setQueryData(getGetScanQueryKey(scan.id), result);
        queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
        setNotice('Record submitted successfully. It is now visible to the supervisor queue.');
      },
    });
  };

  return (
    <div className="space-y-7">
      <div className="appear flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground" data-testid="link-back-scans"><ArrowLeft size={16} /> Back to scans</Link>
        <span className="font-mono text-[11px] uppercase tracking-[.16em] text-muted-foreground">Evidence record / {scan.reference}</span>
      </div>
      <section className="appear delay-1 overflow-hidden rounded-3xl border border-border bg-card">
        <div className="flex flex-col justify-between gap-6 border-b border-border bg-primary px-6 py-7 text-primary-foreground md:flex-row md:items-end md:px-8">
          <div><div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-primary-foreground/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[.15em] text-primary-foreground/65">{scan.source === 'ecommerce' ? 'Online product' : 'Field capture'}</span><span className="font-mono text-[10px] text-primary-foreground/45">{scan.reference}</span></div><h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-.05em] md:text-4xl">{scan.productName}</h1><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-primary-foreground/60"><span>{scan.category}</span><span className="inline-flex items-center gap-1"><MapPin size={13} />{scan.location}</span><span>Captured by {scan.officerName}</span></div></div>
          <StatusPill status={scan.status} submitted={scan.submitted} />
        </div>
        <div className="grid divide-y divide-border md:grid-cols-[1.05fr_1fr] md:divide-x md:divide-y-0">
          <div className="min-h-[330px] bg-muted/40 p-6 md:p-8">
            {scan.imageUrl ? <img src={scan.imageUrl} alt={`Evidence for ${scan.productName}`} className="h-full min-h-[260px] w-full rounded-xl object-cover" data-testid="img-scan-evidence" /> : <div className="field-grid flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-dashed border-border text-center" data-testid="state-no-image"><span className="grid size-12 place-items-center rounded-2xl bg-card text-muted-foreground"><FileText size={21} /></span><p className="mt-4 text-sm font-semibold">No package image attached</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">The structured label transcription below remains part of this evidence record.</p></div>}
          </div>
          <div className="p-6 md:p-8"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">Review trail</p><h2 className="mt-1 text-lg font-semibold">Compliance checks</h2></div><ShieldCheck size={21} className="text-secondary" /></div><div className="mt-5 space-y-2">{scan.checks.map((check) => <div key={check.key} className="rounded-xl border border-border p-3.5" data-testid={`check-${check.key}`}><div className="flex items-start gap-3"><span className="mt-0.5"><CheckIcon status={check.status} /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm font-semibold">{check.label}</p><span className="font-mono text-[10px] uppercase tracking-[.1em] text-muted-foreground">{check.status}</span></div><p className="mt-1 text-xs text-foreground/70">{check.value}</p><p className="mt-2 text-[11px] leading-5 text-muted-foreground">{check.note}</p></div></div></div>)}</div></div>
        </div>
      </section>

      <div className="grid gap-7 lg:grid-cols-[1.2fr_.8fr]">
        <section className="appear delay-2 rounded-2xl border border-border bg-card p-6 md:p-7"><div className="flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Machine transcription</p><h2 className="mt-1 text-lg font-semibold">Label text captured</h2></div>{scan.ocrDetails ? <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] text-muted-foreground" data-testid="text-ocr-meta">{scan.ocrDetails.engine} · {scan.ocrDetails.words.length} words · {scan.ocrDetails.imageWidth}×{scan.ocrDetails.imageHeight}</span> : <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] text-muted-foreground">OCR</span>}</div><div className="mt-5 whitespace-pre-wrap rounded-xl bg-muted/45 p-4 font-mono text-xs leading-6 text-foreground/75" data-testid="text-ocr">{scan.ocrText || 'No OCR text was recorded for this scan.'}</div></section>
        <section className="appear delay-3 rounded-2xl border border-border bg-card p-6 md:p-7"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Record controls</p><h2 className="mt-1 text-lg font-semibold">Submission status</h2><div className="mt-5 flex items-center gap-3 rounded-xl bg-muted/45 p-4"><span className={`grid size-9 place-items-center rounded-full ${scan.submitted ? 'bg-secondary/10 text-secondary' : 'bg-accent/30 text-foreground'}`}>{scan.submitted ? <Check size={17} /> : <FileText size={17} />}</span><div><p className="text-sm font-semibold">{scan.submitted ? 'Submitted to database' : 'Awaiting submission'}</p><p className="mt-1 text-xs text-muted-foreground">{formatDateTime(scan.capturedAt)}</p></div></div>{scan.evidenceHash && <div className="mt-4 rounded-xl bg-muted/45 p-4"><p className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground">Evidence hash</p><p className="mt-2 break-all font-mono text-[11px] leading-5 text-foreground/70" data-testid="text-evidence-hash">SHA-256 · {scan.evidenceHash}</p></div>}{notice && <p className="mt-4 rounded-xl bg-secondary/10 px-3 py-3 text-xs font-medium leading-5 text-secondary" data-testid="status-submit-notice">{notice}</p>}<a href={`${import.meta.env.BASE_URL.replace(/\/$/, '')}/api/scans/${scan.id}/report`} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted" data-testid="link-download-report"><Download size={16} /> Download PDF report</a>{!scan.submitted ? <button type="button" onClick={handleSubmit} disabled={submitScan.isPending} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60" data-testid="button-submit-detail">{submitScan.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />} Submit evidence</button> : <button type="button" onClick={() => setLocation('/dashboard')} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted" data-testid="button-view-dashboard">View supervisor dashboard <ArrowLeft size={15} className="rotate-180" /></button>}</section>
      </div>
    </div>
  );
}