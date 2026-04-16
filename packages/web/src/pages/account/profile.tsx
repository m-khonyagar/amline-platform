import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { Icon } from '../../components/UI/Icon';
import { fetchProfile, fetchProfileDetails, updateProfileDetails, updateProfilePreference } from '../../services/api';

type AccountNavItem = {
  id: string;
  label: string;
  href?: string;
  icon:
    | 'account'
    | 'listing'
    | 'needs'
    | 'contracts'
    | 'payments'
    | 'bookmarks'
    | 'requests'
    | 'support'
    | 'info'
    | 'legal'
    | 'logout';
};

const trustItems = ['قرارداد معتبر حقوقی', 'کد رهگیری رسمی', 'امضای دیجیتال معتبر', 'پشتیبانی حقوقی'];

const menuSections: Array<{ title: string; items: AccountNavItem[] }> = [
  {
    title: 'حساب کاربری',
    items: [
      { id: 'account-home', label: 'حساب من', href: '/account/profile', icon: 'account' },
      { id: 'account-profile', label: 'پروفایل', href: '/account/profile', icon: 'account' },
      { id: 'account-settings', label: 'تنظیمات', href: '/account/profile', icon: 'info' },
    ],
  },
  {
    title: 'فعالیت های ملکی',
    items: [
      { id: 'account-listings', label: 'آگهی های من', href: '/account/listings', icon: 'listing' },
      { id: 'account-needs', label: 'نیازمندی ها', href: '/account/needs', icon: 'needs' },
      { id: 'account-requests', label: 'درخواست ها', href: '/account/requests', icon: 'requests' },
    ],
  },
  {
    title: 'قرارداد و مالی',
    items: [
      { id: 'account-contracts', label: 'قراردادها', href: '/contracts', icon: 'contracts' },
      { id: 'account-payments', label: 'پرداخت ها', href: '/account/payment-history', icon: 'payments' },
      { id: 'account-tracking', label: 'کدهای رهگیری', href: '/legal', icon: 'legal' },
    ],
  },
  {
    title: 'پشتیبانی و اطلاعات',
    items: [
      { id: 'account-support', label: 'پشتیبانی', href: '/chat', icon: 'support' },
      { id: 'account-about', label: 'درباره ما', href: '/achievements', icon: 'info' },
      { id: 'account-legal', label: 'قوانین', href: '/legal', icon: 'legal' },
      { id: 'account-logout', label: 'خروج از حساب کاربری', icon: 'logout' },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { data, loading, error } = useAsyncData(fetchProfile, []);
  const detailsQuery = useAsyncData(fetchProfileDetails, []);
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [agencyNameDraft, setAgencyNameDraft] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<Array<{ key: string; label: string; enabled: boolean }>>([]);

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

  useEffect(() => {
    setAgencyNameDraft(detailsQuery.data?.agencyName ?? '');
    setPrefs(detailsQuery.data?.preferences ?? []);
  }, [detailsQuery.data]);

  const dashboardStats = useMemo(
    () => [
      { label: 'قراردادهای فعال', value: 24 },
      { label: 'آگهی فعال', value: 5 },
      { label: 'درخواست باز', value: 3 },
      { label: 'پرداخت معلق', value: 2 },
    ],
    [],
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

  async function handleSaveAgency() {
    if (!agencyNameDraft.trim()) {
      setProfileFeedback('نام آژانس نمی‌تواند خالی باشد.');
      return;
    }
    setProfileFeedback(null);
    try {
      await updateProfileDetails({ agencyName: agencyNameDraft.trim() });
      setProfileFeedback('جزئیات حساب با موفقیت ذخیره شد.');
    } catch {
      setProfileFeedback('ذخیره اطلاعات حساب ناموفق بود. دوباره تلاش کنید.');
    }
  }

  async function handleTogglePreference(key: string, enabled: boolean) {
    const previous = prefs;
    setProfileFeedback(null);
    setPrefs((current) => current.map((item) => (item.key === key ? { ...item, enabled } : item)));
    try {
      await updateProfilePreference(key, enabled);
    } catch {
      setPrefs(previous);
      setProfileFeedback('به‌روزرسانی تنظیمات اعلان ناموفق بود.');
    }
  }

  return (
    <div className="amline-account-page">
      <header className="amline-account-page__topbar">
        <button type="button" className="amline-account-page__back" onClick={() => router.back()} aria-label="بازگشت">
          <Icon name="back" className="amline-icon amline-icon--md" />
        </button>
        <h1>حساب من</h1>
      </header>

      <section className={`amline-account-hero${isGuest ? ' is-guest' : ''}`}>
        <div className="amline-account-hero__glow" aria-hidden="true" />
        <div className="amline-account-hero__head">
          <div className="amline-account-hero__avatar" aria-hidden="true">
            {isGuest ? <Icon name="account" className="amline-icon amline-icon--md" /> : profile.fullName.slice(0, 1)}
          </div>
          <div className="amline-account-hero__content">
            {isGuest ? (
              <button type="button" className="amline-account-hero__login" onClick={() => router.push('/auth/login')}>
                <Icon name="chevronLeft" className="amline-icon amline-icon--sm" />
                <span>ورود به حساب</span>
              </button>
            ) : (
              <>
                <strong>{loading ? '...' : profile.fullName}</strong>
                <span className="amline-account-hero__badge">
                  <Icon name="check" className="amline-icon amline-icon--xs" />
                  احراز هویت شده
                </span>
                <span>عضو از ۱۴۰۳</span>
                <span>{profile.role === 'admin' ? 'سطح حساب: سازمانی' : 'سطح حساب: حرفه ای'}</span>
              </>
            )}
          </div>
        </div>
        {!isGuest ? (
          <div className="amline-account-hero__stats">
            <article>
              <strong>24</strong>
              <span>قرارداد</span>
            </article>
            <article>
              <strong>5</strong>
              <span>آگهی</span>
            </article>
            <article>
              <strong>3</strong>
              <span>درخواست فعال</span>
            </article>
          </div>
        ) : null}
      </section>

      {!isGuest ? (
        <section className="amline-account-kpi-strip" aria-label="خلاصه شاخص های حساب">
          {dashboardStats.map((item) => (
            <article key={item.label} className="amline-account-kpi-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>
      ) : null}

      {!isGuest ? (
        <section className="amline-account-trust-strip" aria-label="اعتبار و انطباق">
          {trustItems.map((item) => (
            <article key={item} className="amline-account-trust-item">
              <span className="amline-account-trust-item__icon" aria-hidden="true">
                <Icon name="check" className="amline-icon amline-icon--xs" />
              </span>
              <strong>{item}</strong>
            </article>
          ))}
        </section>
      ) : null}

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
      {!isGuest ? (
        <section className="amline-profile-detail-grid">
          <article className="amline-profile-detail-card">
            <span>تکمیل پروفایل</span>
            <strong>{detailsQuery.loading ? '...' : `${detailsQuery.data?.completionPercent ?? 0}%`}</strong>
          </article>
          <article className="amline-profile-detail-card">
            <span>وضعیت احراز هویت</span>
            <strong>{(detailsQuery.data?.identityStatus ?? 'pending') === 'verified' ? 'تایید شده' : 'در انتظار بررسی'}</strong>
          </article>
          <article className="amline-profile-detail-card">
            <span>آژانس فعال</span>
            <strong>{detailsQuery.loading ? '...' : detailsQuery.data?.agencyName ?? '—'}</strong>
          </article>
        </section>
      ) : null}
      {!isGuest && error ? (
        <p className="amline-form-feedback amline-form-feedback--error amline-account-error-feedback">
          اطلاعات کامل پروفایل دریافت نشد. داده‌های محلی نمایش داده می‌شود.
        </p>
      ) : null}
      {!isGuest && detailsQuery.error ? (
        <p className="amline-form-feedback amline-form-feedback--error amline-account-error-feedback">
          جزئیات حساب کاربری کامل دریافت نشد. بخشی از داده‌ها به‌صورت پیش‌فرض نمایش داده می‌شود.
        </p>
      ) : null}
      {profileFeedback ? <p className="amline-form-feedback amline-account-error-feedback">{profileFeedback}</p> : null}

      <main className="amline-account-menu">
        {menuSections.map((section) => (
          <section key={section.title} className="amline-account-menu__section">
            <h2 className="amline-account-menu__title">{section.title}</h2>
            <div className="amline-account-menu__group">
              {section.items.map((item) => {
                const isActive = !!item.href && router.pathname.startsWith(item.href);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`amline-account-menu__item${isActive ? ' is-active' : ''}`}
                    onClick={() => handleNavigation(item)}
                  >
                    <span className="amline-account-menu__arrow">
                      <Icon name="chevronLeft" className="amline-icon amline-icon--sm" />
                    </span>
                    <span className="amline-account-menu__label">{item.label}</span>
                    <span className="amline-account-menu__icon" aria-hidden="true">
                      <Icon name={item.icon} className="amline-icon amline-icon--sm" />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <section className="amline-account-update">
        <button type="button" className="amline-account-update__button" onClick={() => router.push('/account/requests')}>
          تکمیل اطلاعات
        </button>
        <div className="amline-account-update__meta">
          <span>{loading ? 'در حال همگام‌سازی...' : 'پروفایل به‌روز است'}</span>
          <Icon name="sync" className="amline-icon amline-icon--sm" />
        </div>
      </section>

      {!isGuest ? (
        <section className="amline-account-support-box">
          <div>
            <strong>پشتیبانی اختصاصی حساب</strong>
            <p>{detailsQuery.data?.supportHours ?? 'هر روز از ساعت ۹ تا ۲۱'}</p>
            <div className="amline-inline-actions">
              <input
                value={agencyNameDraft}
                onChange={(event) => setAgencyNameDraft(event.target.value)}
                className="amline-account-inline-input"
                placeholder="نام آژانس"
              />
              <button type="button" className="amline-button amline-button--primary" onClick={() => void handleSaveAgency()}>
                ذخیره آژانس
              </button>
            </div>
          </div>
          <div className="amline-inline-actions">
            <a className="amline-button amline-button--ghost" href={`tel:${detailsQuery.data?.supportPhone ?? '+982532048000'}`}>
              تماس مستقیم
            </a>
            <a
              className="amline-button amline-button--secondary"
              href={detailsQuery.data?.whatsapp ?? 'https://wa.me/989127463726'}
              target="_blank"
              rel="noreferrer"
            >
              واتساپ پشتیبانی
            </a>
          </div>
        </section>
      ) : null}

      {!isGuest && prefs.length > 0 ? (
        <section className="amline-account-preferences">
          <h2>تنظیمات اعلان و ارتباط</h2>
          <div className="amline-account-preferences__list">
            {prefs.map((pref) => (
              <article key={pref.key} className="amline-account-preferences__item">
                <span>{pref.label}</span>
                <button
                  type="button"
                  className={`amline-button amline-button--ghost${pref.enabled ? ' amline-nav__link--active' : ''}`}
                  onClick={() => void handleTogglePreference(pref.key, !pref.enabled)}
                >
                  {pref.enabled ? 'فعال' : 'غیرفعال'}
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="amline-account-update amline-account-update--theme">
        <button
          type="button"
          className="amline-account-update__button"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
          تغییر سریع تم
        </button>
        <div className="amline-account-update__meta amline-account-update__meta--theme">
          <span>تنظیمات نمایش</span>
          <div className="amline-theme-option-group">
            <button
              type="button"
              className={`amline-button amline-button--ghost amline-theme-option${theme === 'light' ? ' amline-nav__link--active' : ''}`}
              onClick={() => setTheme('light')}
            >
              روشن
            </button>
            <button
              type="button"
              className={`amline-button amline-button--ghost amline-theme-option${theme === 'dark' ? ' amline-nav__link--active' : ''}`}
              onClick={() => setTheme('dark')}
            >
              تاریک
            </button>
            <button
              type="button"
              className={`amline-button amline-button--ghost amline-theme-option${theme === 'system' ? ' amline-nav__link--active' : ''}`}
              onClick={() => setTheme('system')}
            >
              سیستم
            </button>
          </div>
        </div>
      </section>

      <nav className="amline-contracts-bottom-nav" aria-label="پیمایش اصلی">
        <button type="button" onClick={() => router.push('/account/profile')} className="is-active">
          <Icon name="account" className="amline-icon amline-icon--sm" />
          <span>حساب من</span>
        </button>
        <button type="button" onClick={() => router.push('/contracts')}>
          <Icon name="contracts" className="amline-icon amline-icon--sm" />
          <span>قراردادها</span>
        </button>
        <button type="button" onClick={() => router.push('/chat')}>
          <Icon name="chat" className="amline-icon amline-icon--sm" />
          <span>گفتگو</span>
        </button>
        <button type="button" onClick={() => router.push('/')}>
          <Icon name="home" className="amline-icon amline-icon--sm" />
          <span>خانه</span>
        </button>
      </nav>
    </div>
  );
}
