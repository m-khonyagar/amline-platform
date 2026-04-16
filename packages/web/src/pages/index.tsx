import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PageShell } from '../components/Common/PageShell';
import { Icon } from '../components/UI/Icon';
import { MetricCard } from '../components/UI/MetricCard';
import { SectionCard } from '../components/UI/SectionCard';
import {
  fetchProperties,
  type PropertySummary,
} from '../services/api';

type InquiryItem = {
  title: string;
  description: string;
  href: string;
  accentClass: 'teal' | 'amber' | 'green' | 'red';
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
    accentClass: 'teal',
  },
  {
    title: 'استعلام چک',
    description: 'بررسی سریع وضعیت تعهدات پرداخت و سوابق چک.',
    href: '/account/invoices',
    accentClass: 'amber',
  },
  {
    title: 'استعلام سند',
    description: 'مرور اطلاعات ثبتی و تطبیق داده‌های سند با ملک ثبت‌شده.',
    href: '/legal',
    accentClass: 'green',
  },
  {
    title: 'استعلام ملک',
    description: 'بررسی فایل‌های آماده معامله و سابقه وضعیت آن‌ها.',
    href: '/agent/dashboard',
    accentClass: 'red',
  },
];

const valueProps = [
  'کد رهگیری رسمی بعد از تایید کارشناس حقوقی',
  'کمیسیون شفاف مطابق تعرفه قانونی اتحادیه',
  'پشتیبانی حقوقی و داوری حرفه‌ای در اختلافات',
  'انعقاد قرارداد دیجیتال در ۲۴ ساعت شبانه‌روز',
];

const contractSteps = [
  { title: 'تکمیل اطلاعات مالک و مستاجر', desc: 'ثبت اطلاعات شناسنامه‌ای، تماس و احراز هویت پایه.' },
  { title: 'اسکن سند و تکمیل اطلاعات ملک', desc: 'بارگذاری سند، مشخصات ملک و جزئیات فایل.' },
  { title: 'تاریخ و مبلغ قرارداد', desc: 'تعریف بازه زمانی، رهن/اجاره و نحوه پرداخت.' },
  { title: 'امضای دیجیتال طرفین', desc: 'امضای امن با کد پیامکی و ثبت تایید هر طرف.' },
  { title: 'تایید کارشناس و کد رهگیری', desc: 'بازبینی نهایی حقوقی و دریافت کد رهگیری رسمی.' },
];

const faqItems = [
  {
    q: 'قرارداد آنلاین املاین از نظر قانونی معتبر است؟',
    a: 'بله. قراردادها با امضای دیجیتال، تایید مرحله‌ای و آرشیو قابل رهگیری ثبت می‌شوند و برای استعلام، شناسه رسمی پرونده ارائه می‌گردد.',
  },
  {
    q: 'چقدر زمان می‌برد تا قرارداد نهایی شود؟',
    a: 'بیشتر قراردادهای استاندارد در کمتر از یک روز کاری تکمیل می‌شوند؛ وضعیت هر مرحله به صورت لحظه‌ای در داشبورد طرفین نمایش داده می‌شود.',
  },
  {
    q: 'برای شروع چه مدارکی نیاز دارم؟',
    a: 'اطلاعات هویتی طرفین، مشخصات ملک، فایل سند و شرایط مالی قرارداد. سیستم در هر مرحله چک‌لیست هوشمند مدارک را نمایش می‌دهد.',
  },
  {
    q: 'چطور اصالت قرارداد را برای طرف مقابل اثبات کنم؟',
    a: 'با کد رهگیری رسمی و گزارش زمان‌بندی امضاها. هر قرارداد در صفحه استعلام املاین قابل بررسی و اعتبارسنجی است.',
  },
];

const trustAuthorities = [
  'نماد اعتماد الکترونیکی',
  'اتحادیه کشوری کسب‌وکارهای مجازی',
  'همکاری حقوقی با شبکه مشاوران املاک',
  'فرآیند انطباق با مقررات تنظیم‌گری',
];

