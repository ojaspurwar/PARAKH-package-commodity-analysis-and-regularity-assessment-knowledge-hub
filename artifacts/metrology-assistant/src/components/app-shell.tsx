import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  ExternalLink,
  FileSpreadsheet,
  LayoutDashboard,
  Menu,
  Radio,
  Sun,
  User,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { appConfig } from '@/config';
import { useAuth, PROFILES, type UserRole } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';

type AppShellProps = { children: React.ReactNode };

/**
 * State Emblem of India (Ashoka Lion Capital SVG)
 */
function NationalEmblemSvg({ className = 'masthead__emblem' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" fill="currentColor" className={className} aria-label="National Emblem of India" role="img">
      {/* Central Lion Head & Mane */}
      <path d="M50 8 C44 8 40 12 39 16 C38 21 40 25 43 28 C41 31 40 35 41 40 C42 45 45 49 48 51 C45 54 44 58 45 62 C46 66 49 69 50 70 C51 69 54 66 55 62 C56 58 55 54 52 51 C55 49 58 45 59 40 C60 35 59 31 57 28 C60 25 62 21 61 16 C60 12 56 8 50 8 Z" fill="#D4AF37" opacity="0.95" />
      {/* Left Lion Profile */}
      <path d="M38 18 C33 16 27 19 25 24 C23 29 25 34 29 37 C27 40 26 45 28 50 C30 55 35 58 39 59 C37 63 38 67 41 70 C39 67 36 63 35 59 C31 58 28 54 26 49 C24 44 25 39 27 35 C23 33 21 28 23 23 C25 17 31 14 37 16 Z" fill="#D4AF37" opacity="0.9" />
      {/* Right Lion Profile */}
      <path d="M62 18 C67 16 73 19 75 24 C77 29 75 34 71 37 C73 40 74 45 72 50 C70 55 65 58 61 59 C63 63 62 67 59 70 C61 67 64 63 65 59 C69 58 72 54 74 49 C76 44 75 39 73 35 C77 33 79 28 77 23 C75 17 69 14 63 16 Z" fill="#D4AF37" opacity="0.9" />
      {/* Crown Crests */}
      <circle cx="50" cy="6" r="3" fill="#F3E5AB" />
      <circle cx="30" cy="14" r="2.5" fill="#F3E5AB" />
      <circle cx="70" cy="14" r="2.5" fill="#F3E5AB" />
      {/* Abacus / Base Platform */}
      <rect x="20" y="74" width="60" height="8" rx="2" fill="#062135" />
      {/* Ashoka Chakra in Center of Abacus */}
      <circle cx="50" cy="78" r="3.5" fill="#ffffff" />
      <circle cx="50" cy="78" r="2.5" fill="#000080" />
      <circle cx="50" cy="78" r="0.8" fill="#ffffff" />
      {/* Bull and Horse Accents */}
      <circle cx="32" cy="78" r="2" fill="#DFFEC5" />
      <circle cx="68" cy="78" r="2" fill="#FF9933" />
      {/* Lower Pedestal Steps */}
      <rect x="16" y="84" width="68" height="5" rx="1" fill="#D4AF37" opacity="0.9" />
      <rect x="12" y="91" width="76" height="5" rx="1.5" fill="#0A314D" />
      {/* Satyameva Jayate Inscription Base */}
      <text x="50" y="103" textAnchor="middle" fontSize="6.5" fontWeight="bold" fontFamily="Noto Sans Devanagari, sans-serif" fill="#C9DAEC" letterSpacing="0.05em">
        सत्यमेव जयते
      </text>
    </svg>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [highContrast, setHighContrast] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);

  const { user, role, switchRole } = useAuth();
  const { language, setLanguage, t } = useI18n();

  // Close role menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Apply font size class to html element
  const handleTextSizeChange = (size: 'sm' | 'base' | 'lg') => {
    setTextSize(size);
    document.documentElement.classList.remove('text-size-sm', 'text-size-base', 'text-size-lg');
    document.documentElement.classList.add(`text-size-${size}`);
  };

  // Toggle high contrast mode
  const handleToggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  // 6 Primary Navigation Items (Sentence case, no uppercase)
  const navItems = [
    { href: '/', label: language === 'hi' ? 'फील्ड स्कैनर' : 'Field scanner', icon: Radio },
    { href: '/dashboard', label: language === 'hi' ? 'पर्यवेक्षक डैशबोर्ड' : 'Supervisor view', icon: LayoutDashboard },
    { href: '/products', label: language === 'hi' ? 'उत्पाद रिपोजिटरी' : 'Products repository', icon: Boxes },
    { href: '/ecommerce', label: language === 'hi' ? 'ऑनलाइन उत्पाद' : 'Online products', icon: ExternalLink },
    { href: '/docs', label: language === 'hi' ? 'वैधानिक दस्तावेज' : 'Statutory documents', icon: BookOpen },
    { href: '/styleguide', label: language === 'hi' ? 'रिपोर्ट्स' : 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text)] font-sans antialiased">
      {/* ============================================================ */}
      {/* ROW 0: GREY IDENTIFICATION BANNER (.gov-banner, 32px, #F5F5F5)*/}
      {/* ============================================================ */}
      <div className="gov-banner band border-b border-[var(--border)] select-none">
        <div className="portal-container flex items-center justify-between py-1 text-xs">
          <div className="flex items-center gap-2.5">
            {/* Tiranga Flag Icon */}
            <svg className="gov-banner__flag rounded-[2px] shadow-xs" viewBox="0 0 24 16" width="18" height="12" aria-hidden="true">
              <rect width="24" height="5.33" fill="#FF9933" />
              <rect y="5.33" width="24" height="5.33" fill="#FFFFFF" />
              <rect y="10.66" width="24" height="5.34" fill="#138808" />
              <circle cx="12" cy="8" r="2.2" fill="#000080" />
            </svg>
            <span className="font-medium text-[#2C3038]">
              {language === 'hi'
                ? 'भारत सरकार का आधिकारिक विधिक मापविज्ञान पोर्टल'
                : 'An official portal of the Government of India'}
            </span>
          </div>
          <span className="hidden sm:inline text-[11px] text-[var(--text-muted)] font-medium">
            {language === 'hi'
              ? 'उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय'
              : 'Ministry of Consumer Affairs, Food & Public Distribution'}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 1: NAVY UTILITY STRIP (.utility-strip, 44px, --navy-950) */}
      {/* ============================================================ */}
      <header className="utility-strip band flex items-center z-50 select-none">
        <div className="portal-container flex items-center justify-between py-2">
          {/* Left: Accessible Skip Link & Statutory Department Tag */}
          <div className="flex items-center gap-3">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:static focus:px-3 focus:py-1 focus:bg-white focus:text-[var(--navy-950)] focus:font-semibold focus:rounded-[var(--r-sm)] focus:shadow-md"
            >
              {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
            </a>
            <span className="hidden md:inline-flex items-center text-xs font-medium text-[#C9DAEC]">
              {language === 'hi'
                ? 'विधिक मापविज्ञान प्रभाग | विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011'
                : 'Legal Metrology Division | Legal Metrology (Packaged Commodities) Rules, 2011'}
            </span>
          </div>

          {/* Right: Accessibility Controls & Language Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-xs">
            {/* Text size controls */}
            <div className="hidden sm:flex items-center bg-black/25 rounded-[var(--r-sm)] px-1 py-0.5" title="Font size control">
              <button
                type="button"
                onClick={() => handleTextSizeChange('sm')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                  textSize === 'sm' ? 'bg-white text-[var(--navy-950)] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
                aria-label="Decrease text size"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => handleTextSizeChange('base')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                  textSize === 'base' ? 'bg-white text-[var(--navy-950)] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
                aria-label="Reset text size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleTextSizeChange('lg')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                  textSize === 'lg' ? 'bg-white text-[var(--navy-950)] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>

            <span className="hidden sm:inline opacity-30">|</span>

            {/* High contrast toggle */}
            <button
              type="button"
              onClick={handleToggleContrast}
              className={`px-2 py-0.5 rounded-[var(--r-sm)] font-medium transition-colors inline-flex items-center gap-1 ${
                highContrast ? 'bg-white text-[var(--navy-950)] font-bold' : 'text-[#C9DAEC] hover:text-white'
              }`}
              title="Toggle High Contrast"
            >
              <Sun size={12} />
              <span className="hidden xs:inline">{highContrast ? 'Normal' : 'Contrast'}</span>
            </button>

            <span className="opacity-30">|</span>

            {/* Language Switcher */}
            <div className="flex items-center bg-black/25 rounded-[var(--r-sm)] p-0.5 font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors text-xs ${
                  language === 'en' ? 'bg-white text-[var(--navy-950)] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors text-xs font-medium ${
                  language === 'hi' ? 'bg-white text-[var(--navy-950)] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
                style={{ fontFamily: 'var(--font-hi)' }}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* ROW 2: NAVY MASTHEAD + NAV (.masthead, 110px, --navy-900)    */}
      {/* ============================================================ */}
      <div className="masthead band">
        <div className="portal-container flex items-center justify-between py-3 gap-2 sm:gap-4">
          {/* Left: National Emblem Lockup + Bilingual Portal Name */}
          <div className="masthead__lockup min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-4 group focus:outline-none min-w-0" aria-label="PARAKH Portal Home">
              <div className="shrink-0 flex items-center">
                <NationalEmblemSvg className="h-10 sm:h-14 md:h-16 w-auto" />
              </div>

              <div className="masthead__rule" />

              <div className="leading-tight min-w-0">
                <span className="masthead__hi block text-sm sm:text-base md:text-lg lg:text-[20px] truncate">
                  वैध मापविज्ञान प्रवर्तन पोर्टल
                </span>
                <span className="masthead__en block text-[10px] sm:text-xs md:text-sm font-medium truncate">
                  Legal Metrology Enforcement Portal (PARAKH)
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Desktop Navigation Bar (.nav-bar) + Officer Switcher */}
          <div className="flex items-center gap-3">
            {/* Desktop Navigation Links (Sentence case) */}
            <nav className="nav-bar hidden xl:flex" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="flex items-center gap-1.5 text-xs font-medium transition-colors select-none"
                  >
                    <Icon size={14} className={active ? 'text-[var(--tiranga-saffron)]' : 'opacity-80'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Officer Profile & Switch Role dropdown */}
            <div className="relative" ref={roleMenuRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--r-sm)] bg-[var(--navy-800)] hover:bg-[#14476e] text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--navy-500)] text-xs border border-white/15"
                aria-expanded={roleMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                  <User size={13} />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-semibold text-white leading-tight flex items-center gap-1 text-[11px]">
                    {user.name}
                    <span className="text-[10px] font-mono text-[#C9DAEC] bg-white/15 px-1 rounded">
                      {user.badgeId}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#C9DAEC] leading-tight">
                    {user.jurisdiction}
                  </div>
                </div>
                <ChevronDown size={13} className={`text-[#C9DAEC] transition-transform duration-150 ${roleMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Role Switcher Popover */}
              {roleMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-72 rounded-[var(--r-md)] border border-[var(--border)] bg-white shadow-[var(--sh-2)] z-50 p-2 text-xs text-[var(--text)]">
                  <div className="px-2.5 py-1.5 border-b border-[var(--border)] mb-1 text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text)] block">{language === 'hi' ? 'सक्रिय अधिकारी प्रोफ़ाइल' : 'Active Officer Profile'}</span>
                    <span className="text-[11px] font-mono">{user.roleTitle}</span>
                  </div>
                  <div className="py-1">
                    <span className="block px-2.5 py-1 text-[11px] text-[var(--text-muted)] font-medium">
                      {language === 'hi' ? 'भूमिका बदलें' : 'Switch role & jurisdiction'}:
                    </span>
                    {(['officer', 'supervisor', 'auditor'] as UserRole[]).map((r) => {
                      const p = PROFILES[r];
                      const isSelected = role === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            switchRole(r);
                            setRoleMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-[var(--r-sm)] flex items-center justify-between transition-colors ${
                            isSelected ? 'bg-[var(--indigo-050)] text-[var(--navy-900)] font-semibold' : 'hover:bg-[var(--bg-sunken)]'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-xs text-[var(--text)]">{p.name} ({p.roleTitle})</div>
                            <div className="text-[11px] text-[var(--text-muted)]">{p.jurisdiction}</div>
                          </div>
                          {isSelected && <Check size={14} className="text-[var(--navy-900)] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-[var(--r-sm)] bg-[var(--navy-800)] text-white hover:bg-[#14476e] xl:hidden focus:outline-none focus:ring-2 focus:ring-[var(--navy-500)] border border-white/15"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ROW 3: TIRANGA TRICOLOUR RULE (.tiranga-rule, 4px)           */}
      {/* ============================================================ */}
      <div className="tiranga-rule band" aria-hidden="true" />

      {/* ============================================================ */}
      {/* MOBILE HAMBURGER DRAWER (< 1280px)                            */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex xl:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setMobileOpen(false)} />

          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-2xl flex flex-col z-50">
            <div className="h-16 px-4 bg-[var(--navy-900)] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <NationalEmblemSvg className="h-8 w-auto" />
                <span className="font-semibold text-sm">PARAKH Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-[var(--r-sm)] text-white hover:bg-white/20 focus:outline-none"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 bg-[var(--bg-sunken)] border-b border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text)]">{user.name}</div>
              <div className="text-[11px] text-[var(--text-muted)]"><span className="font-mono">{user.badgeId}</span> | {user.jurisdiction}</div>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--navy-100)] text-[var(--navy-900)]">
                {user.roleTitle}
              </div>
            </div>

            <nav className="p-3 space-y-1 overflow-y-auto flex-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-sm)] text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[var(--navy-900)] text-white font-semibold'
                        : 'text-[var(--text)] hover:bg-[var(--bg-sunken)]'
                    }`}
                  >
                    <Icon size={17} className={active ? 'text-[var(--tiranga-saffron)]' : 'text-[var(--text-muted)]'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-[var(--border)] bg-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium">Language:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded text-xs ${language === 'en' ? 'bg-[var(--navy-900)] text-white' : 'bg-[var(--bg-sunken)]'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`px-2 py-1 rounded text-xs ${language === 'hi' ? 'bg-[var(--navy-900)] text-white' : 'bg-[var(--bg-sunken)]'}`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAIN CONTENT AREA (Full-bleed bands with inner container)    */}
      {/* ============================================================ */}
      <main id="main-content" className="flex-1 w-full" role="main">
        {children}
      </main>

      {/* ============================================================ */}
      {/* FOOTER: TIRANGA TOP EDGE + NAVY FOOTER (.site-footer)        */}
      {/* ============================================================ */}
      <div className="tiranga-rule band" aria-hidden="true" />
      <footer className="site-footer band text-sm mt-auto" role="contentinfo">
        <div className="portal-container py-12">
          {/* Four Link Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1 */}
            <div>
              <h3 className="font-semibold text-white text-sm mb-3">
                {language === 'hi' ? 'प्रवर्तन सेवाएं' : 'Enforcement services'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'फील्ड कैमरा स्कैनर' : 'Field camera scanner'}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'पर्यवेक्षक वर्कक्यू' : 'Supervisor inspection queue'}
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'कमोडिटी रिकॉर्ड रिपोजिटरी' : 'Commodity records repository'}
                  </Link>
                </li>
                <li>
                  <Link href="/ecommerce" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'ई-कॉमर्स मार्केटप्लेस डेस्क' : 'Online retail package desk'}
                  </Link>
                </li>
                <li>
                  <a href="#memo" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'जब्ती एवं निरीक्षण ज्ञापन' : 'Seizure memo register'}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-semibold text-white text-sm mb-3">
                {language === 'hi' ? 'वैधानिक रूपरेखा' : 'Statutory framework'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'विधिक मापविज्ञान अधिनियम, 2009' : 'Legal Metrology Act, 2009'}
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'पैकेज्ड कमोडिटीज नियम, 2011' : 'Packaged Commodities Rules, 2011'}
                  </Link>
                </li>
                <li>
                  <a href="/docs#rule6" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'नियम 6 अनिवार्य घोषणाएं' : 'Rule 6 mandatory declarations'}
                  </a>
                </li>
                <li>
                  <a href="/docs#rule7" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'नियम 7 मुख्य प्रदर्शन पैनल (PDP)' : 'Rule 7 principal display panel standards'}
                  </a>
                </li>
                <li>
                  <a href="/docs#gazette" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'नवीनतम राजपत्र अधिसूचनाएं' : 'Official Gazette notifications'}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-semibold text-white text-sm mb-3">
                {language === 'hi' ? 'नागरिक एवं उपभोक्ता सेवाएं' : 'Citizen & consumer services'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer" className="hover:text-white inline-flex items-center gap-1 transition-colors">
                    <span>{language === 'hi' ? 'राष्ट्रीय उपभोक्ता हेल्पलाइन (1915)' : 'National Consumer Helpline (1915)'}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://edaakhil.nic.in" target="_blank" rel="noreferrer" className="hover:text-white inline-flex items-center gap-1 transition-colors">
                    <span>{language === 'hi' ? 'ई-दाखिल उपभोक्ता आयोग' : 'E-Daakhil consumer commissions'}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://consumeraffairs.nic.in" target="_blank" rel="noreferrer" className="hover:text-white inline-flex items-center gap-1 transition-colors">
                    <span>{language === 'hi' ? 'उपभोक्ता मामले विभाग' : 'Department of Consumer Affairs'}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </li>
                <li>
                  <a href="#grievance" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'पैकेजिंग उल्लंघन शिकायत दर्ज करें' : 'Report packaging violation'}
                  </a>
                </li>
                <li>
                  <Link href="/styleguide" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'डिजाइन टोकन एवं घटक मार्गदर्शिका' : 'Design system & token catalog'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="font-semibold text-white text-sm mb-3">
                {language === 'hi' ? 'पोर्टल प्रशासन' : 'Portal administration'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="block text-white font-medium">
                    {language === 'hi' ? 'प्रवर्तन सेल' : 'Enforcement Cell'}:
                  </span>
                  <span>{user.jurisdiction}</span>
                </li>
                <li className="pt-1">
                  <span className="block text-white font-medium">
                    {language === 'hi' ? 'संस्करण' : 'Portal version'}:
                  </span>
                  <span className="font-mono text-[11px]">
                    v{appConfig.version}
                  </span>
                </li>
                <li className="pt-1">
                  <a href="#accessibility" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'अभिगम्यता विवरण' : 'Accessibility statement'}
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-white transition-colors">
                    {language === 'hi' ? 'गोपनीयता नीति एवं नियम' : 'Privacy policy & terms'}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Attribution Bar */}
          <div className="border-t border-white/15 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <NationalEmblemSvg className="h-9 w-auto text-[#C9DAEC] shrink-0" />
              <div>
                <p className="font-medium text-white leading-tight">
                  {language === 'hi'
                    ? 'भारत सरकार | उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय'
                    : 'Government of India | Ministry of Consumer Affairs, Food & Public Distribution'}
                </p>
                <p className="text-[11px] text-[#C9DAEC] mt-0.5">
                  {language === 'hi'
                    ? 'विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011 प्रवर्तन'
                    : 'Designed in compliance with Legal Metrology (Packaged Commodities) Rules, 2011'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#C9DAEC]">
              <a href="#accessibility" className="hover:text-white transition-colors">
                {language === 'hi' ? 'अभिगम्यता विवरण' : 'Accessibility statement'}
              </a>
              <span className="opacity-30">|</span>
              <span className="font-mono text-[11px] tabular-nums">
                {language === 'hi' ? 'अंतिम अद्यतन: 04 सितम्बर 2026' : 'Page last updated: 04 September 2026'}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
