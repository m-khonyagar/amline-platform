import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAchievements, fetchFunnelMetrics, fetchPayments, fetchProperties } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import { buildOperationsFunnel } from '../../utils/funnel';

const quickActions = [
  { label: 'شروع قرارداد جدید', href: '/contracts/new', tone: 'primary' },
  { label: 'پیگیری مشتری و شکایات', href: '/support', tone: 'ghost' },
  { label: 'مدیریت پرداخت و تسویه', href: '/account/payment-history', tone: 'ghost' },
  { label: 'انطباق و مجوزها', href: '/admin/licenses', tone: 'ghost' },
];

const inquiryShortcuts = [
  { title: 'استعلام قرارداد', href: '/contracts/new' },
  { title: 'استعلام چک', href: '/account/payment-history' },
  { title: 'استعلام سند', href: '/legal' },
  { title: 'استعلام ملک', href: '/' },
];

const paymentStatusLabel: Record<string, string> = {
  paid: 'پرداخت موفق',
  pending: 'در انتظار پرداخت',
  failed: 'ناموفق',
};
const paymentStatusTone: Record<string, 'success' | 'warning' | 'danger'> = {
  paid: 'success',
  pending: 'warning',
  failed: 'danger',
};

const listingStatusLabel: Record<string, string> = {
  published: 'منتشر شده',
  pending: 'در انتظار تایید',
};

export default function AgentDashboardPage() {
  const router = useRouter();
  const properties = useAsyncData(fetchProperties, []);
  const payments = useAsyncData(fetchPayments, []);
  const achievements = useAsyncData(fetchAchievements, []);
  const funnelMetrics = useAsyncData(() => fetchFunnelMetrics('operations'), []);

  const featuredProperties = properties.data ?? [];
  const latestPayments = payments.data ?? [];
  const totalVolume = latestPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completionRate = featuredProperties.length > 0 ? Math.min(100, Math.round((latestPayments.length / featuredProperties.length) * 100)) : 0;
  const fallbackFunnel = buildOperationsFunnel(featuredProperties, latestPayments);
  const funnelSteps = (funnelMetrics.data ?? []).length > 0
    ? (funnelMetrics.data ?? []).map((step, index, arr) => {
      const previous = index === 0 ? step.value : arr[index - 1]?.value ?? step.value;
      const rateFromPrevious = previous > 0 ? Math.round((step.value / previous) * 100) : 0;
      return { ...step, rateFromPrevious };
    })
    : fallbackFunnel;

  return (
    <PageShell title="مرکز عملیات مشاور و تیم فروش" subtitle="این داشبورد برای مدیریت چرخه کامل معامله طراحی شده است: جذب فایل، پیشبرد قرارداد، پیگیری پرداخت و رسیدگی به موارد پشتیبانی.">
      <div className="amline-home-metrics">
        <MetricCard label="فایل‌های در جریان" value={String(featuredProperties.length)} />
        <MetricCard label="تراکنش‌های ثبت‌شده" value={String(latestPayments.length)} />
        <MetricCard label="حجم عملیات مالی" value={formatPrice(totalVolume)} />
        <MetricCard label="نرخ تکمیل فرایند" value={`${completionRate}%`} />
      </div>

      <div className="amline-panel-grid">
        <SectionCard title="ورود سریع به عملیات">
          <div className="amline-panel-actions">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className={`amline-panel-action${action.tone === 'primary' ? ' amline-panel-action--primary' : ''}`}
                onClick={() => router.push(action.href)}
              >
                <strong>{action.label}</strong>
                <span>ادامه</span>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="میانبرهای استعلام">
          <div className="amline-panel-shortcuts">
            {inquiryShortcuts.map((item, index) => (
              <button key={item.title} type="button" className="amline-panel-shortcut" onClick={() => router.push(item.href)}>
                <span className="amline-panel-shortcut__index">{index + 1}</span>
                <strong>{item.title}</strong>
              </button>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="amline-section-gap" />

      <SectionCard title="سلامت قیف عملیات" actions={<span>پایش لحظه‌ای بازده مسیر فروش</span>}>
        <div className="amline-funnel-grid">
          {funnelSteps.map((step, index) => (
            <article key={step.key} className="amline-funnel-step">
              <span className="amline-funnel-step__index">{index + 1}</span>
              <strong>{step.label}</strong>
              <span className="amline-funnel-step__value">{step.value.toLocaleString('fa-IR')}</span>
              <small>نرخ عبور: {step.rateFromPrevious}%</small>
            </article>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="قراردادها و فایل‌های در جریان" actions={<span>{properties.loading ? 'در حال بارگذاری...' : `${featuredProperties.length} پرونده`}</span>}>
        {properties.error ? <p className="amline-form-feedback amline-form-feedback--error">{properties.error}</p> : null}
        <div className="amline-contract-list">
          {featuredProperties.map((property, index) => (
            <button key={property.id} type="button" className="amline-contract-list__item" onClick={() => router.push('/contracts/new')}>
              <div>
                <strong>{property.title}</strong>
                <p>
                  {property.city} • {listingStatusLabel[property.status] ?? property.status}
                </p>
              </div>
              <span className="amline-contract-list__badge">مرحله {Math.min(index + 3, 7)} از ۷</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <div className="amline-panel-grid">
        <SectionCard title="فرصت‌های رشد و تبدیل">
          <div className="amline-panel-banners">
            <button type="button" className="amline-home-promo amline-home-promo--compact" onClick={() => router.push('/contracts/new')}>
              <div className="amline-home-promo__media">
                <img src="/assets/amline/contract-3.jpeg" alt="کد رهگیری املاین" />
              </div>
              <div className="amline-home-promo__body">
                <h3>سرعت بستن قرارداد را بالا ببر</h3>
                <p>با شروع سریع قرارداد، زمان تبدیل مشتری بالقوه به معامله نهایی را کوتاه کنید.</p>
              </div>
            </button>

            <button type="button" className="amline-home-discount amline-home-discount--compact" onClick={() => router.push('/contracts/new')}>
              <div className="amline-home-discount__visual">
                <img src="/assets/amline/contract-5.jpeg" alt="تخفیف قرارداد" />
              </div>
              <div className="amline-home-discount__body">
                <h3>مشوق فروش فعال</h3>
                <div className="amline-home-discount__coupon">
                  <span>AML2buhLe6</span>
                  <span>قابل استفاده</span>
                </div>
              </div>
            </button>
          </div>
        </SectionCard>

        <SectionCard title="آخرین رخدادهای مالی">
          <div className="amline-payment-feed">
            {latestPayments.map((payment) => (
              <div key={payment.id} className="amline-payment-feed__item">
                <div>
                  <strong>{payment.gateway}</strong>
                  <p>{payment.propertyId}</p>
                </div>
                <div className="amline-payment-feed__meta">
                  <strong>{formatPrice(payment.amount)}</strong>
                  <span className={`amline-status-chip amline-status-chip--${paymentStatusTone[payment.status] ?? 'warning'}`}>
                    {paymentStatusLabel[payment.status] ?? payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
