import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Shield,
  Radio,
  LayoutDashboard,
  Boxes,
  Lock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BadgeCheck,
  ArrowUpRight,
} from 'lucide-react';
import { useAuth, PROFILES, type UserRole } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';

interface RoleCardMeta {
  role: UserRole;
  titleEn: string;
  titleHi: string;
  jurisdictionEn: string;
  jurisdictionHi: string;
  statutorySecEn: string;
  statutorySecHi: string;
  defaultBadge: string;
  icon: typeof Radio;
  tint: string;
  border: string;
  action: string;
  badgeBg: string;
  scopeListEn: string[];
  scopeListHi: string[];
  destinationPath: string;
}

const ROLES_DATA: RoleCardMeta[] = [
  {
    role: 'officer',
    titleEn: 'Field Enforcement Officer',
    titleHi: 'क्षेत्र प्रवर्तन अधिकारी',
    jurisdictionEn: 'New Delhi Central District Inspectorate',
    jurisdictionHi: 'नई दिल्ली केंद्रीय जिला निरीक्षणालय',
    statutorySecEn: 'Legal Metrology Act, 2009 — Section 15 (Powers of Inspection & Seizure)',
    statutorySecHi: 'विधिक मापविज्ञान अधिनियम, 2009 — धारा 15 (निरीक्षण एवं जब्ती की शक्तियां)',
    defaultBadge: 'LM-DL-894',
    icon: Radio,
    tint: '#E5F7FB',
    border: '#46AAC1',
    action: '#14618C',
    badgeBg: '#C2EDF6',
    scopeListEn: [
      'Live camera package capture & OCR extraction',
      'Rule 6 & Rule 7 real-time violation checks',
      'Issue statutory seizure memos & inspection notices',
    ],
    scopeListHi: [
      'लाइव कैमरा पैकेज कैप्चर एवं ओसीआर निष्कर्षण',
      'नियम 6 एवं नियम 7 वास्तविक समय उल्लंघन जांच',
      'वैधानिक जब्ती ज्ञापन एवं निरीक्षण नोटिस जारी करना',
    ],
    destinationPath: '/',
  },
  {
    role: 'supervisor',
    titleEn: 'Supervisor & Controller',
    titleHi: 'विधिक मापविज्ञान नियंत्रक',
    jurisdictionEn: 'State Directorate of Legal Metrology',
    jurisdictionHi: 'राज्य विधिक मापविज्ञान निदेशालय',
    statutorySecEn: 'Legal Metrology Act, 2009 — Section 48 (Compounding of Offences)',
    statutorySecHi: 'विधिक मापविज्ञान अधिनियम, 2009 — धारा 48 (अपराधों का शमन)',
    defaultBadge: 'LM-HQ-012',
    icon: LayoutDashboard,
    tint: '#EFE6FE',
    border: '#7C4DD1',
    action: '#4B2FA0',
    badgeBg: '#E0CEFD',
    scopeListEn: [
      'Review pending field inspection queues',
      'Authorize compounding and statutory show-cause notices',
      'Statewide district compliance & enforcement oversight',
    ],
    scopeListHi: [
      'लंबित क्षेत्रीय निरीक्षण कतारों की समीक्षा',
      'शमन एवं वैधानिक कारण बताओ नोटिस अधिकृत करना',
      'राज्यव्यापी जिला अनुपालन एवं प्रवर्तन निगरानी',
    ],
    destinationPath: '/dashboard',
  },
  {
    role: 'auditor',
    titleEn: 'Directorate Compliance Auditor',
    titleHi: 'मंत्रालय अनुपालन लेखापरीक्षक',
    jurisdictionEn: 'Ministry of Consumer Affairs (National)',
    jurisdictionHi: 'उपभोक्ता मामले मंत्रालय (राष्ट्रीय)',
    statutorySecEn: 'Legal Metrology Act, 2009 — Section 18 (Mandatory Declarations Audit)',
    statutorySecHi: 'विधिक मापविज्ञान अधिनियम, 2009 — धारा 18 (अनिवार्य घोषणा लेखापरीक्षा)',
    defaultBadge: 'MCA-AUD-07',
    icon: Boxes,
    tint: '#FBE0C4',
    border: '#C9750F',
    action: '#8A4C05',
    badgeBg: '#F6CD9F',
    scopeListEn: [
      'National commodity database verification',
      'E-commerce statutory declaration audits',
      'Legal evidentiary reporting & national audit exports',
    ],
    scopeListHi: [
      'राष्ट्रीय वस्तु डेटाबेस सत्यापन',
      'ई-कॉमर्स वैधानिक घोषणा लेखापरीक्षा',
      'विधिक साक्ष्य रिपोर्टिंग एवं राष्ट्रीय लेखापरीक्षा निर्यात',
    ],
    destinationPath: '/products',
  },
  {
    role: 'citizen',
    titleEn: 'Public Consumer / Citizen',
    titleHi: 'नागरिक / सार्वजनिक उपभोक्ता',
    jurisdictionEn: 'National Consumer Verification Desk',
    jurisdictionHi: 'राष्ट्रीय उपभोक्ता सत्यापन डेस्क',
    statutorySecEn: 'Consumer Protection Act, 2019 & Legal Metrology Act, 2009',
    statutorySecHi: 'उपभोक्ता संरक्षण अधिनियम, 2019 एवं विधिक मापविज्ञान (नागरिक अधिकार)',
    defaultBadge: 'PUBLIC-ACCESS',
    icon: Shield,
    tint: '#DFFEC5',
    border: '#4CA320',
    action: '#2E7D0E',
    badgeBg: '#C8F7A6',
    scopeListEn: [
      'Live AI camera package inspection & MRP check',
      'Instant query across national product database',
      'Health score, allergens & expiry date verification',
    ],
    scopeListHi: [
      'लाइव एआई कैमरा पैकेज निरीक्षण एवं एमआरपी जांच',
      'राष्ट्रीय उत्पाद डेटाबेस में त्वरित खोज',
      'स्वास्थ्य रेटिंग, एलर्जी चेतावनी एवं समाप्ति तिथि जांच',
    ],
    destinationPath: '/citizen',
  },
];

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login, role: currentActiveRole } = useAuth();
  const { language } = useI18n();

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentActiveRole || 'officer');
  const [badgeId, setBadgeId] = useState<string>(PROFILES[currentActiveRole || 'officer'].badgeId);
  const [pinCode, setPinCode] = useState<string>('8940');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeMeta = ROLES_DATA.find((r) => r.role === selectedRole) || ROLES_DATA[0];

  const handleSelectRole = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setBadgeId(PROFILES[newRole].badgeId);
    setErrorMessage(null);
    setPinCode(
      newRole === 'officer'
        ? '8940'
        : newRole === 'supervisor'
        ? '1049'
        : newRole === 'auditor'
        ? '3310'
        : 'PUBLIC'
    );
  };

  const executeLogin = async (roleToLogin: UserRole, badgeToUse: string) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await new Promise((res) => setTimeout(res, 200));
      await login(roleToLogin, badgeToUse);
      setLoginSuccess(true);
      const targetRoleMeta = ROLES_DATA.find((r) => r.role === roleToLogin) || ROLES_DATA[0];
      setTimeout(() => {
        setLocation(targetRoleMeta.destinationPath);
      }, 350);
    } catch {
      setErrorMessage(
        language === 'hi'
          ? 'प्रमाणीकरण विफल: कृपया अपने क्रेडेंशियल जांचें।'
          : 'Authentication failed: Please verify badge credentials and security PIN.'
      );
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeId.trim()) {
      setErrorMessage(
        language === 'hi'
          ? 'कृपया वैध सेवा बैज आईडी दर्ज करें।'
          : 'Please enter a valid official Service Badge ID.'
      );
      return;
    }
    executeLogin(selectedRole, badgeId);
  };

  return (
    <div className="portal-container py-6 sm:py-8 select-none">
      {/* Slab header */}
      <div className="portal-slab flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={22} className="text-white shrink-0" />
          <h2 className="text-white font-semibold text-[19px] sm:text-[20px] tracking-tight">
            {language === 'hi'
              ? 'अधिकारी प्रमाणीकरण एवं भूमिका चयन'
              : 'Official Authentication & Role Portals'}
          </h2>
        </div>
        <span className="hidden sm:inline-block text-xs text-white/80 font-mono tracking-wider">
          LM-AUTH-SEC-2009
        </span>
      </div>

      {/* Main Container Panel */}
      <div className="portal-panel space-y-6">
        {/* Intro strip */}
        <div className="border-b border-[var(--border)] pb-4">
          <h1 className="text-[22px] sm:text-[24px] font-semibold text-[var(--text)] tracking-tight">
            {language === 'hi'
              ? 'विधिक मापविज्ञान प्रवर्तन पोर्टल में प्रवेश'
              : 'Legal Metrology Enforcement System Access'}
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[var(--text-muted)] mt-1 max-w-3xl">
            {language === 'hi'
              ? 'विधिक मापविज्ञान अधिनियम, 2009 के अंतर्गत अधिकृत सरकारी अधिकारियों हेतु विशिष्ट भूमिका आधारित पोर्टल। अपने संबंधित विभाग का चयन करें।'
              : 'Role-segregated operational consoles for designated Legal Metrology officers under the Legal Metrology Act, 2009. Select your departmental division to continue.'}
          </p>
        </div>

        {/* Wide Banner for Citizen / Consumer Access */}
        <div className="rounded-[var(--r-md)] border-[1.5px] border-[#4CA320] bg-[#DFFEC5] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#4CA320] flex items-center justify-center text-[#2E7D0E] shrink-0 shadow-xs">
              <Shield size={20} />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2E7D0E] block">
                {language === 'hi' ? 'नागरिक एवं उपभोक्ता डेस्क' : 'Public Consumer & Citizen Verification Desk'}
              </span>
              <p className="text-xs sm:text-[13px] text-[var(--text)] font-medium">
                {language === 'hi'
                  ? 'बिना विभागीय क्रेडेंशियल के किसी भी उत्पाद का लाइव कैमरा से स्कैन करें तथा सत्यापित राष्ट्रीय डेटाबेस में खोजें।'
                  : 'Verify retail product MRP, net weight, manufacturer, expiry & FSSAI standards via AI live camera or search repository.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => executeLogin('citizen', 'PUBLIC-ACCESS')}
            className="px-3.5 py-2 rounded-[var(--r-sm)] bg-[#2E7D0E] text-white text-xs font-semibold hover:bg-[#25660b] transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
          >
            <span>{language === 'hi' ? 'नागरिक डेस्क खोलें' : 'Open Citizen Desk'}</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* 4-Role Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES_DATA.map((item) => {
            const isSelected = selectedRole === item.role;
            const Icon = item.icon;

            return (
              <div
                key={item.role}
                onClick={() => handleSelectRole(item.role)}
                style={{
                  backgroundColor: item.tint,
                  borderColor: isSelected ? item.action : item.border,
                  boxShadow: isSelected ? `0 0 0 2px ${item.action}` : 'none',
                }}
                className={`rounded-[var(--r-md)] border-[1.5px] p-5 cursor-pointer transition-all duration-150 relative flex flex-col justify-between ${
                  isSelected ? 'scale-[1.01]' : 'hover:opacity-95'
                }`}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectRole(item.role);
                  }
                }}
              >
                {/* Active Indicator Pin */}
                {isSelected && (
                  <div
                    style={{ backgroundColor: item.action }}
                    className="absolute top-3 right-3 text-white text-[11px] font-semibold px-2 py-0.5 rounded-[var(--r-sm)] flex items-center gap-1"
                  >
                    <CheckCircle2 size={12} />
                    <span>{language === 'hi' ? 'चयनित' : 'Active'}</span>
                  </div>
                )}

                <div>
                  {/* Circular Icon Well */}
                  <div
                    style={{ borderColor: item.border }}
                    className="w-14 h-14 rounded-full bg-white border-[1.5px] flex items-center justify-center mb-3.5 shadow-xs"
                  >
                    <Icon size={26} style={{ color: item.action }} />
                  </div>

                  {/* Title & Role */}
                  <h3 className="text-[17px] font-semibold text-[var(--text)] leading-snug">
                    {language === 'hi' ? item.titleHi : item.titleEn}
                  </h3>
                  <div className="text-[12px] font-medium text-[var(--text-muted)] mt-0.5">
                    {language === 'hi' ? item.jurisdictionHi : item.jurisdictionEn}
                  </div>

                  {/* Statutory Reference Badge */}
                  <div
                    style={{ backgroundColor: item.badgeBg, color: item.action }}
                    className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-[var(--r-sm)] mt-2 mb-3"
                  >
                    {language === 'hi' ? item.statutorySecHi : item.statutorySecEn}
                  </div>

                  {/* Scope bullets */}
                  <ul className="space-y-1.5 text-[13px] text-[var(--text)] border-t border-black/10 pt-3">
                    {(language === 'hi' ? item.scopeListHi : item.scopeListEn).map((scope, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-tight">
                        <span style={{ color: item.action }} className="font-bold text-[14px]">
                          •
                        </span>
                        <span>{scope}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card footer / Action button */}
                <div className="mt-5 pt-3 border-t border-black/10 flex items-center justify-between">
                  <div className="text-[11px] text-[var(--text-muted)] font-mono">
                    ID: <span className="font-semibold text-[var(--text)]">{item.defaultBadge}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectRole(item.role);
                    }}
                    style={{
                      backgroundColor: isSelected ? item.action : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : item.action,
                      borderColor: item.action,
                    }}
                    className="text-[13px] font-semibold px-3 py-1.5 rounded-[var(--r-sm)] border transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{isSelected ? (language === 'hi' ? 'भूमिका सक्रिय' : 'Selected') : (language === 'hi' ? 'यह चुनें' : 'Select role')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Form Box for Selected Role */}
        <div
          style={{
            backgroundColor: activeMeta.tint,
            borderColor: activeMeta.border,
          }}
          className="rounded-[var(--r-md)] border-[1.5px] p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 gap-2">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: activeMeta.action }}>
                {language === 'hi' ? 'सुरक्षित क्रेडेंशियल प्रमाणीकरण' : 'Secured Credential Authentication'}
              </div>
              <h2 className="text-[18px] sm:text-[19px] font-semibold text-[var(--text)]">
                {language === 'hi' ? activeMeta.titleHi : activeMeta.titleEn} — {language === 'hi' ? 'लॉगिन' : 'Console Sign In'}
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono bg-white px-2.5 py-1 rounded-[var(--r-sm)] border border-black/10 text-[var(--text)] font-semibold">
                {activeMeta.defaultBadge}
              </span>
              <span className="text-[var(--text-muted)] font-medium">
                {language === 'hi' ? 'सक्रिय सत्र' : 'Designated Profile'}
              </span>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="mt-5 space-y-4 max-w-2xl">
            {errorMessage && (
              <div className="p-3 bg-[#FADFE4] border border-[#A03441] text-[#A03441] rounded-[var(--r-sm)] text-xs flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 bg-[#DFFEC5] border border-[#4CA320] text-[#2E7D0E] rounded-[var(--r-sm)] text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>
                  {language === 'hi'
                    ? 'प्रमाणीकरण सफल। संबंधित कंसोल पर पुनर्निर्देशित किया जा रहा है...'
                    : 'Credentials authenticated. Redirecting to official workstation...'}
                </span>
              </div>
            )}

            {selectedRole === 'citizen' ? (
              <div className="bg-white/90 border border-black/10 rounded-[var(--r-sm)] p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-[#2E7D0E]">
                  <CheckCircle2 size={16} />
                  <span>
                    {language === 'hi'
                      ? 'सार्वजनिक उपभोक्ता सत्यापन — किसी पासवर्ड की आवश्यकता नहीं'
                      : 'Open Public Access — No Officer Credentials Required'}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {language === 'hi'
                    ? 'नागरिक अपने मोबाइल अथवा कंप्यूटर कैमरे से किसी भी खुदरा उत्पाद का लेबल स्कैन कर सकते हैं, एमआरपी व शुद्ध मात्रा की जांच कर सकते हैं और राष्ट्रीय डेटाबेस में खोज कर सकते हैं।'
                    : 'Consumers can directly verify packaged retail commodities, check declared MRP, expiry dates, manufacturer credentials, and search the verified national product database.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Badge ID Input */}
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text)] mb-1">
                    {language === 'hi' ? 'सेवा बैज / पहचान संख्या' : 'Official Service Badge ID'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={badgeId}
                      onChange={(e) => setBadgeId(e.target.value)}
                      required
                      className="w-full bg-white border border-[var(--border)] rounded-[var(--r-sm)] px-3 py-2 text-sm font-mono text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
                      placeholder="e.g. LM-DL-894"
                    />
                    <BadgeCheck size={16} className="absolute right-3 top-2.5 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                    {language === 'hi' ? 'विभागीय पहचान पत्र के अनुसार' : 'As issued by Controller of Legal Metrology'}
                  </span>
                </div>

                {/* Security PIN */}
                <div>
                  <label className="block text-[13px] font-medium text-[var(--text)] mb-1">
                    {language === 'hi' ? 'सुरक्षा पिन / पासवर्ड' : 'Officer Security PIN'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      required
                      className="w-full bg-white border border-[var(--border)] rounded-[var(--r-sm)] px-3 py-2 text-sm font-mono text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
                      placeholder="••••"
                    />
                    <Lock size={16} className="absolute right-3 top-2.5 text-[var(--text-muted)]" />
                  </div>
                  <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
                    {language === 'hi' ? '4-अंकीय सुरक्षित सुरक्षा कोड' : 'Standard 4-digit departmental PIN'}
                  </span>
                </div>
              </div>
            )}

            {/* Jurisdiction read-only note */}
            <div className="bg-white/80 border border-black/10 rounded-[var(--r-sm)] p-3 text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-[var(--text)]">
                  {language === 'hi' ? 'संबद्ध कार्यक्षेत्र' : 'Assigned Jurisdiction'}:
                </span>{' '}
                <span className="text-[var(--text-muted)]">
                  {language === 'hi' ? activeMeta.jurisdictionHi : activeMeta.jurisdictionEn}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[var(--text-muted)]">
                {activeMeta.role.toUpperCase()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting || loginSuccess}
                style={{ backgroundColor: activeMeta.action }}
                className="px-5 py-2.5 text-white font-semibold text-sm rounded-[var(--r-sm)] hover:opacity-90 active:scale-[0.985] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
              >
                <UserCheck size={16} />
                <span>
                  {isSubmitting
                    ? language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Authenticating...'
                    : selectedRole === 'citizen'
                    ? language === 'hi' ? 'नागरिक सत्यापन डेस्क में प्रवेश करें' : 'Enter Citizen Verification Desk'
                    : language === 'hi' ? 'आधिकारिक लॉगिन करें' : 'Authorized Sign In'}
                </span>
              </button>

              {selectedRole !== 'citizen' && (
                <button
                  type="button"
                  onClick={() => executeLogin(selectedRole, activeMeta.defaultBadge)}
                  disabled={isSubmitting || loginSuccess}
                  className="px-4 py-2.5 bg-white border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg-sunken)] font-medium text-sm rounded-[var(--r-sm)] transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
                  title="Instant access with official pre-configured credentials"
                >
                  <FileText size={15} className="text-[var(--indigo-600)]" />
                  <span>{language === 'hi' ? '1-क्लिक त्वरित डेमो लॉगिन' : '1-Click Quick Demo Access'}</span>
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Statutory Warning & Legal Disclaimer Banner */}
        <div className="rounded-[var(--r-md)] border-[1.5px] border-[#A03441] bg-[#FADFE4] p-4 text-[13px] text-[#A03441] flex items-start gap-3">
          <AlertTriangle size={18} className="shrink-0 mt-0.5 text-[#C62430]" />
          <div className="leading-relaxed">
            <span className="font-bold">
              {language === 'hi' ? 'वैधानिक चेतावनी:' : 'Statutory Notice:'}{' '}
            </span>
            {language === 'hi'
              ? 'यह पोर्टल भारत सरकार के विधिक मापविज्ञान अधिनियम, 2009 (2010 का अधिनियम संख्या 1) के अंतर्गत नामित प्रवर्तन अधिकारियों के आधिकारिक उपयोग हेतु सीमित है। अनधिकृत प्रवेश या डेटा हेरफेर सूचना प्रौद्योगिकी अधिनियम की धारा 43 तथा भारतीय न्याय संहिता के अंतर्गत दंडनीय अपराध है।'
              : 'This portal is strictly restricted for authorized Legal Metrology personnel designated under the Legal Metrology Act, 2009 (Act No. 1 of 2010). Unauthorized access, interception, or tampering with regulatory records is a cognizable offence punishable under Section 43 of the Information Technology Act and applicable penal provisions.'}
          </div>
        </div>
      </div>
    </div>
  );
}
