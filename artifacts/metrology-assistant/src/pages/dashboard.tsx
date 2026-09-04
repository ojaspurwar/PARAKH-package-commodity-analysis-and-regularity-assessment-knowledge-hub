import { ArrowUpRight, Boxes, CheckCircle2, Clock3, CloudOff, FileSearch, Gauge, MapPin, TriangleAlert } from 'lucide-react';
import { Link } from 'wouter';
import { getGetDashboardSummaryQueryKey, getGetScansQueryKey, useGetDashboardSummary, useGetScans, type Scan } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorState, ScanRow, SkeletonRows, StatusPill, formatDateTime } from '@/components/scan-ui';
import { useI18n } from '@/lib/i18n';

export default function DashboardPage() {
  const { language, t } = useI18n();
  const queryClient = useQueryClient();
  const summary = useGetDashboardSummary();
  const scans = useGetScans();
  const metrics = summary.data;
  const compliance = metrics ? Math.round(metrics.complianceRate <= 1 ? metrics.complianceRate * 100 : metrics.complianceRate) : 0;
  const todayLabel = new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date());

  const handleDeleteScan = async (e: React.MouseEvent, scan: Scan) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      language === 'hi'
        ? `क्या आप वाकई "${scan.productName}" का रिकॉर्ड हटाना चाहते हैं?`
        : `Are you sure you want to delete this inspection record for "${scan.productName}"?`
    );
    if (!ok) return;
    try {
      const res = await fetch(`/api/scans/${scan.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete scan');
      await queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
    } catch (err: any) {
      alert(language === 'hi' ? 'हटाने में विफल: ' + (err.message || '') : 'Failed to delete: ' + (err.message || ''));
    }
  };

  return (
    <div className="space-y-8">
      <section className="appear flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div><p className="font-mono text-[10px] uppercase tracking-[.2em] text-secondary">{t.supervisorToday}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-.045em] md:text-4xl">{t.dayAtGlance}</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{t.dayAtGlanceSub}</p></div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-secondary" /> {language === 'hi' ? 'सक्रिय रजिस्टर' : 'Live register'} <span className="mx-1 text-border">/</span> {todayLabel}</div>
      </section>

      {summary.isError ? <ErrorState onRetry={() => summary.refetch()} /> : summary.isPending ? <MetricSkeleton /> : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label={t.recordsInRepo} value={String(metrics?.totalScans ?? 0)} detail={t.allCapturedEvidence} icon={FileSearch} accent="navy" />
          <MetricCard label={t.complianceRate} value={`${compliance}%`} detail={t.basedOnSubmitted} icon={Gauge} accent="teal" progress={compliance} />
          <MetricCard label={t.productsTracked} value={String(metrics?.productsTracked ?? 0)} detail={t.distinctCommodities} icon={Boxes} accent="ink" />
          <MetricCard label={t.queuedOffline} value={String(metrics?.queuedOffline ?? 0)} detail={t.waitingConnection} icon={CloudOff} accent="amber" />
        </section>
      )}

      <div className="grid gap-7 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,1fr)]">
        <section className="appear delay-1">
          <div className="mb-4 flex items-end justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{language === 'hi' ? 'साक्ष्य प्रवाह' : 'Evidence stream'}</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">{t.recentAuditActivity}</h2></div><Link href="/" className="inline-flex items-center gap-1 text-xs font-semibold text-secondary hover:underline" data-testid="link-new-scan">{t.newScan} <ArrowUpRight size={14} /></Link></div>
          {scans.isPending ? <SkeletonRows count={5} /> : scans.isError ? <ErrorState onRetry={() => scans.refetch()} /> : scans.data?.length ? <div className="space-y-1 rounded-2xl border border-border bg-card p-2">{scans.data.slice(0, 8).map((scan) => <ScanRow key={scan.id} scan={scan} compact onDelete={handleDeleteScan} />)}</div> : <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">{language === 'hi' ? 'अभी तक कोई ऑडिट गतिविधि प्राप्त नहीं हुई है।' : 'No audit activity has arrived yet.'}</div>}
        </section>

        <section className="appear delay-2 space-y-6">
          <div>
            <div className="mb-4"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{language === 'hi' ? 'प्रवर्तन संकेत' : 'Enforcement signal'}</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">{t.violationBreakdown}</h2></div>
            <div className="rounded-2xl border border-border bg-card p-5" data-testid="card-violation-breakdown">
              {metrics?.violationsByType.length ? (
                <div className="space-y-3">
                  {metrics.violationsByType.slice(0, 6).map((violation) => {
                    const max = metrics.violationsByType[0].count || 1;
                    return (
                      <div key={violation.label} className="flex items-center gap-3">
                        <span className="w-40 shrink-0 truncate text-xs font-medium text-foreground/85" title={violation.label}>{violation.label}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-destructive/75" style={{ width: `${Math.max(8, Math.round((violation.count / max) * 100))}%` }} /></div>
                        <span className="w-6 text-right font-mono text-xs font-semibold text-destructive">{violation.count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 py-2 text-sm text-muted-foreground"><TriangleAlert size={16} className="text-secondary" />{t.noFailedDeclarations}</div>
              )}
            </div>
          </div>
          <div>
            <div className="mb-4"><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">{t.attentionQueue}</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">{t.exceptionsToReview}</h2></div>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border bg-muted/35 px-5 py-4"><div className="flex items-center justify-between"><span className="text-sm font-semibold">{t.topViolationSignal}</span><span className="rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive">{t.needsAttention}</span></div><p className="mt-3 text-2xl font-semibold tracking-[-.04em]">{metrics?.topViolationType || (language === 'hi' ? 'अभी कोई उल्लंघन नहीं' : 'No violations yet')}</p><p className="mt-1 text-xs text-muted-foreground">{language === 'hi' ? 'आज के जाँचे गए साक्ष्यों में सर्वाधिक बारंबार समस्या।' : 'Most recurring issue across today\'s reviewed evidence.'}</p></div>
            <div className="space-y-1 p-3">
              {scans.data?.filter((scan) => scan.status === 'violation' || !scan.submitted).slice(0, 3).map((scan) => <Link key={scan.id} href={`/scans/${scan.id}`} className="group flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-muted/60" data-testid={`link-exception-${scan.id}`}><span className="grid size-8 place-items-center rounded-lg bg-destructive/10 text-destructive"><Clock3 size={15} /></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold">{scan.productName}</span><span className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin size={10} /> {scan.location}</span></span><StatusPill status={scan.status} /><ArrowUpRight size={14} className="text-muted-foreground/50" /></Link>)}
              {!scans.isPending && !scans.data?.some((scan) => scan.status === 'violation' || !scan.submitted) && <div className="px-3 py-7 text-center"><CheckCircle2 size={24} className="mx-auto text-secondary" /><p className="mt-3 text-sm font-semibold">{t.allClear}</p><p className="mt-1 text-xs text-muted-foreground">{t.allClearSub}</p></div>}
            </div>
          </div>
          <div className="mt-4 rounded-2xl bg-primary px-5 py-4 text-primary-foreground"><div className="flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[.17em] text-primary-foreground/55">{t.lastSync}</p><span className="size-2 rounded-full bg-accent" /></div><p className="mt-2 text-sm font-semibold">{metrics?.lastSyncAt ? formatDateTime(metrics.lastSyncAt) : (language === 'hi' ? 'प्रथम सिंक की प्रतीक्षा' : 'Waiting for first sync')}</p><p className="mt-1 text-xs text-primary-foreground/55">{t.allDevicesChecked}</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, accent, progress }: { label: string; value: string; detail: string; icon: typeof FileSearch; accent: string; progress?: number }) {
  const color = { navy: 'bg-primary text-primary-foreground', teal: 'bg-secondary/10 text-secondary', amber: 'bg-accent/25 text-foreground', ink: 'bg-muted text-foreground' }[accent];
  return <div className="rounded-2xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5"><div className="flex items-start justify-between"><span className={`grid size-9 place-items-center rounded-xl ${color}`}><Icon size={17} /></span>{progress !== undefined && <span className="font-mono text-[10px] text-secondary">+2.8 pts</span>}</div><p className="mt-5 text-3xl font-semibold tracking-[-.06em]" data-testid={`metric-${label.toLowerCase().replaceAll(' ', '-')}`}>{value}</p><p className="mt-1 text-sm font-medium">{label}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p>{progress !== undefined && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-secondary transition-all" style={{ width: `${Math.min(progress, 100)}%` }} /></div>}</div>;
}

function MetricSkeleton() {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="state-loading-metrics">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[180px] animate-pulse rounded-2xl bg-muted" />)}</div>;
}