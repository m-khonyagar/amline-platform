import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { PageShell } from '../components/Common/PageShell';
import { PropertyCard } from '../components/Properties/PropertyCard';
import { MetricCard } from '../components/UI/MetricCard';
import { SectionCard } from '../components/UI/SectionCard';
import { fetchProperties, type PropertySummary } from '../services/api';

type InquiryItem = {
  title: string;
  description: string;
  href: string;
  accent: string;
};

const splashSlides = [
  {
    title: 'امن و آنلاین قرارداد ببندیم',
    description: 'بستر یکپارچه املاین برای جست‌وجوی ملک، تنظیم قرارداد و پیگیری تمام مراحل معامله در یک مسیر شفاف و امن.',
    image: '/assets/amline/homeBanner.png',
  },
  {
    title: 'تنظیم قرارداد به صورت آنلاین',
    description: 'امضای الکترونیک، گردش مرحله‌ای قرارداد و گزارش لحظه‌ای برای مالک، مستاجر و مشاور بدون رفت‌وآمد اضافه.',
    image: '/assets/amline/contract-1.jpeg',
  },
  {
    title: 'حق کمیسیون قانونی اتحادیه',
    description: 'محاسبه شفاف کمیسیون، تخفیف املاین و کد رهگیری آنلاین در یک فرایند استاندارد و قابل پیگیری.',
    image: '/assets/amline/contract-4.jpeg',
  },
];

const inquiryItems: InquiryItem[] = [
  {
    title: 'استعلام قرارداد',
    description: 'پیگیری وضعیت قرارداد، کد رهگیری و امضاهای ثبت‌شده.',
    href: '/contracts/new',
    accent: 'var(--amline-teal)',
  },
  {
    title: 'استعلام چک',
    description: 'بررسی سریع وضعیت تعهدات پرداخت و سوابق چک.',
    href: '/account/invoices',
    accent: '#f59e0b',
  },
  {
    title: 'استعلام سند',
    description: 'مرور اطلاعات ثبتی و تطبیق داده‌های سند با ملک ثبت‌شده.',
    href: '/legal',
    accent: '#0f766e',
  },
  {
    title: 'استعلام ملک',
    description: 'بررسی فایل‌های آماده معامله و سابقه وضعیت آن‌ها.',
    href: '/agent/dashboard',
    accent: '#ef4444',
  },
];

const supportLinks = [
  { title: 'خدمات مشتریان', href: '/support/complaints' },
  { title: 'راهنمای املاین', href: '/legal' },
  { title: 'درباره املاین', href: '/achievements' },
];

