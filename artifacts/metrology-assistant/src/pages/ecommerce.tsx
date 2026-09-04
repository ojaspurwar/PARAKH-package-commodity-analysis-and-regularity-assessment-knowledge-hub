import { useState } from 'react';
import { ArrowRight, ExternalLink, LoaderCircle, PackageCheck, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useCreateWebScan } from '@workspace/api-client-react';
import type { Scan } from '@workspace/api-client-react';
import { ScanRow, StatusPill } from '@/components/scan-ui';

export default function EcommercePage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Scan | null>(null);
  const webScan = useCreateWebScan();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    webScan.mutate({ data: { url } }, { onSuccess: (scan) => setResult(scan) });
  };

  return (
    <div className="space-y-8">
      <section className="appear relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-8 md:px-9 md:py-10">
        <div className="absolute right-[-40px] top-[-120px] size-[300px] rounded-full border border-secondary/10" />
        <div className="relative max-w-3xl"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-secondary"><span className="size-1.5 rounded-full bg-secondary" />Online marketplace desk</div><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em] md:text-5xl">Bring the shelf<br /><span className="text-secondary">to your desk.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">Submit an Amazon or Flipkart product link. Nirikshan extracts the declared label information and returns the same reviewable evidence structure used in the field.</p></div>
      </section>
      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(330px,.65fr)]">
        <section className="appear delay-1 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-start gap-4"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-secondary/10 text-secondary"><Search size={21} /></span><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-muted-foreground">01 / source</p><h2 className="mt-1 text-xl font-semibold tracking-[-.03em]">Inspect a product URL</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Use a public product page from a supported marketplace.</p></div></div>
          <form onSubmit={handleSubmit} className="mt-8" data-testid="form-web-scan"><label className="field-label" htmlFor="product-url">Amazon / Flipkart URL</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input id="product-url" required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.amazon.in/…" className="field-input min-w-0 flex-1" data-testid="input-product-url" /><button disabled={webScan.isPending} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60" data-testid="button-submit-url">{webScan.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <ExternalLink size={16} />}{webScan.isPending ? 'Reviewing…' : 'Review product'}</button></div>{webScan.isError && <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive" data-testid="status-web-scan-error">This product could not be reviewed. Check the URL and try again.</p>}</form>
          <div className="mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">{[['01', 'Paste', 'A public product URL'], ['02', 'Review', 'Declarations are extracted'], ['03', 'Act', 'Open a complete record']].map(([number, title, body]) => <div key={number} className="rounded-xl bg-muted/45 p-3"><span className="font-mono text-[10px] text-secondary">{number}</span><p className="mt-3 text-xs font-semibold">{title}</p><p className="mt-1 text-[11px] leading-4 text-muted-foreground">{body}</p></div>)}</div>
        </section>
        <section className="appear delay-2 rounded-2xl bg-primary p-6 text-primary-foreground md:p-7"><ShieldCheck size={24} className="text-accent" /><h2 className="mt-7 text-xl font-semibold tracking-[-.03em]">One standard of proof</h2><p className="mt-3 text-sm leading-6 text-primary-foreground/60">Online products are reviewed against the same declarations that officers capture on the ground.</p><div className="mt-7 space-y-3 border-t border-primary-foreground/10 pt-5">{['MRP and sale price', 'Net quantity declaration', 'Packer / importer details'].map((item) => <div key={item} className="flex items-center gap-3 text-xs text-primary-foreground/75"><span className="grid size-5 place-items-center rounded-full bg-accent text-accent-foreground"><PackageCheck size={12} /></span>{item}</div>)}</div></section>
      </div>
      {result && <section className="appear rounded-2xl border border-secondary/25 bg-card p-5 md:p-7" data-testid="card-web-scan-result"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5"><div><p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">Returned scan / ready for review</p><h2 className="mt-1 text-xl font-semibold">{result.productName}</h2><p className="mt-1 text-xs text-muted-foreground">{result.reference} · {result.location}</p></div><StatusPill status={result.status} submitted={result.submitted} /></div><div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xl text-sm leading-6 text-muted-foreground">{result.ocrText || 'Product evidence is ready. Open the full record to inspect each compliance check.'}</p><Link href={`/scans/${result.id}`} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground" data-testid="link-open-web-result">Open evidence <ArrowRight size={15} /></Link></div><div className="mt-4 rounded-xl bg-muted/45 p-2"><ScanRow scan={result} compact /></div></section>}
    </div>
  );
}