import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import {
  BookOpen,
  Boxes,
  Check,
  ChevronDown,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  HelpCircle,
  Home,
  LayoutDashboard,
  Menu,
  Moon,
  Radio,
  Scale,
  Search,
  Shield,
  ShieldCheck,
  Sun,
  User,
  UserCheck,
  X,
  Smartphone,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import { useHealthCheck } from '@workspace/api-client-react';
import { appConfig } from '@/config';
import { useAuth, PROFILES, type UserRole } from '@/hooks/use-auth';
import { useI18n } from '@/lib/i18n';

type AppShellProps = { children: React.ReactNode };

/**
 * State Emblem of India (Ashoka Lion Capital SVG)
 */
function NationalEmblemSvg({ className = 'h-11 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 130" fill="currentColor" className={className} aria-label="National Emblem of India" role="img">
      {/* Central Lion Head & Mane */}
      <path d="M50 8 C44 8 40 12 39 16 C38 21 40 25 43 28 C41 31 40 35 41 40 C42 45 45 49 48 51 C45 54 44 58 45 62 C46 66 49 69 50 70 C51 69 54 66 55 62 C56 58 55 54 52 51 C55 49 58 45 59 40 C60 35 59 31 57 28 C60 25 62 21 61 16 C60 12 56 8 50 8 Z" fill="#996515" opacity="0.95" />
      {/* Left Lion Profile */}
      <path d="M38 18 C33 16 27 19 25 24 C23 29 25 34 29 37 C27 40 26 45 28 50 C30 55 35 58 39 59 C37 63 38 67 41 70 C39 67 36 63 35 59 C31 58 28 54 26 49 C24 44 25 39 27 35 C23 33 21 28 23 23 C25 17 31 14 37 16 Z" fill="#996515" opacity="0.9" />
      {/* Right Lion Profile */}
      <path d="M62 18 C67 16 73 19 75 24 C77 29 75 34 71 37 C73 40 74 45 72 50 C70 55 65 58 61 59 C63 63 62 67 59 70 C61 67 64 63 65 59 C69 58 72 54 74 49 C76 44 75 39 73 35 C77 33 79 28 77 23 C75 17 69 14 63 16 Z" fill="#996515" opacity="0.9" />
      {/* Crown Crests */}
      <circle cx="50" cy="6" r="3" fill="#B8860B" />
      <circle cx="30" cy="14" r="2.5" fill="#B8860B" />
      <circle cx="70" cy="14" r="2.5" fill="#B8860B" />
      {/* Abacus / Base Platform */}
      <rect x="20" y="74" width="60" height="8" rx="2" fill="#5138B8" />
      {/* Ashoka Chakra in Center of Abacus */}
      <circle cx="50" cy="78" r="3.5" fill="#ffffff" />
      <circle cx="50" cy="78" r="2.5" fill="#5138B8" />
      <circle cx="50" cy="78" r="0.8" fill="#ffffff" />
      {/* Bull and Horse Accents */}
      <circle cx="32" cy="78" r="2" fill="#DFFEC5" />
      <circle cx="68" cy="78" r="2" fill="#E5F7FB" />
      {/* Lower Pedestal Steps */}
      <rect x="16" y="84" width="68" height="5" rx="1" fill="#996515" opacity="0.9" />
      <rect x="12" y="91" width="76" height="5" rx="1.5" fill="#7C4DD1" />
      {/* Satyameva Jayate Inscription Base */}
      <text x="50" y="103" textAnchor="middle" fontSize="6.5" fontWeight="bold" fontFamily="Noto Sans Devanagari, sans-serif" fill="#1E1F24" letterSpacing="0.05em">
        सत्यमेव जयते
      </text>
    </svg>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [textSize, setTextSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [highContrast, setHighContrast] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);

  const { data: health, isPending: healthPending } = useHealthCheck();
  const { user, role, switchRole } = useAuth();
  const { language, setLanguage, t } = useI18n();

  // Scroll handler for masthead compression (76px to 64px)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { href: '/styleguide', label: language === 'hi' ? 'डिजाइन टोकन' : 'Styleguide & tokens', icon: FileSpreadsheet },
  ];

  const healthText = healthPending
    ? (language === 'hi' ? 'जाँच जारी...' : 'Checking...')
    : health?.status === 'ok'
    ? (language === 'hi' ? 'सिस्टम सक्रिय' : 'System active')
    : (language === 'hi' ? 'कनेक्टेड' : 'Connected');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text)] font-sans antialiased">
      {/* ============================================================ */}
      {/* 1. UTILITY STRIP (28px height, --indigo-600, full bleed)     */}
      {/* ============================================================ */}
      <header className="band bg-[var(--indigo-600)] text-white text-xs select-none z-50">
        <div className="portal-container h-7 flex items-center justify-between">
          {/* Left: Skip to main content (Accessible) & Government portal tag */}
          <div className="flex items-center gap-3">
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-1 focus:left-4 focus:z-50 focus:px-3 focus:py-1 focus:bg-white focus:text-[var(--indigo-700)] focus:font-semibold focus:rounded-[var(--r-sm)] focus:shadow-md"
            >
              {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
            </a>
            <span className="hidden sm:inline-flex items-center gap-1.5 opacity-90 font-medium">
              <span className="inline-block size-1.5 rounded-full bg-[var(--green-ac)]" />
              {language === 'hi' ? 'भारत सरकार · विधिक मापविज्ञान प्रभाग' : 'Government of India · Legal Metrology Division'}
            </span>
          </div>

          {/* Right: Accessibility Controls & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Text size controls */}
            <div className="flex items-center bg-black/15 rounded-[var(--r-sm)] px-1 py-0.5" title="Font size control">
              <button
                type="button"
                onClick={() => handleTextSizeChange('sm')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                  textSize === 'sm' ? 'bg-white text-[var(--indigo-700)] font-bold' : 'hover:bg-white/20 text-white'
                }`}
                aria-label="Decrease text size"
              >
                A−
              </button>
              <button
                type="button"
                onClick={() => handleTextSizeChange('base')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                  textSize === 'base' ? 'bg-white text-[var(--indigo-700)] font-bold' : 'hover:bg-white/20 text-white'
                }`}
                aria-label="Reset text size"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => handleTextSizeChange('lg')}
                className={`px-1.5 py-0.5 rounded font-medium transition-colors ${
                  textSize === 'lg' ? 'bg-white text-[var(--indigo-700)] font-bold' : 'hover:bg-white/20 text-white'
                }`}
                aria-label="Increase text size"
              >
                A+
              </button>
            </div>

            <span className="opacity-40">|</span>

            {/* High contrast toggle */}
            <button
              type="button"
              onClick={handleToggleContrast}
              className={`px-2 py-0.5 rounded-[var(--r-sm)] font-medium transition-colors inline-flex items-center gap-1 ${
                highContrast ? 'bg-white text-[var(--indigo-700)] font-bold' : 'hover:bg-white/20 text-white'
              }`}
              title="Toggle High Contrast"
            >
              <Sun size={12} />
              <span className="hidden sm:inline">{highContrast ? 'Normal' : 'Contrast'}</span>
            </button>

            <span className="opacity-40">|</span>

            {/* Language Switcher */}
            <div className="flex items-center bg-black/15 rounded-[var(--r-sm)] p-0.5 font-medium">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  language === 'en' ? 'bg-white text-[var(--indigo-700)] font-bold' : 'hover:bg-white/20 text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 rounded transition-colors font-medium ${
                  language === 'hi' ? 'bg-white text-[var(--indigo-700)] font-bold' : 'hover:bg-white/20 text-white'
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
      {/* 2. MASTHEAD (76px collapsing to 64px, white, hairline border) */}
      {/* ============================================================ */}
      <div className="band bg-[var(--bg-panel)] border-b border-[var(--border)] transition-all duration-200">
        <div className={`portal-container flex items-center justify-between transition-all duration-200 ${isScrolled ? 'h-16' : 'h-[76px]'}`}>
          {/* Left: National Emblem + PARAKH Brand Lockup */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-3 group focus:outline-none" aria-label="PARAKH Portal Home">
              {/* Ashoka Lion Capital SVG */}
              <div className="shrink-0 flex items-center">
                <NationalEmblemSvg className={`transition-all duration-200 ${isScrolled ? 'h-9' : 'h-11'}`} />
              </div>

              {/* Vertical hairline rule */}
              <div className="h-9 w-px bg-[var(--border)]" />

              {/* Portal Titles in Devanagari above English */}
              <div className="leading-tight">
                <span
                  className="block font-semibold text-[15px] sm:text-[17px] text-[var(--text)] tracking-tight"
                  style={{ fontFamily: 'var(--font-hi)' }}
                >
                  वैध मापविज्ञान प्रवर्तन पोर्टल
                </span>
                <span className="block text-xs sm:text-[13px] text-[var(--text-muted)] font-medium">
                  Legal Metrology Enforcement Portal (PARAKH)
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Officer Identity & District / Role Popover */}
          <div className="flex items-center gap-3">
            {/* Health pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg-sunken)] text-xs">
              <span className={`size-2 rounded-full ${healthPending ? 'bg-[var(--amber-ac)] animate-pulse' : 'bg-[var(--green-ac)]'}`} />
              <span className="text-[var(--text-muted)] font-mono text-[11px]">{healthText}</span>
            </div>

            {/* Officer Profile & Switch Role dropdown */}
            <div className="relative" ref={roleMenuRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-[var(--r-sm)] border border-[var(--border)] bg-white hover:bg-[var(--indigo-050)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
                aria-expanded={roleMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--indigo-100)] text-[var(--indigo-700)] flex items-center justify-center font-semibold text-xs shrink-0">
                  <User size={15} />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-semibold text-[var(--text)] leading-tight flex items-center gap-1">
                    {user.name}
                    <span className="text-[10px] font-mono text-[var(--indigo-700)] bg-[var(--indigo-100)] px-1 rounded">
                      {user.badgeId}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] leading-tight">
                    {user.jurisdiction}
                  </div>
                </div>
                <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-150 ${roleMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Role Switcher Menu */}
              {roleMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-72 rounded-[var(--r-md)] border border-[var(--border)] bg-white shadow-[var(--sh-2)] z-50 p-2 text-xs">
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
                            isSelected ? 'bg-[var(--indigo-100)] text-[var(--indigo-700)] font-semibold' : 'hover:bg-[var(--bg-sunken)]'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-xs">{p.name} ({p.roleTitle})</div>
                            <div className="text-[11px] text-[var(--text-muted)]">{p.jurisdiction}</div>
                          </div>
                          {isSelected && <Check size={14} className="text-[var(--indigo-700)] shrink-0" />}
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
              className="p-2 rounded-[var(--r-sm)] border border-[var(--border)] bg-white text-[var(--text)] hover:bg-[var(--bg-sunken)] md:hidden focus:outline-none focus:ring-2 focus:ring-[var(--indigo-600)]"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. NAVIGATION BAR (48px height, --indigo-600, sticky on scroll)*/}
      {/* ============================================================ */}
      <nav className="band bg-[var(--indigo-600)] text-white sticky top-0 z-40 shadow-sm" aria-label="Main navigation">
        <div className="portal-container h-12 flex items-center justify-between">
          {/* Desktop Navigation Links (Sentence case, no uppercase) */}
          <div className="hidden md:flex items-center h-full gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-full px-3.5 flex items-center gap-2 text-sm font-medium transition-colors select-none relative ${
                    active
                      ? 'bg-[var(--indigo-700)] text-white border-b-[3px] border-white font-semibold'
                      : 'text-white/90 hover:bg-[var(--indigo-700)] hover:text-white'
                  }`}
                >
                  <Icon size={16} className={active ? 'text-white' : 'text-white/80'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Bar Title when menu collapsed */}
          <div className="md:hidden flex items-center gap-2 text-sm font-semibold text-white">
            <Radio size={16} />
            <span>{navItems.find((n) => (n.href === '/' ? location === '/' : location.startsWith(n.href)))?.label || 'PARAKH'}</span>
          </div>

          {/* Right Action: Quick Scan / Inspection Button */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[var(--r-sm)] bg-white text-[var(--indigo-700)] text-xs font-semibold hover:bg-[var(--indigo-050)] transition-transform active:scale-[0.985] shadow-sm"
            >
              <Radio size={13} className="text-[var(--indigo-700)]" />
              <span>{language === 'hi' ? 'त्वरित स्कैन' : 'Quick scan'}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* MOBILE HAMBURGER DRAWER (< 860px)                             */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />

          {/* Slide-over Panel */}
          <div className="relative ml-auto w-full max-w-xs h-full bg-white shadow-2xl flex flex-col z-50">
            {/* Drawer Header */}
            <div className="h-16 px-4 bg-[var(--indigo-600)] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <NationalEmblemSvg className="h-8 w-auto text-white" />
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

            {/* Officer Details in Drawer */}
            <div className="p-4 bg-[var(--bg-sunken)] border-b border-[var(--border)]">
              <div className="text-xs font-semibold text-[var(--text)]">{user.name}</div>
              <div className="text-[11px] text-[var(--text-muted)] font-mono">{user.badgeId} · {user.jurisdiction}</div>
              <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--indigo-100)] text-[var(--indigo-700)]">
                {user.roleTitle}
              </div>
            </div>

            {/* Navigation List */}
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
                        ? 'bg-[var(--indigo-100)] text-[var(--indigo-700)] font-semibold'
                        : 'text-[var(--text)] hover:bg-[var(--bg-sunken)]'
                    }`}
                  >
                    <Icon size={17} className={active ? 'text-[var(--indigo-700)]' : 'text-[var(--text-muted)]'} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Language & Text Controls at bottom of drawer */}
            <div className="p-4 border-t border-[var(--border)] bg-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium">Language:</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-1 rounded text-xs ${language === 'en' ? 'bg-[var(--indigo-600)] text-white' : 'bg-[var(--bg-sunken)]'}`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`px-2 py-1 rounded text-xs ${language === 'hi' ? 'bg-[var(--indigo-600)] text-white' : 'bg-[var(--bg-sunken)]'}`}
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
      {/* 4. MAIN CONTENT AREA (Full-bleed stack with inner container)  */}
      {/* ============================================================ */}
      <main id="main-content" className="flex-1 w-full" role="main">
        {children}
      </main>

      {/* ============================================================ */}
      {/* 5. FOOTER (--bg-sunken band, 4 link columns, attribution)    */}
      {/* ============================================================ */}
      <footer className="band bg-[var(--bg-sunken)] border-t border-[var(--border)] text-[var(--text-muted)] text-sm mt-auto" role="contentinfo">
        <div className="portal-container py-12">
          {/* Four Link Columns (Sentence case everywhere) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Column 1 */}
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm mb-3">
                {language === 'hi' ? 'प्रवर्तन सेवाएं' : 'Enforcement services'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'फील्ड कैमरा स्कैनर' : 'Field camera scanner'}
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'पर्यवेक्षक वर्कक्यू' : 'Supervisor inspection queue'}
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'स्थानीय कमोडिटी रजिस्टर' : 'Commodity records repository'}
                  </Link>
                </li>
                <li>
                  <Link href="/ecommerce" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'ई-कॉमर्स मार्केटप्लेस डेस्क' : 'Online retail package desk'}
                  </Link>
                </li>
                <li>
                  <a href="#memo" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'जब्ती एवं निरीक्षण ज्ञापन' : 'Seizure memo register'}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 2 */}
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm mb-3">
                {language === 'hi' ? 'वैधानिक रूपरेखा' : 'Statutory framework'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/docs" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'विधिक मापविज्ञान अधिनियम, 2009' : 'Legal Metrology Act, 2009'}
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'पैकेज्ड कमोडिटीज नियम, 2011' : 'Packaged Commodities Rules, 2011'}
                  </Link>
                </li>
                <li>
                  <a href="/docs#rule6" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'नियम 6 अनिवार्य घोषणाएं' : 'Rule 6 mandatory declarations'}
                  </a>
                </li>
                <li>
                  <a href="/docs#rule7" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'नियम 7 मुख्य प्रदर्शन पैनल (PDP)' : 'Rule 7 principal display panel standards'}
                  </a>
                </li>
                <li>
                  <a href="/docs#gazette" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'नवीनतम राजपत्र अधिसूचनाएं' : 'Official Gazette notifications'}
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3 */}
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm mb-3">
                {language === 'hi' ? 'नागरिक एवं उपभोक्ता सेवाएं' : 'Citizen & consumer services'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="https://consumerhelpline.gov.in" target="_blank" rel="noreferrer" className="hover:text-[var(--link-hover)] inline-flex items-center gap-1 transition-colors">
                    <span>{language === 'hi' ? 'राष्ट्रीय उपभोक्ता हेल्पलाइन (1915)' : 'National Consumer Helpline (1915)'}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://edaakhil.nic.in" target="_blank" rel="noreferrer" className="hover:text-[var(--link-hover)] inline-flex items-center gap-1 transition-colors">
                    <span>{language === 'hi' ? 'ई-दाखिल उपभोक्ता आयोग' : 'E-Daakhil consumer commissions'}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://consumeraffairs.nic.in" target="_blank" rel="noreferrer" className="hover:text-[var(--link-hover)] inline-flex items-center gap-1 transition-colors">
                    <span>{language === 'hi' ? 'उपभोक्ता मामले विभाग' : 'Department of Consumer Affairs'}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </li>
                <li>
                  <a href="#grievance" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'पैकेजिंग उल्लंघन शिकायत दर्ज करें' : 'Report packaging violation'}
                  </a>
                </li>
                <li>
                  <Link href="/styleguide" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'डिजाइन टोकन एवं घटक मार्गदर्शिका' : 'Design system & token catalog'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 */}
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm mb-3">
                {language === 'hi' ? 'पोर्टल प्रशासन' : 'Portal administration'}
              </h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <span className="block text-[var(--text)] font-medium">
                    {language === 'hi' ? 'प्रवर्तन सेल' : 'Enforcement Cell'}:
                  </span>
                  <span>{user.jurisdiction}</span>
                </li>
                <li className="pt-1">
                  <span className="block text-[var(--text)] font-medium">
                    {language === 'hi' ? 'सिस्टम स्थिति' : 'System status'}:
                  </span>
                  <span className="font-mono text-[11px] inline-flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-[var(--green-ac)]" />
                    {healthText} (v{appConfig.version})
                  </span>
                </li>
                <li className="pt-1">
                  <a href="#accessibility" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'अभिगम्यता विवरण' : 'Accessibility statement'}
                  </a>
                </li>
                <li>
                  <a href="#privacy" className="hover:text-[var(--link-hover)] transition-colors">
                    {language === 'hi' ? 'गोपनीयता नीति एवं नियम' : 'Privacy policy & terms'}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Attribution Bar */}
          <div className="border-t border-[var(--border)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <NationalEmblemSvg className="h-9 w-auto text-[var(--text-muted)] shrink-0" />
              <div>
                <p className="font-medium text-[var(--text)] leading-tight">
                  {language === 'hi'
                    ? 'भारत सरकार · उपभोक्ता मामले, खाद्य और सार्वजनिक वितरण मंत्रालय'
                    : 'Government of India · Ministry of Consumer Affairs, Food & Public Distribution'}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {language === 'hi'
                    ? 'विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011 प्रवर्तन'
                    : 'Designed in compliance with Legal Metrology (Packaged Commodities) Rules, 2011'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <a href="#accessibility" className="text-[var(--link)] hover:text-[var(--link-hover)]">
                {language === 'hi' ? 'अभिगम्यता विवरण' : 'Accessibility statement'}
              </a>
              <span className="opacity-30">•</span>
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