const personaUseCases = [
  {
    title: 'برای مشاوران املاک',
    desc: 'مدیریت همزمان فایل، قرارداد و پرداخت با SLA عملیاتی و گزارش عملکرد تیم.',
    href: '/agent/dashboard',
  },
  {
    title: 'برای مالک و مستاجر',
    desc: 'ثبت امن مدارک، امضای دیجیتال و پیگیری شفاف وضعیت پرونده بدون رفت‌وآمد.',
    href: '/contracts/new',
  },
  {
    title: 'برای مدیران آژانس',
    desc: 'دید کامل روی قراردادهای فعال، بهره‌وری مشاوران و نرخ تبدیل قیف فروش.',
    href: '/admin',
  },
];

const socialProofStats = [
  { label: 'کاربر فعال ماهانه', value: '42,000+' },
  { label: 'قرارداد پردازش‌شده', value: '185,000+' },
  { label: 'شهر تحت پوشش', value: '32' },
  { label: 'آژانس همکار', value: '1,240+' },
];

const testimonials = [
  {
    quote: 'املاین زمان نهایی‌کردن قراردادهای ما را از چند روز به چند ساعت رساند و خطاهای حقوقی را به شکل محسوسی کاهش داد.',
    author: 'مدیر آژانس مهر مسکن - تهران',
  },
  {
    quote: 'برای اولین بار مسیر قرارداد، پرداخت و استعلام در یک داشبورد واحد جمع شد؛ دقیقاً همان چیزی که تیم عملیات ما نیاز داشت.',
    author: 'مدیر عملیات زنجیره املاک پارس',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % splashSlides.length);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    void fetchProperties()
      .then((propertyItems) => {
        setProperties(propertyItems);
      })
      .catch(() => {
        setProperties([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (copyStatus === 'idle') {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  const slide = splashSlides[activeSlide];

  async function handleCopyDiscount() {
    try {
      const code = 'AML2buhLe6';
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = code;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopyStatus('success');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <PageShell
      title="املاین: زیرساخت قرارداد دیجیتال ملک با اعتبار حقوقی واقعی"
      subtitle="از اولین مذاکره تا کد رهگیری رسمی، املاین جریان معامله را سریع‌تر، امن‌تر و قابل اعتمادتر از روش سنتی می‌کند."
    >
      <div className="amline-home-grid">
        <section className="amline-mobile-splash">
          <div className="amline-mobile-splash__topbar">
            <img src="/assets/amline/logotype.svg" alt="Amline" className="amline-mobile-splash__logo" />
            <button
              type="button"
              className="amline-mobile-splash__support"
              onClick={() => router.push('/support')}
              aria-label="پشتیبانی"
            >
              <Icon name="support" className="amline-icon amline-icon--sm" />
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
            <h3>چرا همین حالا به املاین مهاجرت کنید؟</h3>
            <p>املاین تنها قراردادساز نیست؛ یک هاب عملیاتی کامل برای انطباق حقوقی، پرداخت امن و استعلام رسمی در بازار ملک ایران است.</p>
            <button type="button" className="amline-button amline-button--ghost" onClick={() => router.push('/agent/dashboard')}>
              ورود به مرکز عملیات مشاور
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
                {copyStatus === 'success' ? 'کپی شد' : copyStatus === 'error' ? 'عدم موفقیت' : 'کپی کردن'}
              </button>
            </div>
            <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/contracts/new')}>
              شروع قرارداد دیجیتال
            </button>
          </div>
        </section>
      </div>

      <div className="amline-home-metrics">
        <MetricCard label="فایل‌های در گردش بازار" value={loading ? '...' : String(properties.length)} />
        <MetricCard label="شهرهای فعال پلتفرم" value="12+" />
        <MetricCard label="میانگین پاسخ‌گویی پشتیبانی" value="کمتر از ۳۰ دقیقه" />
      </div>

      <SectionCard title="ارزش‌های کلیدی املاین" actions={<span>چرا املاین متمایز است</span>}>
        <div className="amline-value-grid">
          {valueProps.map((item, index) => (
            <article key={item} className="amline-value-card">
              <span className="amline-value-card__icon">{index + 1}</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="چطور با املاین قرارداد می‌نویسیم؟" actions={<span>روایت مرحله‌به‌مرحله محصول</span>}>
        <div className="amline-contract-timeline">
          {contractSteps.map((item, index) => (
            <article key={item.title} className="amline-contract-timeline__item">
              <span className="amline-contract-timeline__index">{index + 1}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <section className="amline-home-split-proof">
        <div className="amline-home-split-proof__media">
          <img src="/assets/amline/contract-3.jpeg" alt="انطباق حقوقی املاین" />
        </div>
        <div className="amline-home-split-proof__content">
          <h3>زیرساخت حقوقی و انطباق که روی آن حساب می‌کنید</h3>
          <p>از اعتبار امضای دیجیتال تا رهگیری پرونده، همه‌چیز برای کاهش ریسک عملیاتی و افزایش اعتماد طرفین طراحی شده است.</p>
          <div className="amline-trust-badges">
            {trustAuthorities.map((item) => (
              <span key={item} className="amline-trust-badge">
                <Icon name="check" className="amline-icon amline-icon--xs" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="amline-section-gap" />

      <SectionCard title="سناریوهای استفاده" actions={<span>برای هر نقش، یک جریان بهینه</span>}>
        <div className="amline-persona-grid">
          {personaUseCases.map((persona) => (
            <button key={persona.title} type="button" className="amline-persona-card" onClick={() => router.push(persona.href)}>
              <strong>{persona.title}</strong>
              <p>{persona.desc}</p>
              <span className="amline-persona-card__action">
                ورود به مسیر
                <Icon name="chevronLeft" className="amline-icon amline-icon--xs" />
              </span>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="اعتماد بازار به املاین" actions={<span>شاخص‌های پذیرش محصول</span>}>
        <div className="amline-social-proof-grid">
          {socialProofStats.map((item) => (
            <article key={item.label} className="amline-social-proof-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="تجربه مشتریان حرفه‌ای" actions={<span>بازخورد آژانس‌ها و تیم‌های عملیاتی</span>}>
        <div className="amline-testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.author} className="amline-testimonial-card">
              <p>{item.quote}</p>
              <strong>{item.author}</strong>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="استعلام‌ها و سرویس‌های فوری" actions={<span>{inquiryItems.length} میانبر فعال</span>}>
        <div className="amline-inquiry-grid">
          {inquiryItems.map((item) => (
            <button
              key={item.title}
              type="button"
              className={`amline-inquiry-card amline-inquiry-card--${item.accentClass}`}
              onClick={() => router.push(item.href)}
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

      <div className="amline-section-gap" />

      <SectionCard title="سوالات متداول" actions={<span>راهنمای سریع تصمیم‌گیری</span>}>
        <div className="amline-faq-list">
          {faqItems.map((item, index) => (
            <article key={item.q} className={`amline-faq-item${openFaq === index ? ' is-open' : ''}`}>
              <button type="button" className="amline-faq-item__trigger" onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <strong>{item.q}</strong>
                <Icon name={openFaq === index ? 'chevronDown' : 'chevronLeft'} className="amline-icon amline-icon--xs" />
              </button>
              <div className="amline-faq-item__content">
                <p>{item.a}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <section className="amline-final-cta">
        <div>
          <h3>آماده‌اید قرارداد بعدی را با اعتماد کامل ببندید؟</h3>
          <p>همین حالا فرآیند دیجیتال املاین را شروع کنید و تجربه‌ای سریع، امن و قابل رهگیری داشته باشید.</p>
        </div>
        <div className="amline-inline-actions">
          <a className="amline-button amline-button--primary" href="/contracts/new" aria-label="شروع قرارداد">
            شروع قرارداد دیجیتال
          </a>
          <a className="amline-button amline-button--ghost" href="/legal" aria-label="مشاهده مقررات">
            مشاهده چارچوب حقوقی
          </a>
        </div>
      </section>
    </PageShell>
  );
}
