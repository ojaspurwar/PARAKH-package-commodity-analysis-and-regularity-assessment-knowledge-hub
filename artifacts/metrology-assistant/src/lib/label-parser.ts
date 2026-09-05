import { buildCategorySpecificChecks } from './date-compliance';
import type { ComplianceCheck } from '@workspace/api-client-react';

export interface ParsedDeclarations {
  productName: string;
  category: 'Packaged food' | 'Personal care' | 'Household goods' | 'Electrical goods' | 'Textiles & Apparel' | 'Other';
  mrp: string | null;
  unitSalePrice: string | null;
  netQuantity: string | null;
  dateMarking: string | null;
  consumerCare: string | null;
  manufacturerPacker: string | null;
  countryOfOrigin: string | null;
  summary: string;
  status: 'compliant' | 'violation' | 'pending';
  checks: ComplianceCheck[];
  structuredSummary: string;
}

const ELECTRICAL_KEYWORDS = /\b(?:razer|deathadder|logitech|corsair|hp|dell|lenovo|asus|acer|intel|amd|nvidia|sony|boat|noise|boult|zebronics|portronics|sandisk|kingston|crucial|samsung|apple|xiaomi|realme|oneplus|oppo|vivo|canon|nikon|philips|havells|bajaj|crompton|syska|anchor|v-guard|microtek|luminous|electric|electrical|electronic|electronics|gadget|smart|sensor|optical|dpi|gaming|pc|laptop|computer|tablet|phone|mobile|smartphone|router|modem|drive|hard\s*disk|ssd|flash\s*drive|memory\s*card|printer|scanner|projector|mouse|mice|keyboard|headphone|headphones|earphone|earphones|earbuds|tws|audio|speaker|speakers|soundbar|headset|mic|microphone|camera|webcam|display|monitor|screen|tv|television|remote|battery|batteries|charger|charging|power\s*bank|adapter|cable|wire|plug|socket|switch|led|bulb|lamp|light|fan|iron|kettle|toaster|mixer|grinder|blender|oven|microwave|geyser|heater|cooler|refrigerator|fridge|washing\s*machine|vacuum|trimmer|shaver|hair\s*dryer|voltage|volt|volts|v~|vdc|vac|watt|watts|hz|khz|mhz|ghz|amp|amps|mah|ac|dc|input|output|usb|type-c|bluetooth|bt|wifi|wireless|bis|isi|r-\d{8}|is\s*:\s*\d+|model\s*no|serial\s*no)\b/i;
const FOOD_KEYWORDS = /\b(?:food|edible|atta|flour|tea\s*(?:bag|leaf|leaves|powder|dust)|coffee|spice|masala|salt|sugar|biscuit|cookie|bread|butter|ghee|paneer|milk|snack|bhujia|namkeen|potato\s*chips|chips|dal|rice|wheat|chocolate|candy|fssai|veg|vegetarian|cereal|noodle|pasta|sauce|jam|juice|beverage|pickles|syrup|energy\s*drink)\b/i;
const PERSONAL_CARE_KEYWORDS = /\b(?:soap|shampoo|conditioner|face\s*wash|cream|lotion|moisturizer|serum|sunscreen|perfume|deodorant|toothpaste|hair|cosmetic|skincare|cleanser|body\s*wash|sanitizer)\b/i;
const TEXTILE_KEYWORDS = /\b(?:cotton|polyester|silk|wool|linen|fabric|shirt|t-shirt|pant|trousers|dress|bedsheet|towel|blanket|curtain|apparel|textile|garment|meter|size\s*:\s*[smlxl]+)\b/i;
const HOUSEHOLD_KEYWORDS = /\b(?:detergent|cleaner|dishwash|disinfectant|floor|mosquito|repellent|wipe|scrubber|bleach|freshener)\b/i;