const valueProps = [
  'ارزان و به‌صرفه',
  'دارای مجوز اتحادیه املاک',
  'کد رهگیری آنلاین',
  'دسترسی ۲۴ ساعته',
];

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % splashSlides.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    void fetchProperties()
      .then((items) => setProperties(items))
      .catch((fetchError: unknown) => {
        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load properties.';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const featuredProperties = useMemo(() => properties.slice(0, 3), [properties]);
  const slide = splashSlides[activeSlide];

  async function handleCopyDiscount() {
    try {
      await navigator.clipboard.writeText('AML2buhLe6');
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <PageShell
      title="پنل ملک، قرارداد و خدمات آنلاین املاین"
      subtitle="خروجی این صفحه بر اساس فایل فیگمای جدید بازطراحی شده و حالا جست‌وجوی ملک، استعلام‌ها، پروموشن قرارداد و مسیر ورود به پنل را در یک نمای یکپارچه نشان می‌دهد."
    >
      <div className="amline-home-grid">
        <section className="amline-mobile-splash">
          <div className="amline-mobile-splash__topbar">
            <img src="/assets/amline/logotype.svg" alt="Amline" className="amline-mobile-splash__logo" />
            <button
              type="button"
              className="amline-mobile-splash__support"
              onClick={() => router.push('/support/complaints')}
              aria-label="پشتیبانی"
            >
              ؟
            </button>
          </div>

          <div className="amline-mobile-splash__hero">
            <div className="amline-mobile-splash__copy">
              <span className="amline-mobile-splash__eyebrow">اسلاید {activeSlide + 1} از {splashSlides.length}</span>
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
            </div>
            <div className="amline-mobile-splash__image">
              <img src={slide.image} alt={slide.title} />
            </div>
          </div>

          <div className="amline-mobile-splash__dots" role="tablist" aria-label="اسلایدهای معرفی">
            {splashSlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                className={`amline-mobile-splash__dot${index === activeSlide ? ' is-active' : ''}`}
                onClick={() => setActiveSlide(index)}
                aria-label={item.title}
              />
            ))}
          </div>
        </section>

        <section className="amline-home-promo">
          <div className="amline-home-promo__media">
            <img src="/assets/amline/contract-2.jpeg" alt="پنل مشاور املاین" />
          </div>
          <div className="amline-home-promo__body">
            <h3>با املاین برای همه قراردادهایت کد رهگیری بگیر</h3>
            <p>ورود سریع به پنل مشاور، پیگیری قراردادهای فعال و حرکت مستقیم به جریان انعقاد قرارداد.</p>
            <button type="button" className="amline-button amline-button--ghost" onClick={() => router.push('/agent/dashboard')}>
              ورود به پنل مشاور املاک
            </button>
          </div>
        </section>

        <section className="amline-home-discount">
          <div className="amline-home-discount__visual">
            <img src="/assets/amline/contract-5.jpeg" alt="کد تخفیف املاین" />
          </div>
          <div className="amline-home-discount__body">
            <h3>امروز با ۲۹۰ هزارتومان و کد رهگیری رایگان قرارداد ببند</h3>
            <div className="amline-home-discount__coupon">
              <span>AML2buhLe6</span>
              <button type="button" onClick={handleCopyDiscount}>
                {copied ? 'کپی شد' : 'کپی کردن'}
              </button>
            </div>
            <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/contracts/new')}>
              شروع قرارداد
            </button>
          </div>
        </section>
      </div>

      <div className="amline-home-metrics">
        <MetricCard label="فایل‌های فعال" value={loading ? '...' : String(properties.length)} />
        <MetricCard label="شهرهای پوشش‌داده‌شده" value="12+" />
        <MetricCard label="پاسخ‌گویی پشتیبانی" value="کمتر از ۳۰ دقیقه" />
      </div>

      <SectionCard title="استعلام‌ها و سرویس‌های فوری" actions={<span>{inquiryItems.length} میانبر فعال</span>}>
        <div className="amline-inquiry-grid">
          {inquiryItems.map((item) => (
            <button
              key={item.title}
              type="button"
              className="amline-inquiry-card"
              onClick={() => router.push(item.href)}
              style={{ ['--amline-inquiry-accent' as string]: item.accent }}
            >
              <span className="amline-inquiry-card__icon" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      <div style={{ height: '1rem' }} />

      <SectionCard title="پیشنهادهای منتخب بازار" actions={loading ? <span>در حال بارگذاری...</span> : <span>{featuredProperties.length} فایل پیشنهادی</span>}>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <div className="amline-home-property-grid">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </SectionCard>

      <div style={{ height: '1rem' }} />

      <div className="amline-home-bottom-grid">
        <SectionCard title="خدمات مشتریان">
          <div className="amline-support-links">
            {supportLinks.map((item) => (
              <button key={item.title} type="button" className="amline-support-link" onClick={() => router.push(item.href)}>
                <span>{item.title}</span>
                <span aria-hidden="true">⌄</span>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="چرا املاین؟">
          <div className="amline-value-grid">
            {valueProps.map((item, index) => (
              <div key={item} className="amline-value-card">
                <span className="amline-value-card__icon">{index + 1}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
