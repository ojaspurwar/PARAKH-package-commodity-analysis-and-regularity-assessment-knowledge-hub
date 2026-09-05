import React, { useState, useMemo } from 'react';
import {
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Building,
  Calendar,
  DollarSign,
  Package,
  Phone,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ArrowUpRight,
  Eye,
  Info,
} from 'lucide-react';
import { useGetScans, type Scan } from '@workspace/api-client-react';
import { useI18n } from '@/lib/i18n';
import { LiveCameraCapture } from '@/components/live-camera-capture';
import { prepareEnhancedPhoto } from '@/lib/image-enhancer';

interface AiAnalysisResult {
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
  fullOcrText: string;
  missingDeclarations: string[];
  confidence: number;
  healthReport?: {
    ingredients: string[];
    benefits: string[];
    harmsAndRisks: string[];
    healthScore: string;
    safetyRating: string;
    dietaryAdvisories: string[];
    allergens: string[];
  } | null;
  technicalSafetyReport?: {
    technicalSpecs: Array<{ label: string; value: string }>;
    safetyWarnings: string[];
    certificationMarks: string[];
    precautions: string[];
  } | null;
}

export default function CitizenPage() {
  const { language } = useI18n();
  const scansQuery = useGetScans();

  const [activeTab, setActiveTab] = useState<'capture' | 'database'>('capture');
  const [liveCameraOpen, setLiveCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<{ dataUrl: string; width: number; height: number } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AiAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Database search state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedScanId, setExpandedScanId] = useState<number | null>(null);

  // Filtered scans from database
  const filteredScans = useMemo(() => {
    if (!scansQuery.data) return [];
    return scansQuery.data.filter((scan: Scan) => {
      const matchesSearch =
        !searchQuery ||
        scan.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (scan.category && scan.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (scan.ocrText && scan.ocrText.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        categoryFilter === 'all' ||
        (scan.category && scan.category.toLowerCase() === categoryFilter.toLowerCase());

      return matchesSearch && matchesCategory;
    });
  }, [scansQuery.data, searchQuery, categoryFilter]);

  // Execute AI Vision package analysis
  const analyzeImageWithAi = async (dataUrl: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        setErrorMsg(
          data.error ||
            (language === 'hi'
              ? 'एआई विश्लेषण विफल रहा। कृपया लेबल की स्पष्ट तस्वीर पुनः लें।'
              : 'AI analysis could not recognize the label. Please recapture with clearer lighting.')
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err.message ||
          (language === 'hi'
            ? 'सर्वर से कनेक्ट करने में विफल।'
            : 'Could not connect to the AI inspection service.')
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCameraCapture = (image: { dataUrl: string; width: number; height: number }) => {
    setLiveCameraOpen(false);
    setPhoto(image);
    analyzeImageWithAi(image.dataUrl);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const prepared = await prepareEnhancedPhoto(file);
      setPhoto(prepared);
      analyzeImageWithAi(prepared.dataUrl);
    } catch {
      setErrorMsg(
        language === 'hi'
          ? 'फोटो प्रोसेस करने में असमर्थ। कृपया पुनः प्रयास करें।'
          : 'Unable to process image file. Please try again.'
      );
    }
  };

  return (
    <div className="portal-container py-6 sm:py-8 space-y-6 select-none">
      {/* Slab Header */}
      <div className="portal-slab flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-white shrink-0" />
          <h2 className="text-white font-semibold text-[19px] sm:text-[20px] tracking-tight">
            {language === 'hi'
              ? 'नागरिक वस्तु सत्यापन डेस्क — एआई लाइव निरीक्षण एवं डेटाबेस खोज'
              : 'Citizen Commodity Verification Desk — AI Live Inspection & Database Search'}
          </h2>
        </div>
        <span className="hidden sm:inline-block text-xs text-white/80 font-mono tracking-wider">
          PUBLIC-VERIFY-PORTAL
        </span>
      </div>

      {/* Main Panel */}
      <div className="portal-panel space-y-6">
        {/* Intro banner */}
        <div className="border-b border-[var(--border)] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-semibold text-[var(--text)] tracking-tight">
              {language === 'hi'
                ? 'उपभोक्ता पैकेज्ड वस्तु सत्यापन'
                : 'Consumer Packaged Commodity Verification'}
            </h1>
            <p className="text-[14px] sm:text-[15px] text-[var(--text-muted)] mt-1 max-w-3xl">
              {language === 'hi'
                ? 'विधिक मापविज्ञान अधिनियम, 2009 एवं उपभोक्ता संरक्षण अधिनियम के तहत अपने अधिकारों की रक्षा करें। किसी भी खुदरा उत्पाद का फोटो खींचकर एमआरपी, शुद्ध मात्रा, निर्माण तिथि, एवं प्रामाणिकता की जांच करें।'
                : 'Empowering consumers under the Legal Metrology Act, 2009. Capture any packaged retail commodity with your camera to extract declared MRP, net weight, manufacturer credentials, expiry, and safety details via AI.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-[var(--r-sm)] bg-[var(--bg-sunken)] p-1 border border-[var(--border)] shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('capture')}
              className={`px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'capture'
                  ? 'bg-[#052963] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Camera size={14} />
              <span>{language === 'hi' ? 'लाइव कैमरा कैप्चर' : 'Live Camera Scan'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`px-3 py-1.5 rounded-[var(--r-sm)] text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'database'
                  ? 'bg-[#052963] text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              <Search size={14} />
              <span>{language === 'hi' ? 'डेटाबेस खोज' : 'Database Search'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: LIVE CAMERA CAPTURE & AI PRODUCT ANALYSIS          */}
        {/* ========================================================= */}
        {activeTab === 'capture' && (
          <div className="space-y-6">
            {/* Capture Action Strip */}
            <div className="rounded-[var(--r-md)] border-[1.5px] border-[#46AAC1] bg-[#E5F7FB] p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-white border-[1.5px] border-[#46AAC1] flex items-center justify-center text-[#14618C] shadow-xs shrink-0">
                    <Camera size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--text)]">
                      {language === 'hi'
                        ? 'पैकेज लेबल का लाइव फोटो लें अथवा अपलोड करें'
                        : 'Capture or Upload Retail Package Label'}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {language === 'hi'
                        ? 'उत्पाद का मुख्य प्रदर्शन पैनल (PDP) सामने रखें ताकि एमआरपी, निर्माता और वजन स्पष्ट दिखे।'
                        : 'Position the Principal Display Panel (PDP) to capture MRP, net quantity, and manufacturer markings.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setLiveCameraOpen(true)}
                    className="px-4 py-2 rounded-[var(--r-sm)] bg-[#14618C] text-white text-xs font-semibold hover:bg-[#104d70] transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Camera size={15} />
                    <span>{language === 'hi' ? 'लाइव कैमरा खोलें' : 'Open Live Camera'}</span>
                  </button>

                  <label className="px-3.5 py-2 rounded-[var(--r-sm)] bg-white border border-[#46AAC1] text-[#14618C] hover:bg-[#E5F7FB] text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs">
                    <FileText size={15} />
                    <span>{language === 'hi' ? 'गैलरी से चुनें' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Live Camera Modal Overlay */}
            {liveCameraOpen && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white rounded-[var(--r-lg)] overflow-hidden shadow-2xl">
                  <LiveCameraCapture
                    onCapture={handleCameraCapture}
                    onCancel={() => setLiveCameraOpen(false)}
                  />
                </div>
              </div>
            )}

            {/* Analysis Loading State */}
            {isAnalyzing && (
              <div className="rounded-[var(--r-md)] border-[1.5px] border-[#7C4DD1] bg-[#EFE6FE] p-6 text-center space-y-3">
                <RefreshCw size={28} className="animate-spin mx-auto text-[#4B2FA0]" />
                <h3 className="text-base font-semibold text-[var(--text)]">
                  {language === 'hi'
                    ? 'एआई विज़न (Google Gemini 2.5) लेबल का विश्लेषण कर रहा है...'
                    : 'AI Vision (Google Gemini 2.5) Inspecting Package Declarations...'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  {language === 'hi'
                    ? 'एमआरपी, शुद्ध मात्रा, निर्माता विवरण, निर्माण तिथि तथा विधिक मापविज्ञान नियमों की जांच की जा रही है।'
                    : 'Extracting declared MRP, unit sale price, date marking, net quantity, and verifying statutory compliance.'}
                </p>
              </div>
            )}

            {/* Error Notice */}
            {errorMsg && (
              <div className="rounded-[var(--r-md)] border-[1.5px] border-[#A03441] bg-[#FADFE4] p-4 text-[#A03441] text-xs flex items-center gap-3">
                <AlertTriangle size={18} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Analysis Result Display */}
            {analysis && (
              <div className="space-y-6">
                {/* Product Summary Banner */}
                <div
                  style={{
                    backgroundColor: analysis.status === 'violation' ? '#FADFE4' : '#DFFEC5',
                    borderColor: analysis.status === 'violation' ? '#A03441' : '#4CA320',
                  }}
                  className="rounded-[var(--r-md)] border-[1.5px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderColor: analysis.status === 'violation' ? '#A03441' : '#4CA320',
                        color: analysis.status === 'violation' ? '#C62430' : '#2E7D0E',
                      }}
                      className="w-12 h-12 rounded-full border-[1.5px] flex items-center justify-center shadow-xs shrink-0"
                    >
                      {analysis.status === 'violation' ? (
                        <ShieldAlert size={24} />
                      ) : (
                        <CheckCircle2 size={24} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            backgroundColor: analysis.status === 'violation' ? '#C62430' : '#2E7D0E',
                          }}
                          className="text-white text-[11px] font-semibold px-2 py-0.5 rounded-[var(--r-sm)] uppercase"
                        >
                          {analysis.status === 'violation'
                            ? language === 'hi' ? 'उल्लंघन पाया गया' : 'Statutory Non-Compliance'
                            : language === 'hi' ? 'अनुपालक उत्पाद' : 'Verified Compliant'}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          {analysis.category}
                        </span>
                      </div>
                      <h2 className="text-[18px] sm:text-[20px] font-bold text-[var(--text)] mt-1">
                        {analysis.productName}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        {analysis.summary}
                      </p>
                    </div>
                  </div>

                  {photo && (
                    <div className="shrink-0 w-24 h-24 rounded-[var(--r-sm)] overflow-hidden border border-black/10 shadow-xs bg-white">
                      <img
                        src={photo.dataUrl}
                        alt="Captured package"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* 6 Key Statutory Information Tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* MRP & Unit Price */}
                  <div className="bg-white border border-[var(--border)] rounded-[var(--r-md)] p-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
                      <DollarSign size={15} className="text-[#14618C]" />
                      <span className="font-semibold">{language === 'hi' ? 'मूल्य निर्धारण (MRP)' : 'Retail Price & Unit Sale Price'}</span>
                    </div>
                    <div className="text-[17px] font-bold font-mono text-[var(--text)]">
                      {analysis.mrp || (language === 'hi' ? 'अघोषित' : 'Not declared')}
                    </div>
                    {analysis.unitSalePrice && (
                      <div className="text-[12px] text-[var(--text-muted)] font-mono mt-0.5">
                        USP: <span className="font-semibold text-[var(--text)]">{analysis.unitSalePrice}</span>
                      </div>
                    )}
                    <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                      Rule 6(1)(e) — Maximum Retail Price incl. of all taxes
                    </span>
                  </div>

                  {/* Net Quantity */}
                  <div className="bg-white border border-[var(--border)] rounded-[var(--r-md)] p-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
                      <Package size={15} className="text-[#4B2FA0]" />
                      <span className="font-semibold">{language === 'hi' ? 'घोषित शुद्ध मात्रा' : 'Declared Net Quantity'}</span>
                    </div>
                    <div className="text-[17px] font-bold font-mono text-[var(--text)]">
                      {analysis.netQuantity || (language === 'hi' ? 'अघोषित' : 'Not declared')}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                      Rule 6(1)(c) — Standard unit of weight/measure
                    </span>
                  </div>

                  {/* Date of Mfg / Expiry */}
                  <div className="bg-white border border-[var(--border)] rounded-[var(--r-md)] p-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
                      <Calendar size={15} className="text-[#8A4C05]" />
                      <span className="font-semibold">{language === 'hi' ? 'निर्माण / समाप्ति तिथि' : 'Manufacturing & Expiry Date'}</span>
                    </div>
                    <div className="text-[15px] font-semibold font-mono text-[var(--text)]">
                      {analysis.dateMarking || (language === 'hi' ? 'अघोषित' : 'Not declared')}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                      Rule 6(1)(d) — Month and year of manufacture/packing
                    </span>
                  </div>

                  {/* Manufacturer & Packer */}
                  <div className="bg-white border border-[var(--border)] rounded-[var(--r-md)] p-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
                      <Building size={15} className="text-[#14618C]" />
                      <span className="font-semibold">{language === 'hi' ? 'निर्माता / पैकर विवरण' : 'Manufacturer / Packer'}</span>
                    </div>
                    <div className="text-[13px] font-medium text-[var(--text)] line-clamp-2">
                      {analysis.manufacturerPacker || (language === 'hi' ? 'विवरण अनुपलब्ध' : 'Not declared on package')}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                      Rule 6(1)(a) — Name and complete address
                    </span>
                  </div>

                  {/* Consumer Care */}
                  <div className="bg-white border border-[var(--border)] rounded-[var(--r-md)] p-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
                      <Phone size={15} className="text-[#2E7D0E]" />
                      <span className="font-semibold">{language === 'hi' ? 'उपभोक्ता हेल्पलाइन' : 'Consumer Care Helpline'}</span>
                    </div>
                    <div className="text-[13px] font-medium font-mono text-[var(--text)] line-clamp-2">
                      {analysis.consumerCare || (language === 'hi' ? 'हेल्पलाइन अघोषित' : 'Not declared on package')}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                      Rule 6(1)(b) — Phone, email, or postal address
                    </span>
                  </div>

                  {/* Country of Origin */}
                  <div className="bg-white border border-[var(--border)] rounded-[var(--r-md)] p-4 shadow-2xs">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-1">
                      <ShieldCheck size={15} className="text-[#80376C]" />
                      <span className="font-semibold">{language === 'hi' ? 'मूल देश' : 'Country of Origin'}</span>
                    </div>
                    <div className="text-[15px] font-bold text-[var(--text)]">
                      {analysis.countryOfOrigin || 'India (घोषित)'}
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] block mt-1">
                      Rule 6(1)(n) — Country of manufacture / origin
                    </span>
                  </div>
                </div>

                {/* Consumer Health, Allergens & Safety Advisories */}
                {analysis.healthReport && (
                  <div className="rounded-[var(--r-md)] border-[1.5px] border-[#C9750F] bg-[#FBE0C4] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[var(--text)] flex items-center gap-2">
                        <Info size={16} className="text-[#8A4C05]" />
                        <span>{language === 'hi' ? 'उपभोक्ता स्वास्थ्य एवं सुरक्षा जानकारी' : 'Consumer Health & Safety Assessment'}</span>
                      </h3>
                      {analysis.healthReport.healthScore && (
                        <span className="text-xs font-bold bg-white text-[#8A4C05] px-2.5 py-0.5 rounded-[var(--r-sm)] border border-[#C9750F]">
                          Health Rating: {analysis.healthReport.healthScore}
                        </span>
                      )}
                    </div>

                    {analysis.healthReport.allergens && analysis.healthReport.allergens.length > 0 && (
                      <div className="bg-white/90 p-3 rounded-[var(--r-sm)] border border-black/10 text-xs">
                        <span className="font-semibold text-[#C62430]">
                          {language === 'hi' ? 'एलर्जी चेतावनी:' : 'Allergen Alert:'}{' '}
                        </span>
                        <span className="text-[var(--text)]">
                          {analysis.healthReport.allergens.join(', ')}
                        </span>
                      </div>
                    )}

                    {analysis.healthReport.ingredients && analysis.healthReport.ingredients.length > 0 && (
                      <div className="text-xs text-[var(--text)]">
                        <span className="font-semibold text-[#8A4C05]">
                          {language === 'hi' ? 'प्रमुख सामग्री:' : 'Declared Ingredients:'}{' '}
                        </span>
                        <span>{analysis.healthReport.ingredients.slice(0, 8).join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Missing Declarations Notice (if any) */}
                {analysis.missingDeclarations && analysis.missingDeclarations.length > 0 && (
                  <div className="rounded-[var(--r-md)] border-[1.5px] border-[#A03441] bg-[#FADFE4] p-4 text-xs text-[#A03441] space-y-2">
                    <div className="font-bold flex items-center gap-2">
                      <AlertTriangle size={15} />
                      <span>
                        {language === 'hi'
                          ? `चेतावनी: इस पैकेज पर निम्नलिखित ${analysis.missingDeclarations.length} अनिवार्य घोषणाएं अनुपलब्ध हैं:`
                          : `Warning: This product package fails ${analysis.missingDeclarations.length} statutory mandatory declarations:`}
                      </span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                      {analysis.missingDeclarations.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: NATIONAL PRODUCT DATABASE SEARCH                   */}
        {/* ========================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-4">
            {/* Search Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'उत्पाद का नाम, ब्रांड, अथवा श्रेणी खोजें...'
                      : 'Search verified products by name, brand, or category...'
                  }
                  className="w-full pl-10 pr-4 py-2 bg-white border border-[var(--border)] rounded-[var(--r-sm)] text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {['all', 'Packaged food', 'Personal care', 'Household goods', 'Electrical goods'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-[var(--r-sm)] font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-[#052963] text-white'
                        : 'bg-white border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-sunken)]'
                    }`}
                  >
                    {cat === 'all' ? (language === 'hi' ? 'सभी' : 'All') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="text-xs text-[var(--text-muted)] font-medium">
              {language === 'hi'
                ? `सत्यापित डेटाबेस में ${filteredScans.length} उत्पाद उपलब्ध हैं`
                : `Showing ${filteredScans.length} verified products from national repository`}
            </div>

            {/* Database Table / Cards */}
            {filteredScans.length === 0 ? (
              <div className="p-8 text-center bg-[var(--bg-sunken)] rounded-[var(--r-md)] border border-[var(--border)] space-y-2">
                <Search size={28} className="mx-auto text-[var(--text-muted)]" />
                <h4 className="text-sm font-semibold text-[var(--text)]">
                  {language === 'hi' ? 'कोई उत्पाद नहीं मिला' : 'No matching products found'}
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  {language === 'hi'
                    ? 'कृपया अन्य खोज शब्द का उपयोग करें अथवा लाइव कैमरा द्वारा नया उत्पाद स्कैन करें।'
                    : 'Try modifying your search keywords or capture a new package using the Live Camera.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredScans.map((scan: Scan) => {
                  const isExpanded = expandedScanId === scan.id;
                  return (
                    <div
                      key={scan.id}
                      className="bg-white border border-[var(--border)] rounded-[var(--r-md)] p-4 hover:border-[var(--indigo-600)]/40 transition-colors shadow-2xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {scan.imageUrl ? (
                            <img
                              src={scan.imageUrl}
                              alt={scan.productName}
                              className="w-12 h-12 rounded-[var(--r-sm)] object-cover border border-black/10 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-[var(--r-sm)] bg-[var(--bg-sunken)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm text-[var(--text)]">
                                {scan.productName}
                              </h3>
                              <span
                                style={{
                                  backgroundColor: scan.status === 'compliant' ? '#DFFEC5' : '#FADFE4',
                                  color: scan.status === 'compliant' ? '#2E7D0E' : '#C62430',
                                  borderColor: scan.status === 'compliant' ? '#4CA320' : '#A03441',
                                }}
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-[var(--r-sm)] border"
                              >
                                {scan.status === 'compliant'
                                  ? language === 'hi' ? 'अनुपालक' : 'Compliant'
                                  : language === 'hi' ? 'उल्लंघन' : 'Violation'}
                              </span>
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5 flex flex-wrap items-center gap-3">
                              <span>{scan.category}</span>
                              <span>•</span>
                              <span>{new Date(scan.capturedAt).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="font-mono">{scan.location}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedScanId(isExpanded ? null : scan.id)}
                          className="px-3 py-1.5 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] hover:bg-white text-xs font-medium text-[var(--text)] transition-colors flex items-center gap-1.5 self-start sm:self-center"
                        >
                          <Eye size={13} />
                          <span>{isExpanded ? (language === 'hi' ? 'संक्षिप्त करें' : 'Hide details') : (language === 'hi' ? 'विवरण देखें' : 'View declarations')}</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>

                      {/* Expanded Statutory Details Drawer */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[var(--border)] space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[var(--bg-sunken)] p-3 rounded-[var(--r-sm)]">
                            <div>
                              <span className="text-[var(--text-muted)] block font-medium">
                                {language === 'hi' ? 'निरीक्षण अधिकारी' : 'Inspecting Officer'}
                              </span>
                              <span className="font-semibold text-[var(--text)]">
                                {scan.officerName}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--text-muted)] block font-medium">
                                {language === 'hi' ? 'सत्यापन स्थिति' : 'Submission Status'}
                              </span>
                              <span className="font-semibold text-[var(--text)]">
                                {scan.submitted ? 'Submitted to Registry' : 'Pending Review'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[var(--text-muted)] block font-medium">
                                {language === 'hi' ? 'विधिक रिकॉर्ड कोड' : 'Record Reference'}
                              </span>
                              <span className="font-mono font-semibold text-[var(--text)]">
                                LM-REC-{scan.id}
                              </span>
                            </div>
                          </div>

                          {scan.ocrText && (
                            <div>
                              <span className="font-semibold text-[var(--text-muted)] block mb-1">
                                {language === 'hi' ? 'निकाला गया लेबल टेक्स्ट (OCR Summary):' : 'Declared Label Text (OCR Summary):'}
                              </span>
                              <pre className="p-2.5 bg-white border border-[var(--border)] rounded font-mono text-[11px] text-[var(--text)] whitespace-pre-wrap max-h-32 overflow-y-auto">
                                {scan.ocrText}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
