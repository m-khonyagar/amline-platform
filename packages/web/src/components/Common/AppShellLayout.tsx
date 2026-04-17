import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { accountNavItems } from '../../config/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Icon } from '../UI/Icon';
import { TrustPanel } from '../UI/TrustPanel';

export function AppShellLayout({
  title,
  subtitle,
  children,
  topbarAction,
  activeNavHref,
  trustItems = ['رهگیری رسمی', 'پشتیبانی حقوقی', 'فرایند شفاف'],
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  topbarAction?: ReactNode;
  activeNavHref: string;
  trustItems?: string[];
}) {
  const router = useRouter();
  const { user } = useAuth();
  const bottomNavItems =
    user?.role === 'admin'
      ? [
          { href: '/admin', label: 'ادمین', icon: 'home' as const },
          { href: '/admin/review-queue', label: 'بررسی', icon: 'contracts' as const },
          { href: '/admin/fraud-desk', label: 'تقلب', icon: 'support' as const },
          { href: '/account/profile', label: 'حساب', icon: 'account' as const },
        ]
      : user?.role === 'advisor'
        ? [
            { href: '/agent/dashboard', label: 'داشبورد', icon: 'home' as const },
            { href: '/contracts', label: 'قراردادها', icon: 'contracts' as const },
            { href: '/chat', label: 'گفتگو', icon: 'chat' as const },
            { href: '/account/profile', label: 'حساب', icon: 'account' as const },
          ]
        : accountNavItems;

  return (
    <div className="amline-app-shell">
      <header className="amline-app-shell__topbar">
        <button type="button" className="amline-app-shell__back" onClick={() => router.back()} aria-label="بازگشت">
          <Icon name="back" className="amline-icon amline-icon--md" />
        </button>
        <div className="amline-app-shell__heading">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        <div className="amline-app-shell__action">{topbarAction}</div>
      </header>

      <main className="amline-app-shell__content">
        {trustItems.length > 0 ? (
          <section className="amline-app-shell__trust-band" aria-label="تضمین‌های مسیر">
            <TrustPanel items={trustItems} compact />
          </section>
        ) : null}
        {children}
      </main>

      <nav className="amline-contracts-bottom-nav" aria-label="پیمایش اصلی">
        {bottomNavItems.map((item) => (
          <button
            key={item.href}
            type="button"
            className={activeNavHref === item.href ? 'is-active' : ''}
            onClick={() => router.push(item.href)}
          >
            <Icon name={item.icon ?? 'home'} className="amline-icon amline-icon--sm" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
