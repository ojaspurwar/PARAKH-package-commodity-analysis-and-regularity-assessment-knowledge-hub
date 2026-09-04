import { ArrowUpRight, Check, CircleAlert, Clock3, MapPin, PackageSearch, WifiOff } from 'lucide-react';
import { Link } from 'wouter';
import type { Scan } from '@workspace/api-client-react';

export function StatusPill({ status, submitted }: { status: Scan['status']; submitted?: boolean }) {
  const styles = {
    compliant: 'bg-secondary/10 text-secondary',
    violation: 'bg-destructive/10 text-destructive',
    pending: 'bg-accent/25 text-foreground',
  };
  const labels = { compliant: 'Compliant', violation: 'Violation', pending: 'Pending review' };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`} data-testid={`status-scan-${status}`}>
      <span className={`size-1.5 rounded-full ${status === 'compliant' ? 'bg-secondary' : status === 'violation' ? 'bg-destructive' : 'bg-foreground/50'}`} />
      {labels[status]}
      {submitted && <Check size={12} />}
    </span>
  );
}

export function ScanRow({ scan, compact = false }: { scan: Scan; compact?: boolean }) {
  return (
    <Link href={`/scans/${scan.id}`} className={`group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-muted/45 ${compact ? '' : 'bg-card'}`} data-testid={`link-scan-${scan.id}`}>
      <span className={`grid size-10 shrink-0 place-items-center rounded-lg ${scan.source === 'ecommerce' ? 'bg-secondary/10 text-secondary' : 'bg-accent/25 text-foreground'}`}>
        <PackageSearch size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold text-foreground">{scan.productName}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{scan.reference}</span>
        </span>
        <span className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{scan.category}</span>
          <span className="size-0.5 rounded-full bg-muted-foreground/50" />
          <span className="inline-flex items-center gap-1"><MapPin size={11} />{scan.location}</span>
        </span>
      </span>
      <span className="hidden text-right sm:block">
        <span className="block font-mono text-[11px] text-muted-foreground">{formatTime(scan.capturedAt)}</span>
        <span className="mt-1 block"><StatusPill status={scan.status} submitted={scan.submitted} /></span>
      </span>
      <ArrowUpRight size={16} className="text-muted-foreground/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function EmptyState({ title, body, offline = false }: { title: string; body: string; offline?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center" data-testid="state-empty">
      <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">{offline ? <WifiOff size={22} /> : <PackageSearch size={22} />}</span>
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-xs leading-5 text-muted-foreground">{body}</p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-destructive/25 bg-destructive/5 p-4" data-testid="state-error">
      <div className="flex items-center gap-3">
        <CircleAlert size={18} className="text-destructive" />
        <div><p className="text-sm font-semibold">Could not load this workspace</p><p className="mt-0.5 text-xs text-muted-foreground">Check the connection and try again.</p></div>
      </div>
      <button type="button" onClick={onRetry} className="rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold hover:bg-muted" data-testid="button-retry">Retry</button>
    </div>
  );
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return <div className="space-y-2" data-testid="state-loading">{Array.from({ length: count }).map((_, i) => <div key={i} className="h-[68px] animate-pulse rounded-xl bg-muted" />)}</div>;
}

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function CheckIcon({ status }: { status: string }) {
  if (status === 'passed') return <Check size={15} className="text-secondary" />;
  if (status === 'failed') return <CircleAlert size={15} className="text-destructive" />;
  return <Clock3 size={15} className="text-foreground/55" />;
}