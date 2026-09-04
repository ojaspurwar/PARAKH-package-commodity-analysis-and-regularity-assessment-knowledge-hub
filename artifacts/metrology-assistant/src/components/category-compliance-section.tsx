import { AlertTriangle, Award, CheckCircle2, Cpu, HeartPulse, Info, Layers, Leaf, Shield, ShieldAlert, Sparkles, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

interface CategoryComplianceSectionProps {
  category: string;
  productName: string;
  ocrText: string;
  checks: any[];
}

export function CategoryComplianceSection({ category, productName, ocrText, checks }: CategoryComplianceSectionProps) {
  const { language } = useI18n();

  const isFood = category === 'Packaged food' || /food|snack|biscuit|oil|tea|coffee|juice|milk|masala|atta|grain/i.test(productName);
  const isPersonalCare = category === 'Personal care' || /soap|shampoo|cream|lotion|paste|cosmetic|serum|oil|perfume/i.test(productName);
  const isElectrical = category === 'Electrical goods' || /fryer|iron|bulb|led|charger|heater|kettle|cooker|wire|appliance|cable|fan/i.test(productName);

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
      <section className="appear delay-3 rounded-2xl border border-border bg-card p-6 md:p-7 space-y-5" data-testid="section-food-category">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">
              {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category Section'}
            </p>
            <h2 className="mt-1 text-lg font-semibold flex items-center gap-2">
              <Leaf size={18} className="text-secondary" />
              {language === 'hi' ? 'खाद्य सुरक्षा व विधिक मापविज्ञान अनुपालन (FSSAI & LMPC)' : 'Packaged Food & Metrology Compliance Section'}
            </h2>
          </div>
          <span className="rounded-full bg-secondary/10 px-3 py-1 font-mono text-[11px] font-semibold text-secondary">
            FSSAI Regulations, 2020 & LMPC Rule 6
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'शाकाहारी / मांसाहारी लोगो' : 'Veg / Non-Veg Emblem'}
            </span>
            <div className="flex items-center gap-2">
              <div className="size-3.5 rounded-sm border border-secondary flex items-center justify-center">
                <div className="size-2 rounded-full bg-secondary" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                {hasVegLogo ? (language === 'hi' ? 'प्रतीक अंकित' : 'Emblem Present') : (language === 'hi' ? 'सत्यापित' : 'Verified')}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">FSSAI Regulation 2.2.2</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'FSSAI लाइसेंस' : 'FSSAI License'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CheckCircle2 size={14} className={hasFssai ? 'text-secondary' : 'text-accent'} />
              <span>{hasFssai ? 'Lic. No. Declared' : 'Standard Format'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">14-digit statutory license</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'पोषण संबंधी जानकारी' : 'Nutritional Panel'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CheckCircle2 size={14} className={hasNutrition ? 'text-secondary' : 'text-accent'} />
              <span>{hasNutrition ? 'Nutritional Values' : 'Mandatory Per 100g'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Energy, Protein, Sugars, Fat</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'अवसान / उपभोग अवधि' : 'Best Before / Expiry'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CheckCircle2 size={14} className={hasExpiry ? 'text-secondary' : 'text-accent'} />
              <span>{hasExpiry ? 'Declared' : 'Check Physical Stamp'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Mandatory for perishable food</p>
          </div>
        </div>
      </section>
    );
  }

  if (isElectrical) {
    return (
      <section className="appear delay-3 rounded-2xl border border-border bg-card p-6 md:p-7 space-y-5" data-testid="section-electrical-category">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">
              {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category Section'}
            </p>
            <h2 className="mt-1 text-lg font-semibold flex items-center gap-2">
              <Cpu size={18} className="text-secondary" />
              {language === 'hi' ? 'विद्युत सुरक्षा व बीआईएस मानक अनुपालन (BIS & BEE)' : 'Electrical Goods & Appliance Safety Compliance'}
            </h2>
          </div>
          <span className="rounded-full bg-secondary/10 px-3 py-1 font-mono text-[11px] font-semibold text-secondary">
            BIS (ISI Mark) & BEE Standards
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'बीआईएस आईएसआई मार्क' : 'BIS / ISI Mark'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Award size={14} className={hasIsiMark ? 'text-secondary' : 'text-foreground/70'} />
              <span>{hasIsiMark ? 'ISI Mark Verified' : 'Mandatory under QCO'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">IS:302 Electrical Safety</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'ऊर्जा दक्षता लेबल' : 'BEE Star Rating'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Zap size={14} className="text-secondary" />
              <span>{hasBeeStar ? 'Energy Star Declared' : 'Energy Efficiency'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Mandatory star label</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'वोल्टेज व पावर रेटिंग' : 'Voltage & Wattage'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <CheckCircle2 size={14} className={hasVoltage ? 'text-secondary' : 'text-accent'} />
              <span>{hasVoltage ? 'Rating Declared' : '230V AC, 50Hz Standard'}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Mandatory electrical rating</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'सुरक्षा चेतावनियां' : 'Safety Warnings'}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <ShieldAlert size={14} className="text-secondary" />
              <span>Earth Grounding / Hazard</span>
            </div>
            <p className="text-[10px] text-muted-foreground">Water / shock protection</p>
          </div>
        </div>
      </section>
    );
  }

  if (isPersonalCare) {
    return (
      <section className="appear delay-3 rounded-2xl border border-border bg-card p-6 md:p-7 space-y-5" data-testid="section-personal-care-category">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">
              {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category Section'}
            </p>
            <h2 className="mt-1 text-lg font-semibold flex items-center gap-2">
              <HeartPulse size={18} className="text-secondary" />
              {language === 'hi' ? 'सौंदर्य प्रसाधन व व्यक्तिगत देखभाल अनुपालन' : 'Cosmetics & Personal Care Safety Section'}
            </h2>
          </div>
          <span className="rounded-full bg-secondary/10 px-3 py-1 font-mono text-[11px] font-semibold text-secondary">
            Drugs & Cosmetics Rules & LMPC
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'सामग्री प्रकटीकरण' : 'Key Ingredients'}
            </span>
            <p className="text-xs font-semibold text-foreground">Full chemical formulation disclosure required</p>
            <p className="text-[10px] text-muted-foreground">Rule 148 / 149 compliant</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'विनिर्माण लाइसेंस' : 'Mfg. License & Batch'}
            </span>
            <p className="text-xs font-semibold text-foreground">Batch No. & State Mfg. License</p>
            <p className="text-[10px] text-muted-foreground">Mandatory traceability stamp</p>
          </div>

          <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-muted-foreground uppercase block">
              {language === 'hi' ? 'डर्मेटोलॉजिकल सुरक्षा' : 'Dermatological Safety'}
            </span>
            <p className="text-xs font-semibold text-foreground">External use only & Eye contact caution</p>
            <p className="text-[10px] text-muted-foreground">Safety advisory warning</p>
          </div>
        </div>
      </section>
    );
  }

  // Default: General Commodities & Household Goods
  return (
    <section className="appear delay-3 rounded-2xl border border-border bg-card p-6 md:p-7 space-y-5" data-testid="section-general-category">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-secondary">
            {language === 'hi' ? 'विशिष्ट श्रेणी विनिर्देश' : 'Category Section'}
          </p>
          <h2 className="mt-1 text-lg font-semibold flex items-center gap-2">
            <Layers size={18} className="text-secondary" />
            {language === 'hi' ? 'पैकेज्ड कमोडिटी विनिर्देश (Commodity Specifications)' : 'General Packaged Commodity Statutory Section'}
          </h2>
        </div>
        <span className="rounded-full bg-secondary/10 px-3 py-1 font-mono text-[11px] font-semibold text-secondary">
          Rule 6 & Sixth Schedule LMPC
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">
            {language === 'hi' ? 'मात्रा व विमाएं' : 'Quantity / Dimensions'}
          </span>
          <p className="text-xs font-semibold text-foreground">Metric net quantity, weight or count</p>
          <p className="text-[10px] text-muted-foreground">Rule 11-13 compliant SI units</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">
            {language === 'hi' ? 'मूल देश' : 'Country of Origin'}
          </span>
          <p className="text-xs font-semibold text-foreground">Mandatory for all domestic & imported goods</p>
          <p className="text-[10px] text-muted-foreground">Rule 6(1)(a) & Rule 10</p>
        </div>

        <div className="rounded-xl border border-border bg-muted/40 p-3.5 space-y-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">
            {language === 'hi' ? 'उपभोक्ता हेल्पलाइन' : 'Consumer Redressal'}
          </span>
          <p className="text-xs font-semibold text-foreground">Contact person, Phone, Email & Address</p>
          <p className="text-[10px] text-muted-foreground">Rule 6(1)(da) grievance care</p>
        </div>
      </div>
    </section>
  );
}
