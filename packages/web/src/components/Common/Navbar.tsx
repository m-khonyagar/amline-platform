import Link from 'next/link';
import { useRouter } from 'next/router';
import { publicNavItems } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { defaultRouteForRole } from '../../lib/auth';

function getRoleLabel(role: string | undefined): string {
  if (role === 'admin') {
    return 'پنل ادمین';
  }

  if (role === 'advisor') {
    return 'پنل مشاور';
  }

  return 'حساب من';
}

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const accountHref = isAuthenticated ? defaultRouteForRole(user?.role) : '/auth/login';
  const isAppSurface = /^\/(account|agent|admin|contracts|chat)/.test(router.pathname);

  if (isAppSurface) {
    return (
      <header className="amline-topbar amline-topbar--compact">
        <div className="amline-topbar__inner amline-topbar__inner--compact">
          <Link href="/" className="amline-brand amline-brand--compact">
            <img src="/assets/amline/logo.svg" alt="Amline" />
            <span className="amline-brand__copy">
              <span className="amline-brand__line">
                <span className="amline-brand__name">املاین</span>
                <span className="amline-brand__caption">زیرساخت یکپارچه خرید، فروش و اجاره ملک</span>
              </span>
            </span>
          </Link>

          <div className="amline-topbar__meta">
            <Link href={accountHref} className="amline-topbar__panel-link">
              {getRoleLabel(user?.role)}
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="amline-topbar">
      <div className="amline-topbar__inner">
        <Link href="/" className="amline-brand">
          <img src="/assets/amline/logo.svg" alt="Amline" />
          <span className="amline-brand__copy">
            <span className="amline-brand__line">
              <span className="amline-brand__name">املاین</span>
              <span className="amline-brand__caption">زیرساخت یکپارچه خرید، فروش و اجاره ملک</span>
            </span>
          </span>
        </Link>

        <nav className="amline-nav" aria-label="Main navigation">
          {publicNavItems.map((item) => {
            const isActive = item.href === '/' ? router.pathname === item.href : router.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`amline-nav__link${isActive ? ' amline-nav__link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}

          <Link href={accountHref} className="amline-nav__cta">
            {isAuthenticated ? getRoleLabel(user?.role) : 'شروع با موبایل'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
