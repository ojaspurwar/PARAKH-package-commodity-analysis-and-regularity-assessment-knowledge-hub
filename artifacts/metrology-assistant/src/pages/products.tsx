import { useMemo, useState } from 'react';
import { ArrowUpRight, Boxes, PackageSearch, Search, Trash2 } from 'lucide-react';
import { Link } from 'wouter';
import { getGetScansQueryKey, useGetScans, type Scan } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { EmptyState, ErrorState, SkeletonRows, StatusPill, formatDateTime } from '@/components/scan-ui';
import { useI18n } from '@/lib/i18n';

/**
 * Compliance repository — every packaged commodity that has been scanned,
 * grouped by product with its full compliance history. Enforcement officers
 * can spot repeat offenders and track a product across inspections.
 */
export default function ProductsPage() {
  const { language, t } = useI18n();
  const scans = useGetScans();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

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
    const list = [...groups.entries()].map(([key, rows]) => {
      rows.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
      const latest = rows[0];
      const barcode = rows.find((scan) => scan.barcode)?.barcode ?? null;
      return { key, name: latest.productName, rows, latest, barcode, firstSeen: rows[rows.length - 1].capturedAt };
    });
    list.sort((a, b) => new Date(b.latest.capturedAt).getTime() - new Date(a.latest.capturedAt).getTime());
    const needle = search.trim().toLowerCase();
    return needle ? list.filter((p) => p.name.toLowerCase().includes(needle)) : list;
  }, [scans.data, search]);

  const tracked = products.filter((p) => p.rows.some((scan) => scan.status === 'violation'));
  const violations = products.reduce((sum, p) => sum + p.rows.filter((scan) => scan.status === 'violation').length, 0);

  return (
    <div className="portal-container py-6 space-y-6">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'उत्पाद रिपोजिटरी एवं अनुपालन इतिहास' : 'Products Repository & Compliance History'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <h2 className="text-base font-semibold text-[var(--text)]">{t.everyProductOneHistory}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.everyProductSub}</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)]">
              {scans.data?.length ?? 0} {t.recordsCount}
            </span>
            <span className="px-2.5 py-1 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)]">
              {products.length} {t.productsCount}
            </span>
            <span className="px-2.5 py-1 rounded-[var(--r-sm)] bg-[var(--rose-t)] border border-[var(--rose-br)] text-[var(--rose-ac)] font-semibold">
              {violations} {t.violationsCount}
            </span>
          </div>
        </div>

        <div className="max-w-md">
          <label className="relative block">
            <Search size={15} className="pointer-events-none absolute left-3 top-3 text-[var(--text-muted)]" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchProductsPlaceholder}
              className="w-full h-10 pl-9 pr-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
              data-testid="input-search-products"
            />
          </label>
        </div>

      {scans.isPending ? <SkeletonRows count={5} /> : scans.isError ? <ErrorState onRetry={() => scans.refetch()} /> : products.length ? (
        <div className="grid gap-4 lg:grid-cols-2" data-testid="grid-products">
          {products.map((product) => (
            <article key={product.key} className="appear delay-1 overflow-hidden rounded-2xl border border-border bg-card" data-testid={`card-product-${product.key.replaceAll(' ', '-')}`}>
              <div className={`h-1 ${product.latest.status === 'violation' ? 'bg-destructive' : product.latest.status === 'compliant' ? 'bg-secondary' : 'bg-accent'}`} />
              <div className="border-b border-border px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold tracking-[-.02em]">{product.name}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span>{product.rows.length} {t.inspections}</span>
                      {product.barcode && <span className="font-mono text-secondary/80">{product.barcode}</span>}
                      <span>{t.firstSeen} {formatDateTime(product.firstSeen)}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={product.latest.status} />
                    <button
                      type="button"
                      onClick={(e) => handleDeleteProduct(e, product.name)}
                      className="rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
                      title={t.deleteProductAll}
                      aria-label={t.deleteProductAll}
                      data-testid={`button-delete-product-${product.key.replaceAll(' ', '-')}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-border/70">
                {product.rows.slice(0, 4).map((scan) => (
                  <Link key={scan.id} href={`/scans/${scan.id}`} className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/45" data-testid={`link-product-scan-${scan.id}`}>
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"><PackageSearch size={15} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[11px] text-muted-foreground">{scan.reference}</span>
                      <span className="block truncate text-xs font-medium text-foreground/85">{scan.location}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-[10px] text-muted-foreground">{formatDateTime(scan.capturedAt)}</span>
                      <span className="mt-0.5 block"><StatusPill status={scan.status} /></span>
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteScan(e, scan.id, product.name)}
                      className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95"
                      title="Delete this record"
                      aria-label="Delete this record"
                      data-testid={`button-delete-scan-${scan.id}`}
                    >
                      <Trash2 size={14} />
                    </button>
                    <ArrowUpRight size={14} className="text-muted-foreground/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
              {tracked.some((p) => p.key === product.key) && (
                <div className="flex items-center gap-2 border-t border-destructive/20 bg-destructive/5 px-5 py-2.5 text-[11px] font-semibold text-destructive" data-testid="text-repeat-offender">
                  <span className="size-1.5 rounded-full bg-destructive" /> {t.repeatOffenderWarning}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={t.emptyRepoTitle} body={t.emptyRepoSub} />
      )}

        <div className="flex items-center gap-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] px-4 py-3 text-xs text-[var(--text-muted)]">
          <Boxes size={16} className="shrink-0 text-[var(--indigo-600)]" />
          <p>{t.productHistoryBuiltAutomatically}</p>
        </div>
      </div>
    </div>
  );
}