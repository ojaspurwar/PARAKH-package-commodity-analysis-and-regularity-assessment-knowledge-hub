import React, { useMemo } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, ExternalLink, FileSearch, Flag, MapPin, ShieldAlert, TriangleAlert } from 'lucide-react';
import { Link } from 'wouter';
import { getGetDashboardSummaryQueryKey, getGetScansQueryKey, useGetDashboardSummary, useGetScans, type Scan } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { ErrorState, SkeletonRows, StatusPill } from '@/components/scan-ui';
import { ScanTable } from '@/components/scan-table';
import { useI18n } from '@/lib/i18n';

export default function DashboardPage() {
  const { language, t } = useI18n();
  const queryClient = useQueryClient();
  const summary = useGetDashboardSummary();
  const scans = useGetScans();
  const metrics = summary.data;
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

  // Sort queue by urgency: Violations & unsubmitted records first, then newest
  const sortedScans = useMemo(() => {
    if (!scans.data) return [];
    return [...scans.data].sort((a, b) => {
      const urgencyScore = (s: Scan) => (s.status === 'violation' ? 3 : !s.submitted ? 2 : s.status === 'pending' ? 1 : 0);
      const diff = urgencyScore(b) - urgencyScore(a);
      if (diff !== 0) return diff;
      return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime();
    });
  }, [scans.data]);

  const unresolvedViolations = useMemo(() => {
    return (scans.data ?? []).filter((s) => s.status === 'violation');
  }, [scans.data]);

  return (
    <div className="portal-container py-6 space-y-6" data-testid="page-dashboard">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'पर्यवेक्षक वर्कक्यू एवं प्रवर्तन अवलोकन' : 'Supervisor Work Queue & Enforcement Overview'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        {/* Priority Notice Block if active violations exist (§7 Priority block) */}
        {unresolvedViolations.length > 0 && (
          <div
            className="rounded-[var(--r-md)] border-[1.5px] border-rose-br bg-rose-t p-5"
            data-testid="box-priority-supervision-notice"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white border-[1.5px] border-rose-br text-rose-act">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <span className="rounded-[var(--r-sm)] bg-white border border-rose-br text-rose-act px-2 py-0.5 text-xs font-semibold">
                    {language === 'hi' ? 'विधिक प्रवर्तन कार्रवाई अपेक्षित' : 'Urgent Legal Enforcement Required'}
                  </span>
                  <h3 className="mt-1.5 text-base font-semibold text-[var(--text)]">
                    {language === 'hi'
                      ? `${unresolvedViolations.length} कमोडिटी पैकेजों में धारा 36 के अधीन वैधानिक उल्लंघन पाए गए`
                      : `${unresolvedViolations.length} commodity inspections flag non-compliance under Section 36`}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-muted)] max-w-2xl leading-5">
                    {language === 'hi'
                      ? 'विधिक मापविज्ञान अधिनियम, 2009 की धारा 36 एवं नियम 19-21 के तहत निरीक्षण नोटिस जारी करें अथवा नियम 32A के अंतर्गत समाधान (Compounding) कार्यवाही प्रारंभ करें।'
                      : 'Review evidence dossiers to issue statutory inspection notices under Rules 19–21 or initiate compounding proceedings for first infractions under Rule 32A.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/scans/${unresolvedViolations[0].id}`}
                  className="inline-flex items-center gap-1.5 rounded-[var(--r-sm)] bg-rose-act px-4 py-2 text-xs font-semibold text-white hover:opacity-90 active:scale-[0.985]"
                  data-testid="button-open-priority-violation"
                >
                  <span>{language === 'hi' ? 'शीर्ष उल्लंघन की समीक्षा करें' : 'Review top violation'}</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Inspection Work Queue Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">
              {language === 'hi' ? 'दैनिक निरीक्षण कार्य-सूची' : 'Daily Inspection Work Queue'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {language === 'hi'
                ? 'लंबित सत्यापन, गैर-अनुपालन एवं समीक्षा योग्य साक्ष्यों की प्राथमिकता क्रमबद्ध तालिका।'
                : 'Prioritised enforcement queue sorted by statutory violation urgency and submission status.'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)] font-mono text-[11px] tabular-nums">
              <span className="size-1.5 rounded-full bg-green-act" />
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

        {/* Real Work Queue Data Table per AGENTS.md §7 */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
          <section className="min-w-0 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text)]">{t.recentAuditActivity}</h3>
              <span className="font-mono text-xs text-[var(--text-muted)] tabular-nums">
                {scans.data?.length ?? 0} {language === 'hi' ? 'निरीक्षण रिकॉर्ड' : 'records in queue'}
              </span>
            </div>

            {scans.isPending ? (
              <SkeletonRows count={5} />
            ) : scans.isError ? (
              <ErrorState onRetry={() => scans.refetch()} />
            ) : sortedScans.length ? (
              <ScanTable
                scans={sortedScans}
                onDelete={handleDeleteScan}
                showCategory={true}
                showLocation={true}
                showOfficer={true}
              />
            ) : (
              <div className="rounded-[var(--r-md)] border border-dashed border-[var(--border)] p-12 text-center text-sm text-[var(--text-muted)]">
                {language === 'hi' ? 'कोई लंबित ऑडिट गतिविधि नहीं है।' : 'No audit activity in queue.'}
              </div>
            )}
          </section>

          {/* Right Column: Violation Breakdown & Exceptions Stream */}
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
                          <span className="w-40 shrink-0 truncate text-xs font-medium text-[var(--text)]" title={violation.label}>
                            {violation.label}
                          </span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--bg-sunken)]">
                            <div
                              className="h-full rounded-full bg-rose-act"
                              style={{ width: `${Math.max(8, Math.round((violation.count / max) * 100))}%` }}
                            />
                          </div>
                          <span className="w-6 text-right font-mono text-xs font-semibold text-rose-act tabular-nums">
                            {violation.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-2 text-sm text-[var(--text-muted)]">
                    <TriangleAlert size={16} className="text-green-act" />
                    {t.noFailedDeclarations}
                  </div>
                )}
              </div>
            </div>

            {/* Top Signal & Urgent Exceptions */}
            <div>
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-[var(--text)]">{t.exceptionsToReview}</h3>
              </div>
              <div className="overflow-hidden rounded-[var(--r-md)] border border-[var(--border)] bg-white">
                <div className="border-b border-[var(--border)] bg-[var(--bg-sunken)] px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text)]">{t.topViolationSignal}</span>
                    <span className="rounded-[var(--r-sm)] bg-rose-t border border-rose-br text-rose-act px-2 py-0.5 text-[11px] font-semibold">
                      {t.needsAttention}
                    </span>
                  </div>
                  <p className="mt-1 text-base font-semibold text-[var(--text)]">
                    {metrics?.topViolationType || (language === 'hi' ? 'अभी कोई उल्लंघन नहीं' : 'No violations detected')}
                  </p>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {scans.data?.filter((scan) => scan.status === 'violation' || !scan.submitted).slice(0, 5).map((scan) => (
                    <Link
                      key={scan.id}
                      href={`/scans/${scan.id}`}
                      className="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-[var(--indigo-050)]"
                      data-testid={`link-exception-${scan.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-[var(--text)]">
                          {scan.productName}
                        </span>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
                          <span>Ref: {scan.reference}</span>
                          <span>Location: {scan.location}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusPill status={scan.status} />
                        <ArrowUpRight size={13} className="text-[var(--link)]" />
                      </div>
                    </Link>
                  ))}
                  {!scans.isPending && !scans.data?.some((scan) => scan.status === 'violation' || !scan.submitted) && (
                    <div className="px-3 py-7 text-center">
                      <CheckCircle2 size={24} className="mx-auto text-green-act" />
                      <p className="mt-2 text-sm font-semibold">{t.allClear}</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">{t.allClearSub}</p>
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
