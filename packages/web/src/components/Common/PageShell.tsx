import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

const dashboardLinks = [
  { href: '/admin/licenses', label: 'مدیریت مجوزها' },
  { href: '/admin/achievements', label: 'افتخارات و رتبه‌بندی' },
  { href: '/admin/jobs', label: 'فرصت‌های شغلی' },
  { href: '/agent/dashboard', label: 'داشبورد مشاور' },
  { href: '/account/profile', label: 'پروفایل کاربر' },
  { href: '/account/invoices', label: 'فاکتورها' },
  { href: '/contracts/new', label: 'انعقاد قرارداد' },
];

function getSectionLabel(pathname: string): string {
  if (pathname.startsWith('/admin')) {
    return 'پنل مدیریت';
  }

  if (pathname.startsWith('/agent')) {
    return 'پنل مشاور';
  }

  if (pathname.startsWith('/account')) {
    return 'ناحیه کاربری';
  }

  if (pathname.startsWith('/contracts')) {
    return 'قراردادهای دیجیتال';
  }

  return 'پلتفرم عمومی';
}

export function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const isDashboard = /^\/(admin|agent|account|contracts)/.test(router.pathname);
  const sectionLabel = getSectionLabel(router.pathname);

  return (
    <div className="amline-shell">
      <Navbar />
      <main className="amline-main">
        <div className={`amline-layout${isDashboard ? ' amline-layout--dashboard' : ''}`}>
          {isDashboard ? (
            <aside className="amline-sidebar">
              <span className="amline-sidebar__badge">{sectionLabel}</span>
              <h2 className="amline-sidebar__title">مسیرهای کلیدی املاین</h2>
              <p className="amline-sidebar__text">
                این ناحیه با الهام از فایل پنل مدیریت بازطراحی شده تا مسیرهای اجرایی، گزارش‌ها و عملیات روزانه
                همیشه در دسترس باشند.
              </p>

              <nav className="amline-sidebar__nav" aria-label="Dashboard navigation">
                {dashboardLinks.map((link) => {
                  const isActive = router.pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`amline-sidebar__link${isActive ? ' amline-sidebar__link--active' : ''}`}
                    >
                      <span>{link.label}</span>
                      <span>←</span>
                    </Link>
                  );
                })}
              </nav>
            </aside>
          ) : null}

          <div className="amline-content">
            <section className="amline-hero">
              <div className="amline-hero__content">
                <div>
                  <span className="amline-hero__eyebrow">{sectionLabel}</span>
                  <h1 className="amline-hero__title">{title}</h1>
                  <p className="amline-hero__subtitle">{subtitle}</p>
                  <div className="amline-hero__actions">
                    <Link href="/contracts/new" className="amline-button amline-button--primary">
                      شروع قرارداد جدید
                    </Link>
                    <Link href="/admin/licenses" className="amline-button amline-button--ghost">
                      مشاهده مرکز عملیات
                    </Link>
                  </div>
                </div>

                <div className="amline-hero__visual">
                  <div className="amline-hero__panel">
                    <img
                      src={isDashboard ? '/assets/amline/contract-3.jpeg' : '/assets/amline/homeBanner.png'}
                      alt="Amline visual"
                    />
                  </div>
                  <div className="amline-floating-card">
                    <strong>طراحی پیاده‌سازی‌شده از نمونه‌ی مرجع</strong>
                    <div className="amline-footer__meta">
                      رنگ‌ها، بافت کارت‌ها، visual hierarchy و فضای پنل از فایل‌های ضمیمه الهام گرفته شده‌اند.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div style={{ height: '1.5rem' }} />
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
