import { type ReactNode, lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { LanguageProvider } from '@/lib/i18n';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const HomePage = lazy(() => import('@/pages/home'));
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const ScanDetailPage = lazy(() => import('@/pages/scan-detail'));
const EcommercePage = lazy(() => import('@/pages/ecommerce'));
const ProductsPage = lazy(() => import('@/pages/products'));
const DocsPage = lazy(() => import('@/pages/docs'));
const StyleguidePage = lazy(() => import('@/pages/styleguide'));
const LoginPage = lazy(() => import('@/pages/login'));
const CitizenPage = lazy(() => import('@/pages/citizen'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function PageLoadingFallback() {
  return (
    <div className="portal-container py-8 space-y-4 select-none">
      <div className="h-12 w-full bg-[var(--indigo-600)]/10 rounded-t-[14px] animate-pulse" />
      <div className="h-72 w-full bg-white border border-[var(--border)] rounded-b-[14px] p-6 space-y-4">
        <div className="h-6 w-1/3 bg-[var(--bg-sunken)] rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-[var(--bg-sunken)] rounded animate-pulse" />
        <div className="h-32 w-full bg-[var(--bg-sunken)] rounded animate-pulse" />
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  const isPublicRoute = location === '/login' || location === '/citizen' || location === '/consumer';

  useEffect(() => {
    if (!isAuthenticated && !isPublicRoute) {
      setLocation('/login');
    }
  }, [isAuthenticated, isPublicRoute, location, setLocation]);

  if (!isAuthenticated && !isPublicRoute) {
    return (
      <RoutedErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <LoginPage />
        </Suspense>
      </RoutedErrorBoundary>
    );
  }

  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Suspense fallback={<PageLoadingFallback />}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/scans/:id" component={ScanDetailPage} />
          <Route path="/ecommerce" component={EcommercePage} />
          <Route path="/products" component={ProductsPage} />
          <Route path="/reports" component={ProductsPage} />
          <Route path="/docs" component={DocsPage} />
          <Route path="/styleguide" component={StyleguidePage} />
          <Route path="/citizen" component={CitizenPage} />
          <Route path="/consumer" component={CitizenPage} />
          <Route path="/login" component={LoginPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <AppShell>
                <Router />
              </AppShell>
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
