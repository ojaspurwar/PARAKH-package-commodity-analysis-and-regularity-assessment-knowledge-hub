import { logger } from './logger';

export interface AiVisionAnalysisRequest {
  image?: string;
  text?: string;
}

export interface HealthImpactReport {
  ingredients: string[];
  benefits: string[];
  harmsAndRisks: string[];
  healthScore: string;
  safetyRating: string;
  dietaryAdvisories: string[];
  allergens: string[];
}

export interface TechnicalSafetyReport {
  technicalSpecs: Array<{ label: string; value: string }>;
  safetyWarnings: string[];
  certificationMarks: string[];
  precautions: string[];
}

export interface AiVisionAnalysisResult {
  productName: string;
  category: 'Packaged food' | 'Personal care' | 'Household goods' | 'Electrical goods' | 'Other';
  mrp: string | null;
  unitSalePrice: string | null;
  netQuantity: string | null;
  dateMarking: string | null;
  consumerCare: string | null;
  manufacturerPacker: string | null;
  countryOfOrigin: string | null;
  summary: string;
  status: 'compliant' | 'violation' | 'pending';
  fullOcrText: string;
  missingDeclarations: string[];
  confidence: number;
  healthReport: HealthImpactReport | null;
  technicalSafetyReport: TechnicalSafetyReport | null;
}



