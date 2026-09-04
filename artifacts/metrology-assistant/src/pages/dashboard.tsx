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
    <div className="portal-container py-6 space-y-6">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'पर्यवेक्षक वर्कक्यू एवं प्रवर्तन अवलोकन' : 'Supervisor Work Queue & Enforcement Overview'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        {/* Inspection Work Queue Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              {language === 'hi' ? 'दैनिक निरीक्षण कार्य-सूची' : 'Daily Inspection Work Queue'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {language === 'hi'
                ? 'लंबित सत्यापन, गैर-अनुपालन एवं समीक्षा योग्य साक्ष्यों की प्राथमिकता सूची।'
                : 'Urgent queue of pending reviews, unsubmitted findings, and statutory violations.'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)] font-mono text-[11px]">
              <span className="size-1.5 rounded-full bg-[var(--green-ac)]" />
              {todayLabel}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--r-sm)] bg-[var(--indigo-600)] text-white font-medium hover:bg-[var(--indigo-700)] transition-transform active:scale-[0.985]"
              data-testid="link-new-scan"
            >
              <span>{t.newScan}</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,1fr)]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text)]">{t.recentAuditActivity}</h3>
              <span className="font-mono text-xs text-muted-foreground">{scans.data?.length ?? 0} {language === 'hi' ? 'रिकॉर्ड्स' : 'records'}</span>
            </div>
            {scans.isPending ? (
              <SkeletonRows count={5} />
            ) : scans.isError ? (
              <ErrorState onRetry={() => scans.refetch()} />
            ) : scans.data?.length ? (
              <div className="space-y-1 rounded-[var(--r-md)] border border-[var(--border)] bg-white p-2">
                {scans.data.slice(0, 10).map((scan) => (
                  <ScanRow key={scan.id} scan={scan} compact onDelete={handleDeleteScan} />
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--r-md)] border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--text-muted)]">
                {language === 'hi' ? 'अभी तक कोई ऑडिट गतिविधि प्राप्त नहीं हुई है।' : 'No audit activity has arrived yet.'}
              </div>
            )}
          </section>

          <section className="space-y-6 min-w-0">
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[var(--text)]">{t.violationBreakdown}</h3>
              </div>
              <div className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5" data-testid="card-violation-breakdown">
                {metrics?.violationsByType.length ? (
                  <div className="space-y-3">
                    {metrics.violationsByType.slice(0, 6).map((violation) => {
                      const max = metrics.violationsByType[0].count || 1;
                      return (
                        <div key={violation.label} className="flex items-center gap-3">
                          <span className="w-40 shrink-0 truncate text-xs font-medium text-[var(--text)]" title={violation.label}>{violation.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                            <div className="h-full rounded-full bg-[var(--rose-ac)]" style={{ width: `${Math.max(8, Math.round((violation.count / max) * 100))}%` }} />
                          </div>
                          <span className="w-6 text-right font-mono text-xs font-semibold text-[var(--rose-ac)]">{violation.count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-2 text-sm text-[var(--text-muted)]">
                    <TriangleAlert size={16} className="text-[var(--green-ac)]" />
                    {t.noFailedDeclarations}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[var(--text)]">{t.exceptionsToReview}</h3>
              </div>
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
                <div className="border-b border-[var(--border)] bg-[var(--bg-sunken)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text)]">{t.topViolationSignal}</span>
                    <span className="rounded-[var(--r-sm)] bg-[var(--rose-t)] border border-[var(--rose-br)] text-[var(--rose-ac)] px-2 py-0.5 text-[11px] font-semibold">
                      {t.needsAttention}
                    </span>
                  </div>
                  <p className="mt-1 text-base font-semibold text-[var(--text)] tracking-tight">
                    {metrics?.topViolationType || (language === 'hi' ? 'अभी कोई उल्लंघन नहीं' : 'No violations yet')}
                  </p>
                </div>
                <div className="space-y-1 p-3">
                  {scans.data?.filter((scan) => scan.status === 'violation' || !scan.submitted).slice(0, 4).map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/scans/${scan.id}`}
                      className="group flex items-center gap-3 rounded-[var(--r-sm)] px-2 py-2 hover:bg-[var(--indigo-050)] transition-colors"
                      data-testid={`link-exception-${scan.id}`}
                    >
                      <span className="grid size-7 place-items-center rounded bg-[var(--rose-t)] text-[var(--rose-ac)] shrink-0">
                        <Clock3 size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-[var(--text)]">{scan.productName}</span>
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-mono">
                          {scan.reference} · {scan.location}
                        </span>
                      </span>
                      <StatusPill status={scan.status} />
                      <ArrowUpRight size={13} className="text-[var(--text-muted)] group-hover:text-[var(--link-hover)]" />
                    </Link>
                  ))}
                  {!scans.isPending && !scans.data?.some((scan) => scan.status === 'violation' || !scan.submitted) && (
                    <div className="px-3 py-7 text-center">
                      <CheckCircle2 size={24} className="mx-auto text-[var(--green-ac)]" />
                      <p className="mt-2 text-sm font-semibold">{t.allClear}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{t.allClearSub}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}