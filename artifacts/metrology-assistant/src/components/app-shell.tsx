import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Activity, Boxes, ClipboardList, ExternalLink, LayoutDashboard, Menu, Radio, ShieldCheck, X } from 'lucide-react';
import { useHealthCheck } from '@workspace/api-client-react';
import { appConfig } from '@/config';

type AppShellProps = { children: React.ReactNode };

const navItems = [
  { href: '/', label: 'Field scanner', hindi: 'फील्ड स्कैनर', icon: Radio },
  { href: '/dashboard', label: 'Supervisor view', hindi: 'सुपरवाइज़र दृश्य', icon: LayoutDashboard },
  { href: '/products', label: 'Products repository', hindi: 'उत्पाद रजिस्टर', icon: Boxes },
  { href: '/ecommerce', label: 'Online products', hindi: 'ऑनलाइन उत्पाद', icon: ExternalLink },
];

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: health, isPending: healthPending } = useHealthCheck();
  const healthLabel = healthPending ? 'Checking service' : health?.status === 'ok' ? 'Service online' : 'Service ready';

  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[276px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-200 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-start justify-between px-3">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <ShieldCheck size={21} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block font-semibold tracking-[-.03em]">{appConfig.name}</span>
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/55">L.M. workspace</span>
            </span>
          </Link>
          <button type="button" className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-close-menu">
            <X size={18} />
          </button>
        </div>

        <div className="mt-10 px-3 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/45">Workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${active ? 'bg-sidebar-accent text-sidebar-foreground' : 'text-sidebar-foreground/63 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}
                data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                <Icon size={18} className={active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-primary'} />
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-sidebar-foreground/40">{item.hindi}</span>
                </span>
                {active && <span className="ml-auto size-1.5 rounded-full bg-sidebar-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[.14em] text-sidebar-foreground/45">System status</span>
              <span className={`size-2 rounded-full ${healthPending ? 'bg-sidebar-primary animate-pulse' : 'bg-[#7fc9a9]'}`} />
            </div>
            <p className="mt-3 text-sm font-medium">{healthLabel}</p>
            <p className="mt-1 text-xs leading-5 text-sidebar-foreground/50">Evidence is queued locally if a field connection drops.</p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-sidebar-border px-2 pt-4">
            <span className="grid size-8 place-items-center rounded-full bg-sidebar-primary/15 font-mono text-xs text-sidebar-primary">AM</span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">A. Mehta</p>
              <p className="truncate text-[11px] text-sidebar-foreground/45">Field officer</p>
            </div>
            <Activity size={15} className="ml-auto text-sidebar-foreground/35" />
          </div>
        </div>
      </aside>
      {mobileOpen && <button type="button" className="fixed inset-0 z-30 bg-sidebar/40 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" data-testid="button-overlay-close" />}

      <main className="min-h-[100dvh] md:pl-[276px]">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur md:px-9">
          <div className="flex items-center gap-3">
            <button type="button" className="rounded-lg border border-border p-2 text-muted-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu" data-testid="button-open-menu">
              <Menu size={18} />
            </button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <ClipboardList size={15} />
              <span>Enforcement /</span>
              <span className="font-medium text-foreground">{location === '/' ? 'Capture desk' : location.startsWith('/dashboard') ? 'Overview' : location.startsWith('/ecommerce') ? 'Online products' : 'Evidence detail'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground sm:inline-flex">{appConfig.version}</span>
            <span className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-medium text-secondary">
              <span className="mr-1.5 inline-block size-1.5 rounded-full bg-secondary align-middle" />
              Sync stable
            </span>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1500px] px-5 py-7 md:px-9 md:py-9">{children}</div>
      </main>
    </div>
  );
}