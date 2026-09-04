import React, { useState } from 'react';
import { ExternalLink, Globe, LoaderCircle, PackageCheck, Search, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Link } from 'wouter';
import { useCreateWebScan, type Scan } from '@workspace/api-client-react';
import { VerdictPanel } from '@/components/verdict-panel';
import { useI18n } from '@/lib/i18n';

export default function EcommercePage() {
  const { language, t } = useI18n();
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Scan | null>(null);
  const webScan = useCreateWebScan();
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    webScan.mutate({ data: { url } }, { onSuccess: (scan) => setResult(scan) });
  };

  const statutoryRequirements = [
    {
      title: language === 'hi' ? 'अधिकतम खुदरा मूल्य एवं इकाई दर' : 'MRP & Unit Sale Price (USP)',
      desc: language === 'hi' ? 'ई-कॉमर्स पोर्टल पर सभी करों सहित स्पष्ट घोषणा' : 'Mandatory under Rule 6(10) & Rule 6(11) on all digital marketplace listings',
    },
    {
      title: language === 'hi' ? 'शुद्ध मात्रा एवं मीट्रिक इकाइयां' : 'Net Quantity & Standard Metric Units',
      desc: language === 'hi' ? 'SI इकाइयों (g, kg, ml, l) में शुद्ध सामग्री की घोषणा' : 'Standard SI units required prior to purchase confirmation',
    },
    {
      title: language === 'hi' ? 'निर्माता / आयातक एवं मूल देश' : 'Manufacturer, Importer & Country of Origin',
      desc: language === 'hi' ? 'पैकर का पूर्ण विवरण एवं देश की स्पष्ट घोषणा' : 'Mandatory origin & physical postal address disclosure',
    },
  ];

  return (
    <div className="portal-container py-6 space-y-6" data-testid="page-ecommerce">
      {/* Slab Header naming function per AGENTS.md §7 */}
      <div className="portal-slab">
        {language === 'hi' ? 'ऑनलाइन उत्पाद एवं ई-कॉमर्स अनुपालन डेस्क' : 'Online Products & E-Commerce Compliance Desk'}
      </div>

      {/* Flush Panel */}
      <div className="portal-panel space-y-6">
        {/* Cyan Category Header Strip (§5) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-[var(--r-sm)] border-[1.5px] border-cyan-br bg-cyan-t px-2 py-0.5 text-xs font-semibold text-cyan-act">
                {language === 'hi' ? 'ई-कॉमर्स अनुपालन' : 'E-Commerce Marketplace Inspection'}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] tabular-nums">
                Rule 6(10) Compliance Desk
              </span>
            </div>
            <h2 className="mt-2 text-base font-semibold text-[var(--text)]">
              {language === 'hi' ? 'डिजिटल मार्केटप्लेस उत्पाद लिस्टिंग की वैधानिक जांच' : 'Digital Marketplace Statutory Declaration Assessment'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-2xl leading-5">
              {language === 'hi'
                ? 'विधिक मापविज्ञान (पैक वस्तुएं) नियम, 2011 के नियम 6(10) के अधीन Amazon, Flipkart अथवा Blinkit उत्पाद URL की त्वरित जांच करें।'
                : 'Inspect public e-commerce listings against Legal Metrology Rules, 2011 Rule 6(10) mandatory declarations prior to sale.'}
            </p>
          </div>
        </div>

        {/* Input & Statutory Requirements Grid */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          {/* URL Input Form (Cyan priority styling) */}
          <section className="rounded-[var(--r-md)] border-[1.5px] border-cyan-br bg-cyan-t p-5 md:p-6 space-y-5">
            <div className="flex items-start gap-3.5">
              <div className="grid size-14 shrink-0 place-items-center rounded-full bg-white border-[1.5px] border-cyan-br text-cyan-act">
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text)]">
                  {language === 'hi' ? 'ऑनलाइन उत्पाद URL दर्ज करें' : 'Inspect Marketplace Product Listing'}
                </h3>
                <p className="mt-1 text-xs text-[var(--text-muted)] leading-5">
                  {language === 'hi'
                    ? 'सार्वजनिक उत्पाद लिंक दर्ज करें। PARAKH स्वतः घोषणाएं निष्कर्षित करेगा।'
                    : 'Paste a public product listing URL from Amazon, Flipkart, Blinkit or Zepto to extract and evaluate statutory declarations.'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3" data-testid="form-web-scan">
              <label className="block text-xs font-semibold text-[var(--text)]" htmlFor="product-url">
                {language === 'hi' ? 'उत्पाद वेब URL (Marketplace URL)' : 'Product Marketplace URL'}
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="product-url"
                  required
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/B08N5WRWNW..."
                  className="w-full h-11 px-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
                  data-testid="input-product-url"
                />
                <button
                  disabled={webScan.isPending}
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[var(--r-sm)] bg-cyan-act text-white text-xs font-semibold hover:opacity-90 transition-transform active:scale-[0.985] disabled:opacity-60 whitespace-nowrap"
                  data-testid="button-submit-url"
                >
                  {webScan.isPending ? (
                    <>
                      <LoaderCircle size={15} className="animate-spin" />
                      <span>{language === 'hi' ? 'निष्कर्षण जारी…' : 'Inspecting…'}</span>
                    </>
                  ) : (
                    <>
                      <Search size={15} />
                      <span>{language === 'hi' ? 'उत्पाद की जांच करें' : 'Inspect listing'}</span>
                    </>
                  )}
                </button>
              </div>
              {webScan.isError && (
                <p className="rounded-[var(--r-sm)] bg-rose-t border border-rose-br p-2.5 text-xs font-medium text-rose-act" data-testid="status-web-scan-error">
                  {language === 'hi' ? 'इस उत्पाद की समीक्षा नहीं हो सकी। URL जांचें और पुनः प्रयास करें।' : 'Could not retrieve declarations for this URL. Please verify the link and retry.'}
                </p>
              )}
            </form>

            <div className="border-t border-cyan-br/30 pt-3 text-xs text-[var(--text-muted)] flex items-center gap-2">
              <ShieldCheck size={14} className="text-cyan-act shrink-0" />
              <span>
                {language === 'hi'
                  ? 'ई-कॉमर्स संस्थाओं के लिए डिजिटल पटल पर नियम 6 का अनुपालन अनिवार्य है।'
                  : 'Marketplaces are legally responsible under Section 36 for missing declarations on retail listings.'}
              </span>
            </div>
          </section>

          {/* Statutory Requirements Band */}
          <section className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
              <PackageCheck size={18} className="text-[var(--indigo-600)]" />
              <h3 className="text-sm font-semibold text-[var(--text)]">
                {language === 'hi' ? 'नियम 6(10) वैधानिक मानक' : 'Rule 6(10) Statutory Standards'}
              </h3>
            </div>

            <div className="space-y-3">
              {statutoryRequirements.map((item, idx) => (
                <div key={idx} className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3">
                  <span className="block text-xs font-semibold text-[var(--text)]">{item.title}</span>
                  <span className="mt-0.5 block text-[11px] text-[var(--text-muted)] leading-4">{item.desc}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Returned Scan Result: Reuses the 5-Part VerdictPanel! */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-[var(--border)]" data-testid="card-web-scan-result">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--text)]">
                {language === 'hi' ? 'ई-कॉमर्स वैधानिक निष्कर्ष' : 'Online Inspection Verdict & Statutory Record'}
              </h3>
              <Link
                href={`/scans/${result.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--link)] hover:text-[var(--link-hover)]"
              >
                <span>{language === 'hi' ? 'पूर्ण विवरण देखें' : 'View full record'}</span>
                <ExternalLink size={13} />
              </Link>
            </div>

            <VerdictPanel
              reference={result.reference}
              productName={result.productName}
              category={result.category}
              status={result.status}
              checks={result.checks}
              ocrText={result.ocrText}
              ocrDetails={result.ocrDetails}
              imageUrl={result.imageUrl}
              capturedAt={result.capturedAt}
              officerName={result.officerName}
              location={result.location}
              evidenceHash={result.evidenceHash}
              submitted={result.submitted}
              exportUrl={`${baseUrl}/api/scans/${result.id}/report`}
              triggerSignatureAnimation={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
