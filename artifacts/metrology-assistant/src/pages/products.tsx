import { useMemo, useState } from 'react';
import { ArrowUpRight, Boxes, PackageSearch, Search } from 'lucide-react';
import { Link } from 'wouter';
import { useGetScans, type Scan } from '@workspace/api-client-react';
import { EmptyState, ErrorState, SkeletonRows, StatusPill, formatDateTime } from '@/components/scan-ui';

/**
 * Compliance repository — every packaged commodity that has been scanned,
 * grouped by product with its full compliance history. Enforcement officers
 * can spot repeat offenders and track a product across inspections.
 */
export default function ProductsPage() {
  const scans = useGetScans();
  const [search, setSearch] = useState('');

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
    <div className="space-y-8">
      <section className="appear flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.2em] text-secondary">Compliance repository</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.045em] md:text-4xl">Every product, one history.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Scanned packaged commodities grouped by product — with their full inspection history, so repeat non-compliance is easy to spot.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-secondary" /> {scans.data?.length ?? 0} records <span className="mx-1 text-border">/</span> {products.length} products <span className="mx-1 text-border">/</span> <span className="text-destructive">{violations} violations</span></div>
      </section>

      <div className="appear delay-1 mb-1 max-w-md">
        <label className="relative block">
          <Search size={15} className="pointer-events-none absolute left-3 top-3 text-muted-foreground" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the product repository…" className="field-input pl-9" data-testid="input-search-products" />
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
                      <span>{product.rows.length} inspection{product.rows.length === 1 ? '' : 's'}</span>
                      {product.barcode && <span className="font-mono text-secondary/80">{product.barcode}</span>}
                      <span>First seen {formatDateTime(product.firstSeen)}</span>
                    </p>
                  </div>
                  <StatusPill status={product.latest.status} />
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
                    <ArrowUpRight size={14} className="text-muted-foreground/45 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ))}
              </div>
              {tracked.some((p) => p.key === product.key) && (
                <div className="flex items-center gap-2 border-t border-destructive/20 bg-destructive/5 px-5 py-2.5 text-[11px] font-semibold text-destructive" data-testid="text-repeat-offender">
                  <span className="size-1.5 rounded-full bg-destructive" /> Repeat attention — prior inspection(s) found violations
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="Repository is empty" body="Scans you capture on the field desk appear here, grouped by product with their compliance history." />
      )}

      <div className="appear delay-2 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
        <Boxes size={18} className="shrink-0 text-secondary" />
        <p>Product history is built automatically from the local register. Open any inspection for the full evidence trail, checks and PDF report.</p>
      </div>
    </div>
  );
}