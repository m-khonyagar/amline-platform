import { useEffect, type ReactNode } from 'react';
import type { AppProps } from 'next/app';
import { Vazirmatn } from 'next/font/google';
import { useRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';
import { canAccessPath, defaultRouteForRole, isPublicRoute, requiresAuthenticatedUser } from '../lib/auth';
import '../styles/globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-amline-ui',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export default function AmlineApp({ Component, pageProps }: AppProps) {
  return (
    <div className={`${vazirmatn.variable} amline-font-root`}>
      <ThemeProvider>
        <AuthProvider>
          <AuthGate>
            <Component {...pageProps} />
          </AuthGate>
        </AuthProvider>
      </ThemeProvider>
    </div>
  );
}

function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isBootstrapping, isAuthenticated, user } = useAuth();
  const pathname = router.pathname;

  useEffect(() => {
    if (isBootstrapping) {
      return;
    }

    if (requiresAuthenticatedUser(pathname) && !isAuthenticated) {
      const returnTo = encodeURIComponent(router.asPath);
      void router.replace(`/auth/login?returnTo=${returnTo}`);
      return;
    }

    if (!canAccessPath(user?.role, pathname)) {
      void router.replace(defaultRouteForRole(user?.role));
      return;
    }

    if (isAuthenticated && pathname === '/auth/login') {
      void router.replace(defaultRouteForRole(user?.role));
    }
  }, [isAuthenticated, isBootstrapping, pathname, router, user?.role]);

  if (!isBootstrapping) {
    if (requiresAuthenticatedUser(pathname) && !isAuthenticated) {
      return null;
    }

    if (!canAccessPath(user?.role, pathname)) {
      return null;
    }

    if (isAuthenticated && pathname === '/auth/login') {
      return null;
    }
  }

  if (isBootstrapping && !isPublicRoute(pathname)) {
    return <div className="amline-route-splash">در حال آماده‌سازی نشست شما...</div>;
  }

  return <>{children}</>;
}
