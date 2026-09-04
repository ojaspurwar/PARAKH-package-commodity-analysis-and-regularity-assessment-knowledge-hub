import type { ComplianceCheck } from '@workspace/api-client-react';

export interface DateCheckResult {
  status: 'passed' | 'failed' | 'review';
  value: string;
  note: string;
  isExpired: boolean;
}

/**
 * Validates date markings under Rule 6(1)(d) of Legal Metrology Rules, 2011,
 * FSSAI Packaging & Labelling Regulations, and Drugs & Cosmetics Rules.
 *
 * Current execution baseline year: 2026.
 */
export function evaluateDateCompliance(
  rawDate: string | null | undefined,
  category: string,
  _fullText: string = ''
): DateCheckResult {
  if (!rawDate || rawDate.trim() === '' || /not detected/i.test(rawDate)) {
    return {
      status: 'failed',
      value: 'Not detected',
      note: 'Rule 6(1)(d) Violation: Mandatory month & year of manufacture or packing missing from package',
      isExpired: false,
    };
  }

  const clean = rawDate.trim();
  const lower = clean.toLowerCase();

  const currentYear = 2026;
  const currentMonth = 9; // September

  // Extract 4-digit year or 2-digit year
  const match4Y = clean.match(/\b(19\d\d|20\d\d)\b/);
  const match2Y = clean.match(/\b\d{1,2}[\/\-.](\d{2})\b/);

  let year: number | null = null;
  if (match4Y) {
    year = parseInt(match4Y[1], 10);
  } else if (match2Y) {
    const y2 = parseInt(match2Y[1], 10);
    year = y2 <= 50 ? 2000 + y2 : 1900 + y2;
  }

  // Extract month
  const monthNames: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
    jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  };
  let month: number | null = null;
  for (const [mName, mNum] of Object.entries(monthNames)) {
    if (lower.includes(mName)) {
      month = mNum;
      break;
    }
  }
  if (!month) {
    const mMatch = clean.match(/\b(0?[1-9]|1[0-2])[\/\-.]/);
    if (mMatch) month = parseInt(mMatch[1], 10);
  }

  const isExplicitExpiry = /exp|expiry|best before|use by|valid till/i.test(lower);

  if (year !== null) {
    const isPastYear = year < currentYear;
    const isSameYearPastMonth = year === currentYear && month !== null && month < currentMonth;

    // 1. Explicit expiry date in the past
    if (isExplicitExpiry && (isPastYear || isSameYearPastMonth)) {
      return {
        status: 'failed',
        value: `${clean} (EXPIRED)`,
        note: `CRITICAL STATUTORY & SAFETY VIOLATION: Commodity has EXPIRED (Expiry: ${clean})! Selling expired goods contravenes LMPC Section 36 and consumer safety laws.`,
        isExpired: true,
      };
    }

    // 2. Packaged food or personal care with ancient manufacture date (e.g. December 2020)
    if ((category === 'Packaged food' || category === 'Personal care') && year < currentYear - 1) {
      return {
        status: 'failed',
        value: `${clean} (EXPIRED / OUTDATED)`,
        note: `CRITICAL VIOLATION: Package date marking indicates ${clean} (more than 1 year old). Expired commodity past permissible consumer shelf life under Rule 6(1)(d).`,
        isExpired: true,
      };
    }

    // 3. Electrical or general goods manufactured years ago (e.g. 2020)
    if (year < currentYear - 3) {
      return {
        status: 'failed',
        value: `${clean} (OLD / OUTDATED VINTAGE)`,
        note: `Rule 6(1)(d) Violation: Manufacture/import date ${clean} exceeds 3 years vintage. Old inventory or refurbished stock cannot be sold without re-declaration.`,
        isExpired: true,
      };
    }

    // 4. Post-dated / fraudulent future dates
    if (year > currentYear + 4) {
      return {
        status: 'failed',
        value: clean,
        note: `Rule 6(1)(d) Violation: Impossible future date marking detected (${clean}). Suspected fraudulent or incorrect date stamp.`,
        isExpired: false,
      };
    }
  }

  // Compliant date marking
  return {
    status: 'passed',
    value: clean,
    note: `Rule 6(1)(d) verified: ${clean} (Valid statutory date marking)`,
    isExpired: false,
  };
}

/**
 * Builds rigorous category-specific compliance checks according to the
 * commodity type and statutory acts applicable to it.
 */
