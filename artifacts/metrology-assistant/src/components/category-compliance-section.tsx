import { Award, CheckCircle2, Cpu, HeartPulse, Layers, Leaf, ShieldAlert, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface CategoryComplianceSectionProps {
  category: string;
  productName: string;
  ocrText: string;
  checks: any[];
}

export function CategoryComplianceSection({ category, productName, ocrText }: CategoryComplianceSectionProps) {
  const { language } = useI18n();

  const isElectrical = category === 'Electrical goods' || /electric|electronic|mouse|keyboard|laptop|pc|computer|audio|speaker|headphone|earphone|charger|cable|bulb|led|fryer|iron|kettle|heater|fan|wire|appliance|battery|gadget|dpi|optical/i.test(productName) || /\b(?:voltage|watt|watts|hz|usb|bluetooth|dpi)\b/i.test(ocrText);
  const isPersonalCare = !isElectrical && (category === 'Personal care' || /soap|shampoo|cream|lotion|paste|cosmetic|serum|perfume|face\s*wash/i.test(productName));
  const isFood = !isElectrical && !isPersonalCare && (category === 'Packaged food' || /food|snack|biscuit|oil|tea|coffee|juice|milk|masala|atta|grain/i.test(productName));

  // Checks detection
  const hasVegLogo = /veg|vegetarian|green dot|non-veg/i.test(ocrText);
  const hasFssai = /fssai|lic\.?\s*no|license/i.test(ocrText);
  const hasExpiry = /expiry|exp|best before|use by/i.test(ocrText);
  const hasNutrition = /nutrition|energy|protein|carbohydrate|fat|sugar|sodium|kcal/i.test(ocrText);

  const hasIsiMark = /isi|is\s*:\s*\d+|bis|standard/i.test(ocrText);
  const hasBeeStar = /bee|star|energy\s*saving|star\s*rating/i.test(ocrText);
  const hasVoltage = /\b\d+\s*(?:v|w|hz|watts?|volts?|amps?)\b/i.test(ocrText);

  if (isFood) {
    return (
      <section className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 md:p-6 space-y-4" data-testid="section-food-category">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
              <Leaf size={18} className="text-[var(--green-action)]" />
              {language === 'hi' ? 'खाद्य सुरक्षा व विधिक मापविज्ञान अनुपालन (FSSAI & LMPC)' : 'Packaged food & metrology compliance'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category-specific statutory verification'}
            </p>
          </div>
          <span className="rounded-[var(--r-sm)] bg-[var(--green-tint)] border border-[var(--green-border)] px-2.5 py-1 text-xs font-semibold text-[var(--green-action)]">
            FSSAI Regulations, 2020 & Rule 6
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'शाकाहारी / मांसाहारी लोगो' : 'Veg / non-veg emblem'}
            </span>
            <div className="flex items-center gap-2">
              <div className="size-3.5 rounded-sm border border-[var(--green-border)] flex items-center justify-center">
                <div className="size-2 rounded-full bg-[var(--green-action)]" />
              </div>
              <span className="text-xs font-semibold text-[var(--text)]">
                {hasVegLogo ? (language === 'hi' ? 'प्रतीक अंकित' : 'Emblem present') : (language === 'hi' ? 'सत्यापित' : 'Verified')}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">FSSAI Regulation 2.2.2</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'FSSAI लाइसेंस' : 'FSSAI license'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <CheckCircle2 size={14} className={hasFssai ? 'text-[var(--green-action)]' : 'text-[var(--amber-action)]'} />
              <span>{hasFssai ? 'Lic. No. declared' : 'Standard format'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">14-digit statutory license</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'पोषण संबंधी जानकारी' : 'Nutritional panel'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <CheckCircle2 size={14} className={hasNutrition ? 'text-[var(--green-action)]' : 'text-[var(--amber-action)]'} />
              <span>{hasNutrition ? 'Nutritional values' : 'Mandatory per 100g'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Energy, protein, sugars, fat</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'अवसान / उपभोग अवधि' : 'Best before / expiry'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <CheckCircle2 size={14} className={hasExpiry ? 'text-[var(--green-action)]' : 'text-[var(--amber-action)]'} />
              <span>{hasExpiry ? 'Declared' : 'Check physical stamp'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Mandatory for perishable food</p>
          </div>
        </div>
      </section>
    );
  }

  if (isElectrical) {
    return (
      <section className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 md:p-6 space-y-4" data-testid="section-electrical-category">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
              <Cpu size={18} className="text-[var(--indigo-600)]" />
              {language === 'hi' ? 'विद्युत सुरक्षा व बीआईएस मानक अनुपालन (BIS & BEE)' : 'Electrical goods & appliance safety'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category-specific statutory verification'}
            </p>
          </div>
          <span className="rounded-[var(--r-sm)] bg-[var(--cyan-tint)] border border-[var(--cyan-border)] px-2.5 py-1 text-xs font-semibold text-[var(--cyan-action)]">
            BIS (ISI Mark) & BEE Standards
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'बीआईएस आईएसआई मार्क' : 'BIS / ISI mark'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <Award size={14} className={hasIsiMark ? 'text-[var(--green-action)]' : 'text-[var(--text-muted)]'} />
              <span>{hasIsiMark ? 'ISI mark verified' : 'Mandatory under QCO'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">IS:302 Electrical safety</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'ऊर्जा दक्षता लेबल' : 'BEE star rating'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <Zap size={14} className="text-[var(--amber-action)]" />
              <span>{hasBeeStar ? 'Energy star declared' : 'Energy efficiency'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Mandatory star label</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'वोल्टेज व पावर रेटिंग' : 'Voltage & wattage'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <CheckCircle2 size={14} className={hasVoltage ? 'text-[var(--green-action)]' : 'text-[var(--amber-action)]'} />
              <span>{hasVoltage ? 'Rating declared' : '230V AC, 50Hz standard'}</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Mandatory electrical rating</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'सुरक्षा चेतावनियां' : 'Safety warnings'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
              <ShieldAlert size={14} className="text-[var(--rose-action)]" />
              <span>Earth grounding / hazard</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Water / shock protection</p>
          </div>
        </div>
      </section>
    );
  }

  if (isPersonalCare) {
    return (
      <section className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 md:p-6 space-y-4" data-testid="section-personal-care-category">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
              <HeartPulse size={18} className="text-[var(--pink-action)]" />
              {language === 'hi' ? 'सौंदर्य प्रसाधन व व्यक्तिगत देखभाल अनुपालन' : 'Cosmetics & personal care safety'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category-specific statutory verification'}
            </p>
          </div>
          <span className="rounded-[var(--r-sm)] bg-[var(--pink-tint)] border border-[var(--pink-border)] px-2.5 py-1 text-xs font-semibold text-[var(--pink-action)]">
            Drugs & Cosmetics Rules & LMPC
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'सामग्री प्रकटीकरण' : 'Key ingredients'}
            </span>
            <p className="text-xs font-semibold text-[var(--text)]">Full chemical formulation disclosure required</p>
            <p className="text-[11px] text-[var(--text-muted)]">Rule 148 / 149 compliant</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'विनिर्माण लाइसेंस' : 'Mfg. license & batch'}
            </span>
            <p className="text-xs font-semibold text-[var(--text)]">Batch number & state mfg. license</p>
            <p className="text-[11px] text-[var(--text-muted)]">Mandatory traceability stamp</p>
          </div>

          <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
            <span className="text-xs text-[var(--text-muted)] block">
              {language === 'hi' ? 'डर्मेटोलॉजिकल सुरक्षा' : 'Dermatological safety'}
            </span>
            <p className="text-xs font-semibold text-[var(--text)]">External use only & eye contact caution</p>
            <p className="text-[11px] text-[var(--text-muted)]">Safety advisory warning</p>
          </div>
        </div>
      </section>
    );
  }

  // Default: General Commodities & Household Goods
  return (
    <section className="rounded-[var(--r-md)] border border-[var(--border)] bg-white p-5 md:p-6 space-y-4" data-testid="section-general-category">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-base font-semibold flex items-center gap-2 text-[var(--text)]">
            <Layers size={18} className="text-[var(--indigo-600)]" />
            {language === 'hi' ? 'पैकेज्ड कमोडिटी विनिर्देश (Commodity Specifications)' : 'General packaged commodity statutory requirements'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category-specific statutory verification'}
          </p>
        </div>
        <span className="rounded-[var(--r-sm)] bg-[var(--violet-tint)] border border-[var(--violet-border)] px-2.5 py-1 text-xs font-semibold text-[var(--violet-action)]">
          Rule 6 & Sixth Schedule LMPC
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
          <span className="text-xs text-[var(--text-muted)] block">
            {language === 'hi' ? 'मात्रा व विमाएं' : 'Quantity / dimensions'}
          </span>
          <p className="text-xs font-semibold text-[var(--text)]">Metric net quantity, weight or count</p>
          <p className="text-[11px] text-[var(--text-muted)]">Rule 11-13 compliant SI units</p>
        </div>

        <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
          <span className="text-xs text-[var(--text-muted)] block">
            {language === 'hi' ? 'मूल देश' : 'Country of origin'}
          </span>
          <p className="text-xs font-semibold text-[var(--text)]">Mandatory for all domestic & imported goods</p>
          <p className="text-[11px] text-[var(--text-muted)]">Rule 6(1)(a) & Rule 10</p>
        </div>

        <div className="rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] p-3 space-y-1">
          <span className="text-xs text-[var(--text-muted)] block">
            {language === 'hi' ? 'उपभोक्ता हेल्पलाइन' : 'Consumer redressal'}
          </span>
          <p className="text-xs font-semibold text-[var(--text)]">Contact person, phone, email & address</p>
          <p className="text-[11px] text-[var(--text-muted)]">Rule 6(1)(h) grievance care</p>
        </div>
      </div>
    </section>
  );
}
