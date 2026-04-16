import type { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { accountSidebarLinks, adminSidebarLinks, agentSidebarLinks } from '../../config/navigation';
import { Icon } from '../UI/Icon';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

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

function getSidebarLinks(pathname: string) {
  if (pathname.startsWith('/admin')) {
    return adminSidebarLinks;
  }
  if (pathname.startsWith('/agent')) {
    return agentSidebarLinks;
  }
  return accountSidebarLinks;
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
  const isMarketing = /^\/($|legal|support)/.test(router.pathname);
  const sectionLabel = getSectionLabel(router.pathname);
  const sidebarLinks = getSidebarLinks(router.pathname);

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
                این ناوبری بر اساس اهداف عملیاتی پلتفرم چیده شده است: جذب فایل، قرارداد دیجیتال، پیگیری پرداخت
                و پشتیبانی قابل رهگیری.
              </p>

              <nav className="amline-sidebar__nav" aria-label="Dashboard navigation">
                {sidebarLinks.map((link) => {
                  const isActive = router.pathname.startsWith(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`amline-sidebar__link${isActive ? ' amline-sidebar__link--active' : ''}`}
                    >
                      <span>{link.label}</span>
                      <span><Icon name="chevronLeft" className="amline-icon amline-icon--xs" /></span>
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
                    {isMarketing ? (
                      <>
                        <Link href="/contracts/new" className="amline-button amline-button--primary">
                          شروع قرارداد دیجیتال
                        </Link>
                        <Link href="/support" className="amline-button amline-button--ghost">
                          راهنمای پشتیبانی
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/contracts/new" className="amline-button amline-button--primary">
                          شروع جریان قرارداد
                        </Link>
                        <Link href="/account/profile" className="amline-button amline-button--ghost">
                          مدیریت حساب و عملیات
                        </Link>
                      </>
                    )}
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
                    <strong>هدف محصول: معامله امن، سریع و قابل رهگیری</strong>
                    <div className="amline-footer__meta">
                      از جست‌وجو تا قرارداد و تسویه، مسیرها برای کاهش اصطکاک کاربر و افزایش نرخ تکمیل فرایند طراحی شده‌اند.
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <div className="amline-section-gap amline-section-gap--lg" />
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
