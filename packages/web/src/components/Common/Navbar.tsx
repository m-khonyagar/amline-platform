import Link from 'next/link';
import { useRouter } from 'next/router';
import { publicNavItems } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { defaultRouteForRole } from '../../lib/auth';

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const accountHref = isAuthenticated ? defaultRouteForRole(user?.role) : '/auth/login';
  const accountLabel = user?.role === 'admin' ? 'پنل ادمین' : user?.role === 'advisor' ? 'پنل مشاور' : 'حساب من';

  return (
    <header className="amline-topbar">
      <div className="amline-topbar__inner">
        <Link href="/" className="amline-brand">
          <img src="/assets/amline/logo.svg" alt="Amline" />
          <span>
            <span className="amline-brand__name">املاین</span>
            <span className="amline-brand__caption">زیرساخت یکپارچه خرید، فروش و اجاره ملک</span>
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
            {isAuthenticated ? accountLabel : 'شروع با موبایل'}
          </Link>
        </nav>
      </div>
    </header>
  );
}
