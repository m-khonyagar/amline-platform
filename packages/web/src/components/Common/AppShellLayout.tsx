import type { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { accountNavItems } from '../../config/navigation';
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
        {subtitle ? (
          <section className="amline-app-shell__hero">
            <div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            <TrustPanel items={trustItems} compact />
          </section>
        ) : null}
        {children}
      </main>

      <nav className="amline-contracts-bottom-nav" aria-label="پیمایش اصلی">
        {accountNavItems.map((item) => (
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
