import Link from 'next/link';
import { useRouter } from 'next/router';

const navItems = [
  { href: '/', label: 'خانه' },
  { href: '/contracts/new', label: 'انعقاد قرارداد' },
  { href: '/agent/dashboard', label: 'پنل مشاور' },
  { href: '/admin/licenses', label: 'پنل مدیریت' },
  { href: '/account/profile', label: 'حساب کاربری' },
];

export function Navbar() {
  const router = useRouter();

  return (
    <header className="amline-topbar">
      <div className="amline-topbar__inner">
        <Link href="/" className="amline-brand">
          <img src="/assets/amline/logo.svg" alt="Amline" />
          <span>
            <span className="amline-brand__name">املاین</span>
            <span className="amline-brand__caption">املاک امن و آنلاین برای مشاور، مالک و خریدار</span>
          </span>
        </Link>

        <nav className="amline-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? router.pathname === item.href
              : router.pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`amline-nav__link${isActive ? ' amline-nav__link--active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}

          <Link href="/auth/login" className="amline-nav__cta">
            ورود به پلتفرم
          </Link>
        </nav>
      </div>
    </header>
  );
}
