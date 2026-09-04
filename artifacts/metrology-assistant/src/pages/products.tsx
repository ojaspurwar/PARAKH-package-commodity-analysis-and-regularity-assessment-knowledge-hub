import React, { useMemo, useState } from 'react';
import { ArrowUpRight, ChevronDown, ChevronUp, Download, ExternalLink, PackageSearch, Search, ShieldAlert, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { getGetScansQueryKey, useGetScans, type Scan } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState, ErrorState, SkeletonRows, StatusPill } from '@/components/scan-ui';
import { useI18n } from '@/lib/i18n';

interface ProductGroup {
  key: string;
  name: string;
  rows: Scan[];
  latest: Scan;
  barcode: string | null;
  firstSeen: string | Date;
}

export default function ProductsPage() {
  const { language, t } = useI18n();
  const scans = useGetScans();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const handleDeleteScan = async (e: React.MouseEvent, scanId: number, name: string) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      language === 'hi'
        ? `क्या आप वाकई "${name}" का यह निरीक्षण रिकॉर्ड हटाना चाहते हैं?`
        : `Are you sure you want to delete this inspection record for "${name}"?`
    );
    if (!ok) return;
    try {
      const res = await fetch(`/api/scans/${scanId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete scan');
      await queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
    } catch (err: any) {
      alert(language === 'hi' ? 'हटाने में विफल: ' + (err.message || '') : 'Failed to delete: ' + (err.message || ''));
    }
  };

  const handleDeleteProduct = async (e: React.MouseEvent, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = window.confirm(
      language === 'hi'
        ? `क्या आप वाकई "${productName}" के सभी रिकॉर्ड हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।`
        : `Are you sure you want to delete all records for "${productName}"? This action cannot be undone.`
    );
    if (!ok) return;
    try {
      const res = await fetch(`/api/products/by-name?name=${encodeURIComponent(productName)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete product entries');
      await queryClient.invalidateQueries({ queryKey: getGetScansQueryKey() });
    } catch (err: any) {
      alert(language === 'hi' ? 'हटाने में विफल: ' + (err.message || '') : 'Failed to delete: ' + (err.message || ''));
    }
  };

  const products = useMemo(() => {
    const groups = new Map<string, Scan[]>();
    for (const scan of scans.data ?? []) {
      const key = scan.productName.trim().toLowerCase();
      const group = groups.get(key);
      if (group) group.push(scan);
      else groups.set(key, [scan]);
    }
    const list: ProductGroup[] = [...groups.entries()].map(([key, rows]) => {
      rows.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
      const latest = rows[0];
      const barcode = rows.find((scan) => scan.barcode)?.barcode ?? null;
      return { key, name: latest.productName, rows, latest, barcode, firstSeen: rows[rows.length - 1].capturedAt };
    });
    list.sort((a, b) => new Date(b.latest.capturedAt).getTime() - new Date(a.latest.capturedAt).getTime());
    const needle = search.trim().toLowerCase();
    return needle ? list.filter((p) => p.name.toLowerCase().includes(needle) || (p.barcode && p.barcode.includes(needle))) : list;
  }, [scans.data, search]);

  const tracked = products.filter((p) => p.rows.some((scan) => scan.status === 'violation'));
  const totalViolations = products.reduce((sum, p) => sum + p.rows.filter((scan) => scan.status === 'violation').length, 0);

  return (
    <div className="portal-container py-6 space-y-6" data-testid="page-products">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'उत्पाद रिपोजिटरी एवं अनुपालन इतिहास' : 'Products Repository & Compliance History'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        {/* Violet Category Header Bar per AGENTS.md §5 */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-[var(--r-sm)] border-[1.5px] border-violet-br bg-violet-t px-2 py-0.5 text-xs font-semibold text-violet-act">
                {language === 'hi' ? 'वैधानिक रिपोजिटरी' : 'Statutory Repository'}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] tabular-nums">
                Section 36 Compliance Archive
              </span>
            </div>
            <h2 className="mt-2 text-base font-semibold text-[var(--text)]">
              {language === 'hi' ? 'प्रत्येक कमोडिटी उत्पाद का एकीकृत प्रवर्तन इतिहास' : 'Single Unified Enforcement History per Commodity'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-2xl">
              {language === 'hi'
                ? 'निरीक्षण अधिकारियों द्वारा संकलित साक्ष्यों का केंद्रीय संग्रह। बार-बार उल्लंघन करने वाले ब्रांडों एवं विनिर्माताओं की त्वरित पहचान।'
                : 'Central repository of physical and online inspection records across all districts. Identify repeat offenders and recurrent label violations.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
            <span className="px-3 py-1.5 rounded-[var(--r-sm)] bg-violet-t border border-violet-br text-violet-act font-semibold">
              {products.length} {language === 'hi' ? 'उत्पाद' : 'products'}
            </span>
            <span className="px-3 py-1.5 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)] text-[var(--text)]">
              {scans.data?.length ?? 0} {language === 'hi' ? 'निरीक्षण' : 'inspections'}
            </span>
            <span className="px-3 py-1.5 rounded-[var(--r-sm)] bg-rose-t border border-rose-br text-rose-act font-semibold">
              {totalViolations} {language === 'hi' ? 'उल्लंघन' : 'violations'}
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-full max-w-md">
            <label className="relative block">
              <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[var(--text-muted)]" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={language === 'hi' ? 'उत्पाद का नाम या EAN बारकोड खोजें…' : 'Search commodity name or EAN barcode…'}
                className="w-full h-10 pl-9 pr-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
                data-testid="input-search-products"
              />
            </label>
          </div>

          {tracked.length > 0 && (
            <div className="flex items-center gap-2 rounded-[var(--r-sm)] border border-rose-br bg-rose-t px-3 py-1.5 text-xs text-rose-act font-semibold">
              <ShieldAlert size={14} className="shrink-0" />
              <span>
                {language === 'hi'
                  ? `${tracked.length} उत्पादों पर पूर्व में विधिक उल्लंघन दर्ज हैं`
                  : `${tracked.length} commodities have repeat infractions on record`}
              </span>
            </div>
          )}
        </div>

        {/* Products Repository Data Table & Mobile Card List per AGENTS.md §7 */}
        {scans.isPending ? (
          <SkeletonRows count={5} />
        ) : scans.isError ? (
          <ErrorState onRetry={() => scans.refetch()} />
        ) : products.length ? (
          <div className="w-full rounded-[var(--r-md)] border border-[var(--border)] bg-white overflow-hidden" data-testid="table-products-container">
            {/* 1. Mobile Card List (< 768px): High-density, touch-friendly, zero horizontal scrolling */}
            <div className="divide-y divide-[var(--border)] md:hidden">
              {products.map((product) => {
                const hasViolations = product.rows.some((r) => r.status === 'violation');
                const isExpanded = expandedProduct === product.key;
                const latestDateStr = typeof product.latest.capturedAt === 'string'
                  ? product.latest.capturedAt.replace('T', ' ').slice(0, 16)
                  : new Date(product.latest.capturedAt).toISOString().replace('T', ' ').slice(0, 16);

                return (
                  <div
                    key={product.key}
                    className={`p-4 space-y-3 transition-colors ${hasViolations ? 'bg-rose-t/10' : ''}`}
                    data-testid={`mobile-product-card-${product.key.replaceAll(' ', '-')}`}
                  >
                    {/* Header: Category + Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-[var(--r-sm)] bg-violet-t border border-violet-br/60 px-2 py-0.5 text-[11px] font-medium text-violet-act">
                        {product.latest.category}
                      </span>
                      <div className="inline-flex items-center gap-1.5">
                        <StatusPill status={product.latest.status} submitted={product.latest.submitted} />
                        {hasViolations && (
                          <span
                            className="rounded-[var(--r-sm)] border border-rose-br bg-rose-t px-1.5 py-0.5 text-[10px] font-bold text-rose-act"
                            title="Repeat offender"
                          >
                            !
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Commodity Title */}
                    <div>
                      <div className="text-sm font-semibold text-[var(--text)]">
                        {product.name}
                      </div>
                      {product.barcode ? (
                        <div className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums mt-0.5">
                          EAN: {product.barcode}
                        </div>
                      ) : (
                        <div className="font-mono text-[11px] text-[var(--text-muted)] mt-0.5">
                          Ref: {product.latest.reference}
                        </div>
                      )}
                    </div>

                    {/* Inspection Counts & Latest Date */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono tabular-nums pt-1 border-t border-[var(--border)]">
                      <span>
                        {product.rows.length} {language === 'hi' ? 'निरीक्षण' : 'inspections'}
                      </span>
                      <span>{latestDateStr}</span>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                      <button
                        type="button"
                        onClick={() => setExpandedProduct(isExpanded ? null : product.key)}
                        className="inline-flex items-center justify-center gap-1.5 h-8 px-3.5 rounded-[var(--r-sm)] bg-[var(--indigo-600)] text-white text-xs font-semibold hover:bg-[var(--indigo-700)] active:scale-[0.985] transition-all flex-1"
                        data-testid={`button-toggle-history-mobile-${product.key.replaceAll(' ', '-')}`}
                      >
                        <span>{isExpanded ? (language === 'hi' ? 'इतिहास बंद करें' : 'Hide history') : (language === 'hi' ? 'इतिहास देखें' : 'View history')}</span>
                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteProduct(e, product.name)}
                        className="h-8 px-2.5 rounded-[var(--r-sm)] border border-[var(--rose-br)] bg-white text-[var(--rose-ac)] hover:bg-[var(--rose-t)] transition-colors"
                        title={language === 'hi' ? 'सभी हटाएं' : 'Delete all records'}
                        aria-label="Delete all records for this product"
                        data-testid={`button-delete-product-mobile-${product.key.replaceAll(' ', '-')}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Mobile History Accordion Drawer */}
                    {isExpanded && (
                      <div className="mt-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-white overflow-hidden">
                        <div className="bg-[var(--indigo-050)] px-3 py-2 border-b border-[var(--border)] text-xs font-semibold text-[var(--text)]">
                          {language === 'hi' ? 'निरीक्षण इतिहास' : 'Evidence trail'} ({product.rows.length})
                        </div>
                        <div className="divide-y divide-[var(--border)]">
                          {product.rows.map((scan) => (
                            <div key={scan.id} className="p-2.5 space-y-2 text-xs">
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  href={`/scans/${scan.id}`}
                                  className="font-mono font-semibold text-[var(--link)] hover:underline tabular-nums"
                                >
                                  {scan.reference}
                                </Link>
                                <StatusPill status={scan.status} submitted={scan.submitted} />
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
                                <span>{scan.location}</span>
                                <span>
                                  {typeof scan.capturedAt === 'string' ? scan.capturedAt.replace('T', ' ').slice(0, 16) : new Date(scan.capturedAt).toISOString().replace('T', ' ').slice(0, 16)}
                                </span>
                              </div>
                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-[var(--border)]/60">
                                <Link
                                  href={`/scans/${scan.id}`}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--link)] hover:text-[var(--link-hover)]"
                                >
                                  <span>{language === 'hi' ? 'विवरण' : 'Details'}</span>
                                  <ExternalLink size={12} />
                                </Link>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteScan(e, scan.id, product.name)}
                                  className="text-[var(--text-muted)] hover:text-rose-act p-1"
                                  title="Delete scan"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 2. Desktop Table View (>= 768px): Strict AGENTS.md §7 compliance */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[var(--bg-sunken)] text-[var(--text-muted)] border-b border-[var(--border)] select-none">
                  <tr className="h-10">
                    <th className="px-4 py-2 font-semibold">
                      {language === 'hi' ? 'कमोडिटी का नाम' : 'Commodity & Barcode'}
                    </th>
                    <th className="px-4 py-2 font-semibold">
                      {language === 'hi' ? 'श्रेणी' : 'Category'}
                    </th>
                    <th className="px-4 py-2 font-semibold text-right">
                      {language === 'hi' ? 'कुल निरीक्षण' : 'Inspections'}
                    </th>
                    <th className="px-4 py-2 font-semibold text-right">
                      {language === 'hi' ? 'नवीनतम निरीक्षण' : 'Latest Inspection'}
                    </th>
                    <th className="px-4 py-2 font-semibold text-center">
                      {language === 'hi' ? 'अनुपालन स्थिति' : 'Compliance Status'}
                    </th>
                    <th className="px-4 py-2 font-semibold text-right">
                      {language === 'hi' ? 'कार्रवाई' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {products.map((product) => {
                    const hasViolations = product.rows.some((r) => r.status === 'violation');
                    const isExpanded = expandedProduct === product.key;
                    const latestDateStr = typeof product.latest.capturedAt === 'string'
                      ? product.latest.capturedAt.replace('T', ' ').slice(0, 16)
                      : new Date(product.latest.capturedAt).toISOString().replace('T', ' ').slice(0, 16);

                    return (
                      <React.Fragment key={product.key}>
                        <tr
                          className={`h-10 transition-colors hover:bg-[var(--indigo-050)] ${
                            hasViolations ? 'bg-rose-t/15' : ''
                          }`}
                          data-testid={`row-product-${product.key.replaceAll(' ', '-')}`}
                        >
                          {/* Commodity Name & Barcode */}
                          <td className="px-4 py-2.5 max-w-sm">
                            <div className="font-semibold text-[var(--text)] truncate">{product.name}</div>
                            {product.barcode ? (
                              <span className="font-mono text-[10px] text-[var(--text-muted)] tabular-nums block">
                                EAN: {product.barcode}
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-[var(--text-muted)] block">
                                Ref: {product.latest.reference}
                              </span>
                            )}
                          </td>

                          {/* Category */}
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className="rounded-[var(--r-sm)] bg-violet-t border border-violet-br/60 px-2 py-0.5 text-[11px] font-medium text-violet-act">
                              {product.latest.category}
                            </span>
                          </td>

                          {/* Inspections Count in mono */}
                          <td className="px-4 py-2.5 font-mono text-right tabular-nums whitespace-nowrap font-semibold">
                            {product.rows.length}
                          </td>

                          {/* Latest Inspection in mono */}
                          <td className="px-4 py-2.5 font-mono text-right text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                            {latestDateStr}
                          </td>

                          {/* Status Badge */}
                          <td className="px-4 py-2.5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <StatusPill status={product.latest.status} submitted={product.latest.submitted} />
                              {hasViolations && (
                                <span
                                  className="rounded-[var(--r-sm)] border border-rose-br bg-rose-t px-1.5 py-0.5 text-[10px] font-bold text-rose-act"
                                  title="Repeat offender: Package has failed statutory checks on previous occasions"
                                >
                                  !
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedProduct(isExpanded ? null : product.key)}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--link)] hover:text-[var(--link-hover)]"
                                data-testid={`button-toggle-history-${product.key.replaceAll(' ', '-')}`}
                              >
                                <span>{isExpanded ? (language === 'hi' ? 'बंद करें' : 'Close') : (language === 'hi' ? 'इतिहास' : 'History')}</span>
                                {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => handleDeleteProduct(e, product.name)}
                                className="rounded p-1 text-[var(--text-muted)] hover:text-rose-act hover:bg-rose-t transition-colors"
                                title={language === 'hi' ? 'सभी हटाएं' : 'Delete all records'}
                                aria-label="Delete all records for this product"
                                data-testid={`button-delete-product-${product.key.replaceAll(' ', '-')}`}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Nested Inspections History Drawer */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-[var(--bg-sunken)] p-4 border-b border-[var(--border)]">
                              <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-white overflow-hidden">
                                <div className="bg-[var(--indigo-050)] px-3 py-2 border-b border-[var(--border)] flex justify-between items-center text-xs font-semibold text-[var(--text)]">
                                  <span>{language === 'hi' ? 'निरीक्षण इतिहास रिकॉर्ड' : 'Inspection Evidence Trail'} ({product.rows.length})</span>
                                  <span className="font-mono text-[11px] text-[var(--text-muted)]">{product.name}</span>
                                </div>
                                <div className="divide-y divide-[var(--border)]">
                                  {product.rows.map((scan) => (
                                    <div
                                      key={scan.id}
                                      className="flex items-center justify-between p-3 text-xs transition-colors hover:bg-[var(--indigo-050)]"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Link
                                          href={`/scans/${scan.id}`}
                                          className="font-mono font-semibold text-[var(--link)] hover:underline tabular-nums"
                                        >
                                          {scan.reference}
                                        </Link>
                                        <span className="text-[var(--text-muted)]">{scan.location}</span>
                                        <span className="text-[var(--text-muted)] hidden sm:inline">Officer: {scan.officerName}</span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="font-mono text-[11px] text-[var(--text-muted)] tabular-nums">
                                          {typeof scan.capturedAt === 'string' ? scan.capturedAt.replace('T', ' ').slice(0, 16) : new Date(scan.capturedAt).toISOString().replace('T', ' ').slice(0, 16)}
                                        </span>
                                        <StatusPill status={scan.status} submitted={scan.submitted} />
                                        <Link
                                          href={`/scans/${scan.id}`}
                                          className="text-[var(--link)] hover:text-[var(--link-hover)]"
                                          title="Open inspection record"
                                        >
                                          <ExternalLink size={13} />
                                        </Link>
                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteScan(e, scan.id, product.name)}
                                          className="text-[var(--text-muted)] hover:text-rose-act"
                                          title="Delete scan"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState title={t.noScansYet} body={t.noScansSub} />
        )}
      </div>
    </div>
  );
}