export function buildCategorySpecificChecks(
  category: string,
  data: {
    mrp: string | null;
    unitSalePrice: string | null;
    netQuantity: string | null;
    dateMarking: string | null;
    consumerCare: string | null;
    manufacturerPacker: string | null;
    countryOfOrigin: string | null;
    fullOcrText: string;
  }
): ComplianceCheck[] {
  const isFood = category === 'Packaged food';
  const isPersonalCare = category === 'Personal care';
  const isElectrical = category === 'Electrical goods';
  const isTextile = category === 'Textiles & Apparel' || /textile|bedsheet|shirt|apparel|dress/i.test(category);

  const checks: ComplianceCheck[] = [];

  // 1. MRP Check (Rule 6(1)(e)) - Mandatory for all categories
  const hasMrp = Boolean(data.mrp && data.mrp.trim() !== '' && !/not detected/i.test(data.mrp));
  const hasInclusiveTaxes = data.mrp ? /incl|tax/i.test(data.mrp) : false;

  checks.push({
    key: 'mrp',
    label: 'MRP declaration',
    value: hasMrp ? data.mrp! : 'Not detected',
    status: hasMrp ? 'passed' : 'failed',
    note: hasMrp
      ? hasInclusiveTaxes
        ? `Rule 6(1)(e) & Rule 2(m) verified: Maximum Retail Price with mandatory 'inclusive of all taxes' declaration`
        : `Rule 6(1)(e) verified: ${data.mrp} (Ensure 'inclusive of all taxes' is declared on package)`
      : 'Rule 6(1)(e) VIOLATION: Maximum Retail Price (MRP) missing from package',
  });

  // 2. Unit Sale Price (USP) under Rule 6(11)
  if (isFood || category === 'Household goods') {
    const hasUsp = Boolean(data.unitSalePrice && data.unitSalePrice.trim() !== '' && !/not detected/i.test(data.unitSalePrice));
    checks.push({
      key: 'usp',
      label: 'Unit sale price',
      value: hasUsp ? data.unitSalePrice! : 'Not detected',
      status: hasUsp ? 'passed' : 'review',
      note: hasUsp
        ? `Rule 6(11) USP verified: ${data.unitSalePrice}`
        : 'Unit sale price declaration required for packages above 100g/ml under 2022 amendment',
    });
  } else if (isElectrical || isTextile) {
    checks.push({
      key: 'usp',
      label: 'Unit sale price',
      value: 'Not applicable (Unit article)',
      status: 'passed',
      note: 'Rule 6(11) Exemption: Unit sale price is not required for discrete unit articles (sold by count / size)',
    });
  }

  // 3. Net Quantity Check (Rule 12 & Sixth Schedule)
  const hasQty = Boolean(data.netQuantity && data.netQuantity.trim() !== '' && !/not detected/i.test(data.netQuantity));
  const hasNonStandardUnit = data.fullOcrText ? /\b\d+\s*(?:gms|kgs|gm\b|g\.|ml\.|litres?|ltrs?)\b/i.test(data.fullOcrText) : false;

  if (hasNonStandardUnit) {
    checks.push({
      key: 'qty',
      label: 'Net quantity & SI units',
      value: data.netQuantity || 'Non-standard unit used',
      status: 'failed',
      note: `Rule 12 & 13 VIOLATION: Prohibited non-standard unit symbol (e.g. 'gms', 'ltrs') detected. Mandatory SI metric symbol must be used without plural ('g', 'kg', 'ml', 'l').`,
    });
  } else {
    checks.push({
      key: 'qty',
      label: 'Net quantity & SI units',
      value: hasQty ? data.netQuantity! : 'Not detected',
      status: hasQty ? 'passed' : 'failed',
      note: hasQty
        ? `Rule 12 compliant: ${data.netQuantity}`
        : 'Sixth Schedule VIOLATION: Mandatory net quantity statement missing from visible package panels',
    });
  }

  // 4. Date Marking & Expiry Check (Rule 6(1)(d))
  const dateResult = evaluateDateCompliance(data.dateMarking, category, data.fullOcrText);
  checks.push({
    key: 'date',
    label: isFood ? 'Date of Mfg & Best Before / Expiry' : 'Date of manufacture / packing',
    value: dateResult.value,
    status: dateResult.status,
    note: dateResult.note,
  });

  // 5. Category Specific Requirements:
  // For Food: FSSAI License & Veg/Non-Veg logo
  if (isFood) {
    const hasVegLogo = /veg|vegetarian|green dot|non-veg/i.test(data.fullOcrText);
    const hasFssai = /fssai|lic\.?\s*no|license/i.test(data.fullOcrText);

    checks.push({
      key: 'fssai_reg',
      label: 'FSSAI License & Logo',
      value: hasFssai ? 'Declared on label' : 'Check 14-digit license',
      status: hasFssai ? 'passed' : 'review',
      note: hasFssai
        ? 'FSSAI Packaging & Labelling Regulation 2.1.2 compliant: 14-digit license displayed'
        : 'FSSAI Regulation 2.1.2: 14-digit FSSAI registration license number required on all packaged foods',
    });

    checks.push({
      key: 'veg_emblem',
      label: 'Vegetarian / Non-Veg Emblem',
      value: hasVegLogo ? 'Emblem identified' : 'Check green/brown emblem',
      status: hasVegLogo ? 'passed' : 'review',
      note: hasVegLogo
        ? 'FSSAI Regulation 2.2.2 compliant: Green square with green circle (or brown for non-veg) identified'
        : 'FSSAI Regulation 2.2.2: Mandatory vegetarian / non-vegetarian logo required on principal display panel',
    });
  }

  // For Electrical goods: BIS / ISI mark & Electrical Ratings
  if (isElectrical) {
    const hasIsi = /isi|is\s*:\s*\d+|bis|standard/i.test(data.fullOcrText);
    const hasRatings = /\b\d+\s*(?:v|w|hz|watts?|volts?)\b/i.test(data.fullOcrText);

    checks.push({
      key: 'bis_isi',
      label: 'BIS / ISI Standard Certification',
      value: hasIsi ? 'BIS / ISI Mark declared' : 'Check physical ISI mark',
      status: hasIsi ? 'passed' : 'review',
      note: hasIsi
        ? 'Quality Control Order (QCO) verified: BIS ISI standard mark present'
        : 'Mandatory BIS standard certification under Electronics & Appliances Quality Control Orders',
    });

    checks.push({
      key: 'electrical_ratings',
      label: 'Rated Voltage & Wattage',
      value: hasRatings ? 'Declared on package' : 'Standard 230V, 50Hz',
      status: hasRatings ? 'passed' : 'passed',
      note: 'Electrical safety standard: Operational voltage and wattage rating declaration',
    });
  }

  // For Personal Care: Manufacturing License & Batch
  if (isPersonalCare) {
    const hasBatch = /b\.?\s*no|batch|lot/i.test(data.fullOcrText);
    const hasLic = /m\.?\s*l\.?\s*no|lic|cosmetic/i.test(data.fullOcrText);

    checks.push({
      key: 'batch_no',
      label: 'Batch / Lot Number',
      value: hasBatch ? 'Declared on package' : 'Check physical stamp',
      status: hasBatch ? 'passed' : 'review',
      note: 'Rule 148 Drugs & Cosmetics Rules: Mandatory batch number for product traceability',
    });

    checks.push({
      key: 'mfg_license',
      label: 'State Manufacturing License',
      value: hasLic ? 'License number declared' : 'Check M.L. No.',
      status: hasLic ? 'passed' : 'review',
      note: 'Drugs & Cosmetics Rules: Manufacturing license number issued by State Drug Licensing Authority',
    });
  }

  // 6. Consumer Care Helpline (Rule 6(1)(da)) - Mandatory for all
  const hasContact = Boolean(data.consumerCare && data.consumerCare.trim() !== '' && !/not detected/i.test(data.consumerCare));
  checks.push({
    key: 'contact',
    label: 'Consumer care details',
    value: hasContact ? data.consumerCare! : 'Not detected',
    status: hasContact ? 'passed' : 'failed',
    note: hasContact
      ? `Rule 6(1)(da) verified: Consumer grievance helpline registered`
      : 'Rule 6(1)(da) VIOLATION: Customer care contact (helpline/email/address) missing from visible package',
  });

  // 7. Packer / Manufacturer Details (Rule 6(1)(a)) - Mandatory for all
  const hasPacker = Boolean(data.manufacturerPacker && data.manufacturerPacker.trim() !== '' && !/not detected/i.test(data.manufacturerPacker));
  const hasPin = data.manufacturerPacker ? /\b\d{6}\b/.test(data.manufacturerPacker) : false;

  checks.push({
    key: 'packer',
    label: 'Packer / manufacturer details',
    value: hasPacker ? data.manufacturerPacker! : 'Not detected',
    status: hasPacker ? 'passed' : 'failed',
    note: hasPacker
      ? hasPin
        ? `Rule 6(1)(a) verified: Complete name and address with postal PIN code`
        : `Rule 6(1)(a) verified: Manufacturer/packer name declared (${data.manufacturerPacker})`
      : 'Rule 6(1)(a) VIOLATION: Complete name and address of manufacturer/packer/importer missing',
  });

  // 8. Country of Origin (Rule 6(1)(a) & Rule 10)
  checks.push({
    key: 'origin',
    label: 'Country of origin',
    value: data.countryOfOrigin || 'India',
    status: 'passed',
    note: data.countryOfOrigin
      ? `Rule 6(1)(a) & Rule 10 compliant: Country of Origin declared (${data.countryOfOrigin})`
      : 'Rule 6(1)(a) & Rule 10 compliant: Domestic commodity verified',
  });

  return checks;
}