export function isValidProductName(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  const clean = str.trim().replace(/^[^\w]+|[^\w]+$/g, '');
  if (clean.length < 3 || clean.length > 80) return false;

  // Reject camera panel markers or placeholders
  if (/^(?:\[\s*panel|\bpanel\s*\d+|\bcapture\s*\d+|\bphoto\b|\bfront\b|\bback\b|\bside\b|\bimage\b|\bcamera\b)/i.test(clean)) return false;
  if (/^(?:scanning\s*package|packaged\s*retail|packaged\s*commodity|inspected\s*package)/i.test(clean)) return false;

  // Reject single-letter or 2-letter noise patterns like "ee a", "a b", "e e e", "x y z", "o e i"
  if (/^(?:[a-zA-Z0-9]{1,2}\s+)+[a-zA-Z0-9]{1,2}$/i.test(clean)) return false;
  if (/^[a-zA-Z0-9]{1,2}$/i.test(clean)) return false;

  // Reject known OCR garbage syllables
  if (/\b(?:ee\s*a|ee\s*eer|eer\s*tea|tea\s*a|oe\s*i|ae\s*i|a\s+b|c\s+d)\b/i.test(clean)) return false;

  // Reject lines that are primarily numbers, dates or symbols
  if (/^[\d\s.,:\/\\-]+$/.test(clean)) return false;

  // Reject common metadata headers mistaken for product name
  if (/^(?:mrp|net\s*(?:qty|quantity|wt|weight|vol|volume)?|mfd|pkd|mfg|exp|expiry|best\s*before|batch|lot|lic|fssai|rule|rules|lmpc|act|standard|compliance|customer|consumer|care|toll\s*free|phone|email|website|address|packed|manufactured|marketed|imported|distributor|by|regd|office|pvt|ltd|co)\b/i.test(clean)) return false;

  // Must contain at least one substantial word with 3+ alphabetic characters
  const words = clean.split(/\s+/);
  const hasSubstantialWord = words.some(w => /^[a-zA-Z]{3,}$/.test(w));
  if (!hasSubstantialWord) return false;

  return true;
}

export function inferCategoryFromText(text: string): 'Packaged food' | 'Personal care' | 'Household goods' | 'Electrical goods' | 'Textiles & Apparel' | 'Other' {
  if (ELECTRICAL_KEYWORDS.test(text)) return 'Electrical goods';
  if (PERSONAL_CARE_KEYWORDS.test(text)) return 'Personal care';
  if (FOOD_KEYWORDS.test(text)) return 'Packaged food';
  if (TEXTILE_KEYWORDS.test(text)) return 'Textiles & Apparel';
  if (HOUSEHOLD_KEYWORDS.test(text)) return 'Household goods';
  return 'Other';
}

export function parsePackageLabelText(
  rawText: string,
  preferredCategory?: string
): ParsedDeclarations {
  const text = rawText || '';
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Inferred Category: Prioritize text cues (especially electronics) over default/stale selection
  const inferred = inferCategoryFromText(text);
  let category: 'Packaged food' | 'Personal care' | 'Household goods' | 'Electrical goods' | 'Textiles & Apparel' | 'Other';
  if (inferred !== 'Other') {
    category = inferred;
  } else if (preferredCategory && preferredCategory !== 'Packaged food' && preferredCategory !== 'Other') {
    category = preferredCategory as any;
  } else {
    category = (preferredCategory as any) || 'Other';
  }

  // 2. Product Name Extraction
  // Prefer the first prominent line that is a valid product name
  let productName = '';
  for (const line of lines) {
    const cleaned = line.replace(/[|•–—].*$/, '').replace(/^\[.*?\]\s*/, '').trim();
    if (isValidProductName(cleaned)) {
      productName = cleaned;
      break;
    }
  }
  if (!productName) {
    productName = category !== 'Other' ? `${category} Commodity` : 'Packaged Retail Commodity';
  }

  // 3. MRP Extraction (Rule 6(1)(e))
  let mrp: string | null = null;
  const mrpP1 = /\b(?:mrp|max(?:imum)?\.?\s*retail\s*price)[^0-9\n\r]{0,40}?(?:rs\.?|inr|₹)\s*([\d][\d,]*(?:\.\d{1,2})?)/i;
  const mrpP2 = /(?:rs\.?|inr|₹)\s*([\d][\d,]*(?:\.\d{1,2})?)[^0-9\n\r]{0,35}?\b(?:mrp|max(?:imum)?\.?\s*retail\s*price)\b/i;
  const mrpP3 = /\b(?:mrp|max(?:imum)?\.?\s*retail\s*price)\s*[:.\-]?\s*(?:rs\.?|inr|₹)?\s*([\d][\d,]*(?:\.\d{1,2})?)(?:\s*[\/\-])?\b/i;
  const mrpP4 = /(?:rs\.?|inr|₹)\s*([\d][\d,]*(?:\.\d{1,2})?)/i;

  const m1 = text.match(mrpP1);
  const m2 = text.match(mrpP2);
  const m3 = text.match(mrpP3);
  const m4 = /\b(?:mrp|retail|price)\b/i.test(text) ? text.match(mrpP4) : null;
  const mrpValue = m1?.[1] || m2?.[1] || m3?.[1] || m4?.[1];

  if (mrpValue) {
    const hasTaxes = /\b(?:incl|tax)/i.test(text);
    mrp = `₹ ${mrpValue.replace(/,/g, '')}${hasTaxes ? ' (incl. of all taxes)' : ''}`;
  }

  // 4. Unit Sale Price (USP) (Rule 6(11))
  let unitSalePrice: string | null = null;
  const uspMatch = text.match(/(?:rs\.?|inr|₹)?\s*[\d][\d,]*(?:\.\d{1,2})?\s*\/\s*(?:100\s*)?(?:g|kg|ml|l|litre|liter|unit|piece|pc|pcs|nos|no)\b/i);
  if (uspMatch) {
    unitSalePrice = uspMatch[0].trim();
  }

  // 5. Net Quantity Extraction (Rule 12)
  let netQuantity: string | null = null;
  const qtyMatch = text.match(/\b(?:net\s*(?:qty|quantity|wt|weight|volume|content|fill)|net\.?)\s*[:.]?\s*([\d][\d.,]*)\s*(g|kg|ml|l|m|cm|u|unit|pcs|pieces|nos|count|sheet|sheets)\b/i) ||
                   text.match(/\b([\d][\d.,]*)\s*(g|kg|ml|l|m|cm|units?|pcs|pieces|nos)\b/i);
  if (qtyMatch?.[1] && qtyMatch?.[2]) {
    netQuantity = `${qtyMatch[1].trim()} ${qtyMatch[2].toLowerCase()}`;
  }

  // 6. Date Marking (Rule 6(1)(d))
  let dateMarking: string | null = null;
  const dateMatch = text.match(/\b(?:mfg|mfd|manufactur(?:ed|ing)|pack(?:ed|ing)|date|pkd)\s*(?:date)?\s*[:.]?\s*(\d{1,2}\/\d{2,4}|\d{1,2}[-\s.]\d{1,2}[-\s.]\d{2,4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4})\b/i) ||
                    text.match(/\b(?:best\s*before|expiry|exp)\s*[:.]?\s*([\d]{1,2}\/\d{2,4})\b/i) ||
                    text.match(/\b(0?[1-9]|1[0-2])[\/\-.](\d{4})\b/);
  if (dateMatch?.[1]) {
    dateMarking = dateMatch[0].trim();
  }

  // 7. Consumer Care Details (Rule 6(1)(da))
  let consumerCare: string | null = null;
  const phoneMatch = text.match(/(?:\+91[\s-]?)?(?:1800[\s-]?\d{3}[\s-]?\d{4}|[6-9]\d{9}|\d{4}[\s-]\d{3}[\s-]\d{3})/);
  const emailMatch = text.match(/\b[\w.+-]+@[\w-]+\.[\w.]{2,}\b/);
  if (phoneMatch || emailMatch) {
    consumerCare = [phoneMatch?.[0], emailMatch?.[0]].filter(Boolean).join(' | ');
  } else if (/\b(?:consumer\s*care|customer\s*care|toll\s*free|grievance)\b/i.test(text)) {
    consumerCare = 'Grievance contact declared';
  }

  // 8. Manufacturer / Packer Details (Rule 6(1)(a))
  let manufacturerPacker: string | null = null;
  const packerMatch = text.match(/(?:packed|manufactured|marketed|imported|distributed|mfd\.?\s*by)\s*(?:by)?\s*[:.]?\s*([^|\n\r]{5,80})/i);
  if (packerMatch?.[1]) {
    manufacturerPacker = packerMatch[1].trim();
  } else {
    // Check for postal PIN code
    const pinMatch = text.match(/\b[1-9]\d{5}\b/);
    if (pinMatch) {
      manufacturerPacker = `Registered packer (PIN: ${pinMatch[0]})`;
    }
  }

  // 9. Country of Origin (Rule 6(1)(aa) & Rule 10)
  let countryOfOrigin: string | null = 'India';
  const originMatch = text.match(/\b(?:country\s*of\s*origin|origin|made\s*in|product\s*of)\s*[:.-]?\s*([A-Za-z\s]{3,20})\b/i);
  if (originMatch?.[1]) {
    countryOfOrigin = originMatch[1].trim();
  }

  // 10. Run Deterministic Compliance Checks
  const checks = buildCategorySpecificChecks(category, {
    mrp,
    unitSalePrice,
    netQuantity,
    dateMarking,
    consumerCare,
    manufacturerPacker,
    countryOfOrigin,
    fullOcrText: text,
  });

  const hasViolations = checks.some(c => c.status === 'failed');
  const hasReview = checks.some(c => c.status === 'review');
  const status: 'compliant' | 'violation' | 'pending' = hasViolations ? 'violation' : (hasReview ? 'pending' : 'compliant');

  const summary = hasViolations
    ? `Statutory violations detected under LMPC Rules, 2011 (${checks.filter(c => c.status === 'failed').map(c => c.label).join(', ')}).`
    : `Primary statutory declarations verified compliant under Rule 6 & Rule 7.`;

  const structuredSummary = [
    `PRODUCT: ${productName}`,
    `CATEGORY: ${category}`,
    mrp ? `MRP: ${mrp}` : 'MRP: Not detected',
    unitSalePrice ? `UNIT SALE PRICE: ${unitSalePrice}` : '',
    netQuantity ? `NET QUANTITY: ${netQuantity}` : '',
    dateMarking ? `DATE OF MFG / PACKING: ${dateMarking}` : '',
    consumerCare ? `CONSUMER CARE: ${consumerCare}` : '',
    manufacturerPacker ? `MANUFACTURER / PACKER: ${manufacturerPacker}` : '',
    countryOfOrigin ? `COUNTRY OF ORIGIN: ${countryOfOrigin}` : 'COUNTRY OF ORIGIN: India',
    '',
    '--- STATUTORY COMPLIANCE STATUS ---',
    `VERDICT: ${status.toUpperCase()}`,
    ...(hasViolations
      ? ['VIOLATIONS DETECTED:', ...checks.filter((c) => c.status === 'failed').map((c) => `• [${c.label}]: ${c.note}`)]
      : ['All primary statutory declarations verified under LMPC Rules, 2011.']),
    '',
    '--- EXTRACTED LABEL TEXT ---',
    text,
  ].filter(Boolean).join('\n');

  return {
    productName,
    category,
    mrp,
    unitSalePrice,
    netQuantity,
    dateMarking,
    consumerCare,
    manufacturerPacker,
    countryOfOrigin,
    summary,
    status,
    checks,
    structuredSummary,
  };
}
