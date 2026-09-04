import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Camera, Check, ChevronDown, FileText, Filter, LoaderCircle, Search, Send, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { getGetScanQueryKey, getGetScansQueryKey, useCreateScan, useGetScans, useSubmitScan } from '@workspace/api-client-react';
import type { Scan, ScanInput } from '@workspace/api-client-react';
import { appConfig } from '@/config';
import { EmptyState, ErrorState, ScanRow, SkeletonRows, StatusPill } from '@/components/scan-ui';

const defaultChecks: ScanInput['checks'] = [
  { key: 'mrp', label: 'Maximum retail price', value: 'Observed on pack', status: 'review', note: 'Verify printed MRP against sale price.' },
  { key: 'unit', label: 'Net quantity', value: 'Captured from label', status: 'review', note: 'Check unit and declaration format.' },
  { key: 'packer', label: 'Packer details', value: 'Captured from label', status: 'review', note: 'Address and customer care details required.' },
];

export default function HomePage() {
  const queryClient = useQueryClient();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [started, setStarted] = useState(false);
  const [reviewScan, setReviewScan] = useState<Scan | null>(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'compliant' | 'violation' | 'pending'>('all');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState<ScanInput>({
    productName: '',
    category: 'Packaged food',
    officerName: appConfig.defaultOfficer,
    location: appConfig.defaultLocation,
    status: 'pending',
    imageUrl: null,
    ocrText: '',
    checks: defaultChecks,
  });

  const scanQuery = useGetScans({ search: search || undefined, status: status === 'all' ? undefined : status });
  const createScan = useCreateScan();
  const submitScan = useSubmitScan();

  const update = (key: keyof ScanInput, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    createScan.mutate({ data: form }, {
      onSuccess: (scan) => {
        setReviewScan(scan);
        setStarted(false);
        setNotice('Evidence captured. Review the checks before submitting.');
        queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
      },
    });
  };
  const handleSubmit = () => {
    if (!reviewScan) return;
    submitScan.mutate({ id: reviewScan.id, data: { submitted: true } }, {
      onSuccess: (scan) => {
        setReviewScan(scan);
        setNotice('Scan submitted to the supervisor queue.');
        queryClient.setQueryData(getGetScanQueryKey(scan.id), scan);
        queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
      },
    });
  };

  return (
    <div className="space-y-8">
      <section className="appear relative overflow-hidden rounded-3xl bg-primary px-6 py-7 text-primary-foreground shadow-xl shadow-primary/10 md:px-9 md:py-9">
        <div className="absolute right-[-80px] top-[-110px] size-[300px] rounded-full border border-primary-foreground/10" />
        <div className="absolute right-[-24px] top-[-54px] size-[190px] rounded-full border border-primary-foreground/10" />
        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.16em] text-primary-foreground/75"><span className="size-1.5 rounded-full bg-accent" />Field desk</span>
              <span className="font-mono text-[10px] uppercase tracking-[.16em] text-primary-foreground/45">जयपुर • 14 OCT 2024</span>
            </div>
            <h1 className="mt-5 max-w-xl text-3xl font-semibold tracking-[-.045em] md:text-5xl">Inspect with confidence.<br /><span className="text-accent">Record what matters.</span></h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-primary-foreground/65">A clear, defensible record of every packaged good you inspect — from first capture to final submission.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-primary-foreground/15 bg-primary-foreground/10 p-1 lg:self-end">
            <button type="button" onClick={() => setLanguage('en')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${language === 'en' ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/55'}`} data-testid="button-language-en">English</button>
            <button type="button" onClick={() => setLanguage('hi')} className={`rounded-lg px-3 py-2 text-xs font-semibold ${language === 'hi' ? 'bg-accent text-accent-foreground' : 'text-primary-foreground/55'}`} data-testid="button-language-hi">हिन्दी</button>
          </div>
        </div>
        <div className="relative mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-primary-foreground/10 pt-5 text-xs text-primary-foreground/55">
          <span className="inline-flex items-center gap-2"><ShieldCheck size={14} className="text-accent" /> Evidence-first workflow</span>
          <span className="inline-flex items-center gap-2"><Camera size={14} className="text-accent" /> Works with intermittent network</span>
          <Link href="/dashboard" className="inline-flex items-center gap-2 font-semibold text-accent hover:underline" data-testid="link-open-dashboard">Open supervisor view <ArrowRight size={14} /></Link>
        </div>
      </section>

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.5fr)_minmax(350px,1fr)]">
        <section className="appear delay-1 min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Capture desk</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">{language === 'hi' ? 'नया निरीक्षण शुरू करें' : 'Start a new inspection'}</h2></div>
            {!started && <button type="button" onClick={() => setStarted(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5" data-testid="button-start-scan"><Camera size={16} /> Start scan</button>}
          </div>
          {!started ? (
            <div className="field-grid relative overflow-hidden rounded-2xl border border-border bg-card px-6 py-12 md:px-10">
              <div className="relative max-w-md">
                <span className="grid size-12 place-items-center rounded-2xl bg-accent/25 text-foreground"><Camera size={23} /></span>
                <h3 className="mt-5 text-lg font-semibold">Ready when you are</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Capture the package, confirm the label details, and submit a clean evidence trail in under a minute.</p>
                <button type="button" onClick={() => setStarted(true)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:gap-3 transition-all" data-testid="button-begin-capture">Begin capture <ArrowRight size={16} /></button>
              </div>
              <div className="absolute bottom-6 right-8 hidden font-mono text-[10px] uppercase leading-5 tracking-[.14em] text-muted-foreground/55 md:block">/01<br />capture<br /><span className="text-secondary">● live</span></div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="rounded-2xl border border-border bg-card p-5 md:p-6" data-testid="form-new-scan">
              <div className="mb-5 flex items-center justify-between border-b border-border pb-4"><div><p className="font-mono text-[10px] uppercase tracking-[.16em] text-secondary">Capture mode active</p><p className="mt-1 text-sm text-muted-foreground">Enter what the label tells you.</p></div><button type="button" onClick={() => setStarted(false)} className="text-xs font-semibold text-muted-foreground hover:text-foreground" data-testid="button-cancel-capture">Cancel</button></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className="field-label">Product name</span><input required value={form.productName} onChange={(e) => update('productName', e.target.value)} placeholder="e.g. Shakti Gold Turmeric Powder" className="field-input" data-testid="input-product-name" /></label>
                <label><span className="field-label">Category</span><select value={form.category} onChange={(e) => update('category', e.target.value)} className="field-input" data-testid="select-category"><option>Packaged food</option><option>Personal care</option><option>Household goods</option><option>Electrical goods</option><option>Other</option></select></label>
                <label><span className="field-label">Inspection location</span><input required value={form.location} onChange={(e) => update('location', e.target.value)} className="field-input" data-testid="input-location" /></label>
                <label><span className="field-label">Officer name</span><input required value={form.officerName} onChange={(e) => update('officerName', e.target.value)} className="field-input" data-testid="input-officer-name" /></label>
                <label><span className="field-label">Initial assessment</span><select value={form.status} onChange={(e) => update('status', e.target.value)} className="field-input" data-testid="select-assessment"><option value="pending">Pending review</option><option value="compliant">Compliant</option><option value="violation">Violation found</option></select></label>
                <label className="sm:col-span-2"><span className="field-label">OCR / label notes</span><textarea required value={form.ocrText} onChange={(e) => update('ocrText', e.target.value)} rows={4} placeholder="Transcribe the key declarations visible on the package…" className="field-input resize-none" data-testid="textarea-ocr-text" /></label>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
                <p className="max-w-xs text-xs leading-5 text-muted-foreground">Three compliance checks will be attached for supervisor review.</p>
                <button disabled={createScan.isPending} type="submit" className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground disabled:opacity-60" data-testid="button-create-scan">{createScan.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <FileText size={16} />} {createScan.isPending ? 'Saving evidence…' : 'Save & review'}</button>
              </div>
            </form>
          )}
          {notice && <div className="mt-3 flex items-center gap-2 rounded-xl bg-secondary/10 px-4 py-3 text-sm font-medium text-secondary" data-testid="status-action-notice"><Check size={16} />{notice}</div>}
          {reviewScan && <ReviewCard scan={reviewScan} onSubmit={handleSubmit} submitting={submitScan.isPending} />}
        </section>

        <section className="appear delay-2 min-w-0">
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">Local register</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Recent scans</h2></div><span className="font-mono text-[11px] text-muted-foreground">{scanQuery.data?.length ?? 0} records</span></div>
          <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_145px]">
            <label className="relative block"><Search size={15} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or reference" className="field-input pl-9" data-testid="input-search-scans" /></label>
            <label className="relative block"><Filter size={14} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" /><select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className="field-input pl-8" data-testid="select-filter-status"><option value="all">All statuses</option><option value="pending">Pending</option><option value="compliant">Compliant</option><option value="violation">Violations</option></select></label>
          </div>
          {scanQuery.isPending ? <SkeletonRows /> : scanQuery.isError ? <ErrorState onRetry={() => scanQuery.refetch()} /> : scanQuery.data?.length ? <div className="space-y-1 rounded-2xl border border-border bg-card p-2">{scanQuery.data.map((scan) => <ScanRow key={scan.id} scan={scan} compact />)}</div> : <EmptyState title="No scans match this view" body="Your next capture will appear here with its evidence trail." />}
        </section>
      </div>
    </div>
  );
}

function ReviewCard({ scan, onSubmit, submitting }: { scan: Scan; onSubmit: () => void; submitting: boolean }) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-secondary/25 bg-card" data-testid="card-review-scan">
      <div className="scanline h-1" />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div><p className="font-mono text-[10px] uppercase tracking-[.15em] text-secondary">Review before submit</p><h3 className="mt-1 text-base font-semibold">{scan.productName}</h3></div>
        <StatusPill status={scan.status} submitted={scan.submitted} />
      </div>
      <div className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto]">
        <div className="space-y-2">{scan.checks.map((check) => <div key={check.key} className="flex items-start gap-3 rounded-lg bg-muted/50 px-3 py-2.5"><span className={`mt-1 size-2 rounded-full ${check.status === 'passed' ? 'bg-secondary' : check.status === 'failed' ? 'bg-destructive' : 'bg-accent'}`} /><div><p className="text-xs font-semibold">{check.label}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{check.note}</p></div></div>)}</div>
        <div className="flex flex-col justify-end gap-2"><Link href={`/scans/${scan.id}`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted" data-testid="link-review-detail">Open detail <ArrowRight size={14} /></Link>{!scan.submitted && <button type="button" onClick={onSubmit} disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-60" data-testid="button-submit-scan">{submitting ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />} Submit record</button>}</div>
      </div>
    </div>
  );
}