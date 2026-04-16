import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useAuth } from '../../hooks/useAuth';
import { fetchProfile } from '../../services/api';

type AccountNavItem = {
  label: string;
  href?: string;
  section: 'main' | 'support';
  icon: string;
};

const navItems: AccountNavItem[] = [
  { label: 'حساب من', href: '/account/profile', section: 'main', icon: '◉' },
  { label: 'آگهی‌های من', href: '/account/listings', section: 'main', icon: '▣' },
  { label: 'نیازمندی‌های من', href: '/account/needs', section: 'main', icon: '⌁' },
  { label: 'قراردادهای من', href: '/contracts', section: 'main', icon: '▤' },
  { label: 'پرداخت‌های من', href: '/account/payment-history', section: 'main', icon: '◫' },
  { label: 'نشان‌شده‌ها', href: '/account/bookmarks', section: 'main', icon: '⌑' },
  { label: 'درخواست‌های من', href: '/account/requests', section: 'main', icon: '⟡' },
  { label: 'پشتیبانی', href: '/chat', section: 'support', icon: '◌' },
  { label: 'درباره ما', href: '/achievements', section: 'support', icon: 'ⓘ' },
  { label: 'قوانین و مقررات', href: '/legal', section: 'support', icon: '⚖' },
  { label: 'خروج از حساب کاربری', section: 'support', icon: '↺' },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { data, loading } = useAsyncData(fetchProfile, []);

  const isGuest = !isAuthenticated;
  const profile = useMemo(
    () => ({
      id: user?.id ?? data?.id ?? '...',
      fullName: user?.fullName ?? data?.fullName ?? 'کاربر املاین',
      role: user?.role ?? data?.role ?? 'guest',
      mobile: user?.mobile ?? data?.mobile ?? 'شماره ثبت نشده',
      city: user?.city ?? data?.city ?? '...',
      membership: user?.membership ?? data?.membership ?? 'عضویت استاندارد',
    }),
    [data, user],
  );

  function handleNavigation(item: AccountNavItem) {
    if (item.label === 'خروج از حساب کاربری') {
      logout();
      void router.push('/auth/login');
      return;
    }

    if (item.href) {
      void router.push(item.href);
    }
  }

  return (
    <div className="amline-account-page">
      <header className="amline-account-page__topbar">
        <button type="button" className="amline-account-page__back" onClick={() => router.back()} aria-label="بازگشت">
          ‹
        </button>
        <h1>حساب من</h1>
      </header>

      <section className={`amline-account-hero${isGuest ? ' is-guest' : ''}`}>
        <div className="amline-account-hero__avatar" aria-hidden="true">
          {isGuest ? '👤' : profile.fullName.slice(0, 1)}
        </div>

        <div className="amline-account-hero__content">
          {isGuest ? (
            <button type="button" className="amline-account-hero__login" onClick={() => router.push('/auth/login')}>
              <span>←</span>
              <span>ورود به حساب</span>
            </button>
          ) : (
            <>
              <strong>{loading ? '...' : profile.fullName}</strong>
              <span>{profile.mobile}</span>
              <span>{profile.membership}</span>
            </>
          )}
        </div>
      </section>

      {!isGuest ? (
        <section className="amline-account-readonly">
          <div>
            <span>شناسه</span>
            <strong>{profile.id}</strong>
          </div>
          <div>
            <span>نقش</span>
            <strong>{profile.role}</strong>
          </div>
          <div>
            <span>شهر</span>
            <strong>{profile.city}</strong>
          </div>
        </section>
      ) : null}

      <main className="amline-account-menu">
        <div className="amline-account-menu__group">
          {navItems.filter((item) => item.section === 'main').map((item) => (
            <button key={item.label} type="button" className="amline-account-menu__item" onClick={() => handleNavigation(item)}>
              <span className="amline-account-menu__arrow">‹</span>
              <span className="amline-account-menu__label">{item.label}</span>
              <span className="amline-account-menu__icon" aria-hidden="true">{item.icon}</span>
            </button>
          ))}
        </div>

        <div className="amline-account-menu__divider" />

        <div className="amline-account-menu__group">
          {navItems.filter((item) => item.section === 'support').map((item) => (
            <button key={item.label} type="button" className="amline-account-menu__item" onClick={() => handleNavigation(item)}>
              <span className="amline-account-menu__arrow">‹</span>
              <span className="amline-account-menu__label">{item.label}</span>
              <span className="amline-account-menu__icon" aria-hidden="true">{item.icon}</span>
            </button>
          ))}
        </div>
      </main>

      <section className="amline-account-update">
        <button type="button" className="amline-account-update__button">
          بروزرسانی
        </button>
        <div className="amline-account-update__meta">
          <span>نسخه: 1.1</span>
          <span aria-hidden="true">♦</span>
        </div>
      </section>

      <nav className="amline-contracts-bottom-nav" aria-label="پیمایش اصلی">
        <button type="button" onClick={() => router.push('/account/profile')} className="is-active">
          <span>◉</span>
          <span>حساب من</span>
        </button>
        <button type="button" onClick={() => router.push('/contracts')}>
          <span>▣</span>
          <span>قراردادها</span>
        </button>
        <button type="button" onClick={() => router.push('/chat')}>
          <span>◌</span>
          <span>گفتگو</span>
        </button>
        <button type="button" onClick={() => router.push('/')}>
          <span>⌂</span>
          <span>خانه</span>
        </button>
      </nav>
    </div>
  );
}
