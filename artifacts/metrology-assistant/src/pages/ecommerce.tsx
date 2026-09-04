import { useState } from 'react';
import { ArrowRight, ExternalLink, LoaderCircle, PackageCheck, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { useCreateWebScan } from '@workspace/api-client-react';
import type { Scan } from '@workspace/api-client-react';
import { ScanRow, StatusPill } from '@/components/scan-ui';
import { useI18n } from '@/lib/i18n';

export default function EcommercePage() {
  const { language, t } = useI18n();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Scan | null>(null);
  const webScan = useCreateWebScan();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    webScan.mutate({ data: { url } }, { onSuccess: (scan) => setResult(scan) });
  };

  const steps = [
    ['01', language === 'hi' ? 'पेस्ट करें' : 'Paste', language === 'hi' ? 'सार्वजनिक उत्पाद URL' : 'A public product URL'],
    ['02', language === 'hi' ? 'समीक्षा' : 'Review', language === 'hi' ? 'घोषणाएं निकाली जाती हैं' : 'Declarations are extracted'],
    ['03', language === 'hi' ? 'कार्रवाई' : 'Act', language === 'hi' ? 'पूर्ण रिकॉर्ड खोलें' : 'Open a complete record'],
  ];

  const standards = [
    language === 'hi' ? 'MRP एवं यूनिट बिक्री मूल्य' : 'MRP and sale price',
    language === 'hi' ? 'शुद्ध मात्रा घोषणा (Net quantity)' : 'Net quantity declaration',
    language === 'hi' ? 'निर्माता / आयातक विवरण' : 'Packer / importer details',
  ];

  return (
    <div className="portal-container py-6 space-y-6">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'ऑनलाइन उत्पाद एवं ई-कॉमर्स अनुपालन डेस्क' : 'Online Products & E-Commerce Compliance Desk'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(330px,.65fr)]">
          <section className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="portal-icon-well border-[var(--cyan-br)] text-[var(--cyan-ac)]">
                <Search size={22} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text)]">
                  {language === 'hi' ? 'ऑनलाइन उत्पाद URL का निरीक्षण करें' : 'Inspect an online product URL'}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {language === 'hi' ? 'Amazon या Flipkart से सार्वजनिक उत्पाद लिंक दर्ज करें। PARAKH अनिवार्य घोषणाएं निकालेगा।' : 'Enter a public product link from Amazon or Flipkart. Declarations are extracted under Rule 6.'}
                </p>
              </div>
            </div>
          <form onSubmit={handleSubmit} className="mt-8" data-testid="form-web-scan">
            <label className="field-label" htmlFor="product-url">{language === 'hi' ? 'Amazon / Flipkart उत्पाद URL' : 'Amazon / Flipkart URL'}</label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input id="product-url" required type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.amazon.in/…" className="field-input min-w-0 flex-1" data-testid="input-product-url" />
              <button disabled={webScan.isPending} type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60" data-testid="button-submit-url">
                {webScan.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                {webScan.isPending ? (language === 'hi' ? 'समीक्षा जारी…' : 'Reviewing…') : (language === 'hi' ? 'उत्पाद की समीक्षा करें' : 'Review product')}
              </button>
            </div>
            {webScan.isError && <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive" data-testid="status-web-scan-error">{language === 'hi' ? 'इस उत्पाद की समीक्षा नहीं हो सकी। URL जांचें और पुनः प्रयास करें।' : 'This product could not be reviewed. Check the URL and try again.'}</p>}
          </form>
          <div className="mt-8 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
            {steps.map(([number, title, body]) => (
              <div key={number} className="rounded-xl bg-muted/45 p-3">
                <span className="font-mono text-[10px] text-secondary">{number}</span>
                <p className="mt-3 text-xs font-semibold">{title}</p>
                <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="appear delay-2 rounded-2xl bg-primary p-6 text-primary-foreground md:p-7">
          <ShieldCheck size={24} className="text-accent" />
          <h2 className="mt-7 text-xl font-semibold tracking-[-.03em]">{language === 'hi' ? 'प्रमाण का एक ही मानक' : 'One standard of proof'}</h2>
          <p className="mt-3 text-sm leading-6 text-primary-foreground/60">{language === 'hi' ? 'ऑनलाइन उत्पादों की समीक्षा उन्हीं विधिक घोषणाओं के आधार पर की जाती है जो अधिकारी ज़मीन पर जांचते हैं।' : 'Online products are reviewed against the same declarations that officers capture on the ground.'}</p>
          <div className="mt-7 space-y-3 border-t border-primary-foreground/10 pt-5">
            {standards.map((item) => (
              <div key={item} className="flex items-center gap-3 text-xs text-primary-foreground/75">
                <span className="grid size-5 place-items-center rounded-full bg-accent text-accent-foreground"><PackageCheck size={12} /></span>
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
      {result && (
        <section className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 md:p-6" data-testid="card-web-scan-result">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div>
              <span className="text-xs font-semibold text-[var(--cyan-ac)] block">
                {language === 'hi' ? 'स्कैन परिणाम / समीक्षा हेतु तैयार' : 'Returned scan · Ready for review'}
              </span>
              <h2 className="mt-1 text-lg font-semibold text-[var(--text)]">{result.productName}</h2>
              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-muted)] font-mono">
                <span>Ref: {result.reference}</span>
                <span>Jurisdiction: {result.location}</span>
              </div>
            </div>
            <StatusPill status={result.status} submitted={result.submitted} />
          </div>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-[var(--text-muted)]">
              {result.ocrText || (language === 'hi' ? 'उत्पाद साक्ष्य तैयार है। प्रत्येक अनुपालन जांच की समीक्षा हेतु पूर्ण रिकॉर्ड खोलें।' : 'Product evidence is ready. Open the full record to inspect each compliance check.')}
            </p>
            <Link
              href={`/scans/${result.id}`}
              className="inline-flex shrink-0 items-center justify-center gap-1.5 h-9 px-4 rounded-[var(--r-sm)] bg-[var(--indigo-600)] text-sm font-medium text-white transition-transform active:scale-[0.985]"
              data-testid="link-open-web-result"
            >
              <span>{language === 'hi' ? 'साक्ष्य खोलें' : 'Open evidence'}</span>
            </Link>
          </div>
          <div className="mt-4 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] p-2">
            <ScanRow scan={result} compact />
          </div>
        </section>
      )}
      </div>
    </div>
  );
}