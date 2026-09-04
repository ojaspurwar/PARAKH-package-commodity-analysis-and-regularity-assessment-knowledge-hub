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
    { href: '/reports', label: language === 'hi' ? 'रिपोर्ट्स' : 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text)] font-sans antialiased">
      {/* ============================================================ */}
      {/* ROW 0: GREY IDENTIFICATION BANNER (.gov-banner, 32px, #F5F5F5)*/}
      {/* ============================================================ */}
      {/* ============================================================ */}
      {/* ╔══ ROW 1 — IDENTIFICATION BANNER ══╗                       */}
      {/* background #F5F5F5 · height 36px · font-size 14px · #2C3038 */}
      {/* ============================================================ */}
      <div className="header-row-1 select-none">
        <div className="header-row-1__inner">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 overflow-hidden">
            {/* Indian flag icon 20×14 */}
            <svg className="gov-banner__flag rounded-[2px]" viewBox="0 0 20 14" width="20" height="14" aria-hidden="true">
              <rect width="20" height="4.67" fill="#FF9933" />
              <rect y="4.67" width="20" height="4.67" fill="#FFFFFF" />
              <rect y="9.34" width="20" height="4.66" fill="#138808" />
              <circle cx="10" cy="7" r="1.9" fill="#000080" />
            </svg>
            <span className="font-medium text-[#2C3038] truncate text-xs sm:text-sm">
              {language === 'hi'
                ? 'भारत सरकार का आधिकारिक विधिक मापविज्ञान पोर्टल'
                : 'An official portal of the Government of India'}
            </span>
          </div>
          <span className="hidden sm:inline text-[13px] text-[#55565E] font-medium shrink-0">
            {language === 'hi'
              ? 'उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय'
              : 'Ministry of Consumer Affairs, Food & Public Distribution'}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ╔══ ROW 2 — UTILITY STRIP ══╗                                */}
      {/* background #052963 · height 46px · font-size 15px · #C9DAEC */}
      {/* ============================================================ */}
      <header className="header-row-2 z-40 select-none">
        <div className="header-row-2__inner">
          {/* Left: Accessible Skip Link & Statutory Department Tag */}
          <div className="flex items-center gap-3">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:static focus:px-3 focus:py-1 focus:bg-white focus:text-[#052963] focus:font-semibold focus:rounded-[var(--r-sm)] focus:shadow-md"
            >
              {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
            </a>
            <span className="hidden md:inline-flex items-center text-[15px] font-medium text-[#C9DAEC]">
              {language === 'hi'
                ? 'विधिक मापविज्ञान प्रभाग | विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011'
                : 'Legal Metrology Division | Legal Metrology (Packaged Commodities) Rules, 2011'}
            </span>
          </div>

          {/* Right: Accessibility Controls & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-[14px]">
            {/* A− A A+ font size controls */}
            <div className="flex items-center gap-0.5 sm:gap-1 font-medium" title="Font size control">
              <button
                type="button"
                onClick={() => handleTextSizeChange('sm')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  textSize === 'sm' ? 'bg-white text-[#052963] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
                aria-label="Decrease text size"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => handleTextSizeChange('base')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  textSize === 'base' ? 'bg-white text-[#052963] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
                aria-label="Reset text size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleTextSizeChange('lg')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  textSize === 'lg' ? 'bg-white text-[#052963] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>

            {/* 1px divider */}
            <span className="inline-block w-[1px] h-3.5 sm:h-4 bg-white/28" aria-hidden="true" />

            {/* Contrast toggle */}
            <button
              type="button"
              onClick={handleToggleContrast}
              className={`px-1.5 sm:px-2 py-0.5 rounded-[var(--r-sm)] font-medium transition-colors inline-flex items-center gap-1 ${
                highContrast ? 'bg-white text-[#052963] font-bold' : 'text-[#C9DAEC] hover:text-white'
              }`}
              title="Toggle High Contrast"
            >
              <Sun size={13} className="shrink-0" />
              <span className="hidden sm:inline">{highContrast ? 'Normal' : 'Contrast'}</span>
            </button>

            {/* 1px divider */}
            <span className="inline-block w-[1px] h-3.5 sm:h-4 bg-white/28" aria-hidden="true" />

            {/* Language Switcher: English / हिन्दी */}
            <div className="flex items-center gap-1 font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors text-[11px] sm:text-xs ${
                  language === 'en' ? 'bg-white text-[#052963] font-bold' : 'text-[#C9DAEC] hover:text-white'
                }`}
              >
                English
              </button>
              <span className="text-[#C9DAEC]/60">/</span>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-1.5 sm:px-2 py-0.5 rounded transition-colors text-[11px] sm:text-xs font-medium ${
                  language === 'hi' ? 'bg-white text-[#052963] font-bold' : 'text-[#C9DAEC] hover:text-white'
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
      {/* ╔══ ROW 3 — MASTHEAD (#FFFFFF, 3-column grid) ══╗            */}
      {/* ============================================================ */}
      <div className="header-row-3">
        <div className="header-row-3__grid">
          {/* Mobile-only top bar: DoCA Emblem on left, PARAKH mark on right */}
          <div className="masthead-mobile-top-bar flex sm:hidden items-center justify-between w-full">
            <Link href="/" className="block focus:outline-none focus:ring-2 focus:ring-[#005EA2] rounded" aria-label="PARAKH Portal Home">
              <picture>
                <source srcSet="/assets/doca-lockup.webp" type="image/webp" />
                <img
                  src="/assets/doca-lockup.png"
                  alt="Department of Consumer Affairs, Government of India"
                  width="200"
                  height="44"
                  loading="eager"
                  decoding="async"
                  className="masthead-doca-img"
                />
              </picture>
            </Link>
            <img
              src="/assets/parakh.svg"
              alt="PARAKH"
              className="masthead-parakh-svg"
            />
          </div>

          {/* Desktop Left: A single <img> of DoCA lockup (height 88px) */}
          <div className="hidden sm:flex items-center shrink-0">
            <Link href="/" className="block focus:outline-none focus:ring-2 focus:ring-[#005EA2] rounded" aria-label="PARAKH Portal Home">
              <picture>
                <source srcSet="/assets/doca-lockup.webp" type="image/webp" />
                <img
                  src="/assets/doca-lockup.png"
                  alt="Department of Consumer Affairs, Government of India"
                  width="280"
                  height="88"
                  loading="eager"
                  decoding="async"
                  className="masthead-doca-img"
                />
              </picture>
            </Link>
          </div>

          {/* Centre: Exactly 3 stacked lines */}
          <div className="masthead-center-block select-none">
            <span className="masthead-title-hi block">
              वैध मापविज्ञान प्रवर्तन पोर्टल
            </span>
            <span className="masthead-title-en block">
              Legal Metrology Enforcement Portal
            </span>
            <span className="masthead-title-brand block">
              PARAKH
            </span>
          </div>

          {/* Right: PARAKH mark + Officer chip (hidden on mobile, shown on desktop) */}
          <div className="masthead-right-block">
            <img
              src="/assets/parakh.svg"
              alt="PARAKH"
              className="masthead-parakh-svg"
            />

            {/* Officer Chip with Role Switcher Dropdown */}
            <div className="relative" ref={roleMenuRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="masthead-officer-chip focus:outline-none focus:ring-2 focus:ring-[#005EA2]"
                aria-expanded={roleMenuOpen}
                aria-haspopup="true"
              >
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="masthead-officer-name">{user.name}</span>
                    <span className="masthead-officer-badge">{user.badgeId}</span>
                  </div>
                  <span className="masthead-officer-jur">{user.jurisdiction}</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-[#55565E] transition-transform duration-150 ${roleMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Role Switcher Popover */}
              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-[var(--r-md)] border border-[var(--border)] bg-white shadow-[var(--sh-2)] z-50 p-2 text-xs text-[var(--text)]">
                  <div className="px-2.5 py-1.5 border-b border-[var(--border)] mb-1 text-[var(--text-muted)]">
                    <span className="font-semibold text-[var(--text)] block">
                      {language === 'hi' ? 'सक्रिय अधिकारी प्रोफ़ाइल' : 'Active Officer Profile'}
                    </span>
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
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ╔══ ROW 4 — NAVIGATION (#F6F3EE, 56px) ══╗                   */}
      {/* ============================================================ */}
      <nav className="header-row-4" aria-label="Main navigation">
        <div className="header-row-4__inner">
          {/* Six navigation items in one horizontal flex row */}
          <ul className="header-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              return (
                <li key={item.href} className="header-nav-item">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`header-nav-link ${active ? 'active' : ''}`}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile active section indicator (< 860px) */}
          <div className="flex md:hidden items-center gap-2 text-sm font-semibold text-[#1E1F24] min-w-0">
            {(() => {
              const currentItem = navItems.find((i) => i.href === '/' ? location === '/' : location.startsWith(i.href)) || navItems[0];
              const Icon = currentItem.icon;
              return (
                <>
                  <Icon size={18} className="text-[#052963] shrink-0" />
                  <span className="truncate">{currentItem.label}</span>
                </>
              );
            })()}
          </div>

          {/* Mobile hamburger button (< 860px) */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="header-hamburger-btn"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
            <span>{language === 'hi' ? 'नेविगेशन' : 'Menu'}</span>
          </button>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* ╔══ TIRANGA TRICOLOUR RULE (4px, 100vw exact thirds) ══╗     */}
      {/* ============================================================ */}
      <div className="tiranga-rule" aria-hidden="true" role="presentation" />

      {/* ============================================================ */}
      {/* MOBILE HAMBURGER DRAWER (< 860px)                             */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={() => setMobileOpen(false)} />

          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-2xl flex flex-col z-50">
            <div className="h-16 px-4 bg-[#052963] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/assets/parakh.svg" alt="PARAKH" className="h-7 w-auto brightness-0 invert" />
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
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold text-[var(--text)]">{user.name}</div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white border border-[var(--border)] text-[var(--navy-900)]">
                  {user.badgeId}
                </span>
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">{user.jurisdiction}</div>
              <div className="mt-2 pt-2 border-t border-[var(--border)]">
                <span className="block text-[10px] text-[var(--text-muted)] font-medium mb-1">
                  {language === 'hi' ? 'भूमिका बदलें' : 'Active role'}:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(['officer', 'supervisor', 'auditor'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => switchRole(r)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-colors capitalize ${
                        role === r
                          ? 'bg-[#052963] text-white'
                          : 'bg-white border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-sunken)]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
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
                        ? 'bg-[#FBAC1B] text-[#1E1F24] font-semibold'
                        : 'text-[var(--text)] hover:bg-[var(--bg-sunken)]'
                    }`}
                  >
                    <Icon size={18} className="shrink-0" />
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
                    className={`px-2 py-1 rounded text-xs ${language === 'en' ? 'bg-[#052963] text-white font-semibold' : 'bg-[var(--bg-sunken)]'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`px-2 py-1 rounded text-xs ${language === 'hi' ? 'bg-[#052963] text-white font-semibold' : 'bg-[var(--bg-sunken)]'}`}
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