export async function analyzePackageWithAi(req: AiVisionAnalysisRequest): Promise<AiVisionAnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.AI_VISION_MODEL || 'google/gemini-2.5-flash';

  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set. Add it to your .env file.');
  }

  if (!req.image && !req.text) {
    throw new Error('Either an image or label text must be provided for AI analysis.');
  }

  const prompt = `You are an expert Legal Metrology Enforcement Officer and Senior Product Safety Inspector analyzing packaged commodity labels under the Legal Metrology (Packaged Commodities) Rules, 2011 (India), FSSAI Regulations, BIS Standards, and Drugs & Cosmetics Rules.
Baseline Current Year: 2026.

Examine the package label image (or provided text) thoroughly with maximum optical scrutiny and perform the following assessments:

1. AUTOMATED CATEGORY IDENTIFICATION:
   Classify the product into EXACTLY ONE of the following 6 categories:
   - 'Packaged food' (edibles, snacks, tea/coffee, biscuits, spices, edible oils, confectionary, grains, dairy, health supplements)
   - 'Personal care' (soap, shampoo, face cream, toothpaste, lotion, cosmetics, perfume, hair oil, skincare)
   - 'Electrical goods' (appliances, air fryers, bulbs, LEDs, chargers, cables, irons, kettles, power tools, electronics, gadgets)
   - 'Household goods' (detergents, cleaners, floor liquids, mosquito repellents, kitchenware, batteries)
   - 'Textiles & Apparel' (clothing, shirts, bedsheets, fabrics, footwear, towels)
   - 'Other' (stationery, hardware, tools, toys, etc.)

2. MAXIMUM RETAIL PRICE (MRP) SCRUTINY (CRITICAL REQUIREMENT):
   Search EVERY PANEL, barcode white box, top/bottom flap, lid, crimp seal, and side margin for the Maximum Retail Price:
   - Price on Indian packages is frequently printed in INKJET DOT-MATRIX characters, stamped numbers, or in a white rectangular price box next to the barcode.
   - Look for: 'MRP', 'M.R.P.', 'MAX. RETAIL PRICE', 'RETAIL PRICE', 'Rs.', 'Rs', '₹', 'INR', or numbers followed by '/-' (e.g. '15/-' or '250.00').
   - Decipher dot-matrix numerals (e.g., dots forming 1, 2, 5, 0, 9, 8).
   - Format: Include currency symbol and tax declaration if visible (e.g. "₹ 249.00 (incl. of all taxes)" or "₹ 15.00").
   - ONLY return null if there is truly NO price printed anywhere on the visible package.

3. DATE MARKING, SHELF LIFE & EXPIRY VALIDATION (CRITICAL REQUIREMENT):
   - Extract the exact Month & Year of manufacture, packing, or import (e.g. 'MFD: 08/2026', 'PKD: 01/2026', 'Dec 2024').
   - For 'Packaged food': Extract BOTH Date of Mfg AND 'Best Before' / 'Expiry Date' / 'Use By Date'.
   - EXPIRY CHECK (CURRENT YEAR IS 2026):
     * If any food, cosmetic, or perishable product has an expiry date that has passed (e.g., 2020, 2021, 2022, 2023, 2024, or early 2025):
       You MUST set "status": "violation"!
       Add to "missingDeclarations": "CRITICAL VIOLATION: Commodity has EXPIRED (Date: [Date]). Sale of expired goods violates Section 36 LMPC & Consumer Protection Act."
     * If Date of Manufacture is more than 2 years old (e.g., 'December 2020'):
       Flag as expired / outdated stock ("status": "violation").
     * If NO manufacture or packing date is found on the package:
       Set "dateMarking": null! DO NOT extrapolate, fabricate, or guess a date!
       Set "status": "violation" (Mandatory Rule 6(1)(d) violation).

4. WHAT DATA TO SHOW ACCORDING TO COMMODITY CATEGORY:
   - For 'Packaged food':
     * Check FSSAI 14-digit license number and Vegetarian/Non-Vegetarian logo (green square with green dot).
     * Populate "healthReport" with culinary ingredients, health benefits, health risks/harms (high sodium, palm oil, refined sugars), allergens, and dietary advisories. Set "technicalSafetyReport" to null.
   - For 'Personal care':
     * Check for Manufacturing License No. (M.L. No.) and Batch No.
     * Populate "healthReport" focused strictly on cosmetic chemistry: formulation ingredients, skin/hair benefits, potential sensitization warnings. Set "technicalSafetyReport" to null.
   - For 'Electrical goods':
     * Check for BIS ISI mark (IS: 302 standard) and operational voltage/wattage.
     * Note: Food expiry date and FSSAI DO NOT apply to electrical goods!
     * Populate "technicalSafetyReport" (voltage/power specs, electrical shock/fire warnings, certification marks). Set "healthReport" to null.
   - For 'Household goods' & 'Textiles & Apparel':
     * Populate "technicalSafetyReport" with dimensions, fiber/material specs, safe handling. Set "healthReport" to null.

5. STATUTORY VIOLATION VERDICT:
   - If ANY mandatory declaration is missing (MRP, Net Qty, Date of Mfg, Packer address with PIN, Customer Care helpline) OR if the product is EXPIRED:
     Set "status": "violation"!
   - Only set "status": "compliant" if ALL mandatory statutory declarations are present, valid, and not expired!

Return a strictly valid JSON object conforming to this schema:
{
  "productName": "Common or generic name of the commodity and brand",
  "category": "Packaged food | Personal care | Household goods | Electrical goods | Textiles & Apparel | Other",
  "mrp": "Maximum Retail Price formatted with Rs or ₹ or null",
  "unitSalePrice": "Unit sale price or null",
  "netQuantity": "Standard net quantity in metric units or null",
  "dateMarking": "Month & year of manufacture/packing, or null if missing",
  "consumerCare": "Customer care details or null",
  "manufacturerPacker": "Complete name and address of manufacturer/packer with PIN or null",
  "countryOfOrigin": "Country of origin or null",
  "summary": "Concise 2-3 sentence executive summary explaining what product this is, compliance with Legal Metrology Rules, and category-relevant safety or health assessment.",
  "status": "compliant | violation | pending",
  "fullOcrText": "Complete transcription of all text, numbers, specifications and codes visible on the label",
  "missingDeclarations": ["Array of string names of any mandatory declarations under Rule 6 that are missing or violations found"],
  "confidence": 0.95,
  "healthReport": {
    "ingredients": ["..."],
    "benefits": ["..."],
    "harmsAndRisks": ["..."],
    "healthScore": "X/10",
    "safetyRating": "...",
    "dietaryAdvisories": ["..."],
    "allergens": ["..."]
  },
  "technicalSafetyReport": {
    "technicalSpecs": [{"label": "...", "value": "..."}],
    "safetyWarnings": ["..."],
    "certificationMarks": ["..."],
    "precautions": ["..."]
  }
}`;

  const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
    { type: 'text', text: prompt }
  ];

  if (req.text) {
    contentParts.push({ type: 'text', text: `Context/Provided text: ${req.text}` });
  }

  if (req.image) {
    contentParts.push({ type: 'image_url', image_url: { url: req.image } });
  }

  logger.info({ model }, 'Calling OpenRouter Vision AI for package analysis');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://parakh.nic.in',
      'X-Title': 'PARAKH Legal Metrology AI Scanner'
    },
    body: JSON.stringify({
      model,
      max_tokens: 2200,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: contentParts
        }
      ],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    logger.error({ status: response.status, errText }, 'OpenRouter AI request failed');
    throw new Error(`AI vision request failed (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as any;
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error('No content returned from AI Vision model.');
  }

  try {
    const parsed = JSON.parse(rawText);
    const validCategories = ['Packaged food', 'Personal care', 'Household goods', 'Electrical goods', 'Textiles & Apparel', 'Other'] as const;
    const category = validCategories.includes(parsed.category) ? parsed.category : 'Other';

    // Strict compliance status check:
    const rawDate = parsed.dateMarking ? String(parsed.dateMarking).trim() : '';
    const dateYearMatch = rawDate.match(/\b(19\d\d|20\d\d)\b/);
    const dateYear = dateYearMatch ? parseInt(dateYearMatch[1], 10) : null;
    const isPerishable = category === 'Packaged food' || category === 'Personal care';
    const isOldDate = isPerishable && dateYear !== null && dateYear < 2025;
    const isExpired = (isPerishable && Array.isArray(parsed.missingDeclarations) && parsed.missingDeclarations.some((d: string) => /expired/i.test(d))) || isOldDate || (isPerishable && /expir/i.test(rawDate));
    const isMissingMandatory = !parsed.mrp || !parsed.netQuantity || !parsed.dateMarking || !parsed.manufacturerPacker;
    const status = (isExpired || isMissingMandatory || parsed.status === 'violation') ? 'violation' : (parsed.status === 'compliant' ? 'compliant' : 'pending');

    // Only construct healthReport if category is food or personal care
    let healthReport: HealthImpactReport | null = null;
    if ((category === 'Packaged food' || category === 'Personal care') && parsed.healthReport) {
      healthReport = {
        ingredients: Array.isArray(parsed.healthReport?.ingredients)
          ? parsed.healthReport.ingredients.map(String)
          : [],
        benefits: Array.isArray(parsed.healthReport?.benefits)
          ? parsed.healthReport.benefits.map(String)
          : [],
        harmsAndRisks: Array.isArray(parsed.healthReport?.harmsAndRisks)
          ? parsed.healthReport.harmsAndRisks.map(String)
          : [],
        healthScore: String(parsed.healthReport?.healthScore || 'N/A').trim(),
        safetyRating: String(parsed.healthReport?.safetyRating || 'Standard').trim(),
        dietaryAdvisories: category === 'Packaged food' && Array.isArray(parsed.healthReport?.dietaryAdvisories)
          ? parsed.healthReport.dietaryAdvisories.map(String)
          : [],
        allergens: Array.isArray(parsed.healthReport?.allergens)
          ? parsed.healthReport.allergens.map(String)
          : [],
      };
    }

    // Technical / Safety report for non-food items
    let technicalSafetyReport: TechnicalSafetyReport | null = null;
    if (category !== 'Packaged food' && parsed.technicalSafetyReport) {
      technicalSafetyReport = {
        technicalSpecs: Array.isArray(parsed.technicalSafetyReport?.technicalSpecs)
          ? parsed.technicalSafetyReport.technicalSpecs.map((item: any) => ({
              label: String(item.label || ''),
              value: String(item.value || ''),
            }))
          : [],
        safetyWarnings: Array.isArray(parsed.technicalSafetyReport?.safetyWarnings)
          ? parsed.technicalSafetyReport.safetyWarnings.map(String)
          : [],
        certificationMarks: Array.isArray(parsed.technicalSafetyReport?.certificationMarks)
          ? parsed.technicalSafetyReport.certificationMarks.map(String)
          : [],
        precautions: Array.isArray(parsed.technicalSafetyReport?.precautions)
          ? parsed.technicalSafetyReport.precautions.map(String)
          : [],
      };
    }

    return {
      productName: String(parsed.productName || 'Scanned Commodity').trim(),
      category,
      mrp: parsed.mrp ? String(parsed.mrp).trim() : null,
      unitSalePrice: parsed.unitSalePrice ? String(parsed.unitSalePrice).trim() : null,
      netQuantity: parsed.netQuantity ? String(parsed.netQuantity).trim() : null,
      dateMarking: parsed.dateMarking ? String(parsed.dateMarking).trim() : null,
      consumerCare: parsed.consumerCare ? String(parsed.consumerCare).trim() : null,
      manufacturerPacker: parsed.manufacturerPacker ? String(parsed.manufacturerPacker).trim() : null,
      countryOfOrigin: parsed.countryOfOrigin ? String(parsed.countryOfOrigin).trim() : null,
      summary: String(parsed.summary || 'AI label analysis completed.').trim(),
      status,
      fullOcrText: String(parsed.fullOcrText || rawText).trim(),
      missingDeclarations: Array.isArray(parsed.missingDeclarations) ? parsed.missingDeclarations : [],
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
      healthReport,
      technicalSafetyReport,
    };
  } catch (parseErr) {
    logger.error({ parseErr, rawText }, 'Failed to parse AI JSON response');
    throw new Error('Failed to parse AI structured response: ' + String(parseErr));
  }
}
