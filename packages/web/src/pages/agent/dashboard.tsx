import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAchievements, fetchPayments, fetchProperties } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const quickActions = [
  { label: 'شروع قرارداد جدید', href: '/contracts/new', tone: 'primary' },
  { label: 'پیگیری مشتری', href: '/support/complaints', tone: 'ghost' },
  { label: 'صدور پیش‌فاکتور', href: '/account/invoices', tone: 'ghost' },
  { label: 'مدیریت مجوزها', href: '/admin/licenses', tone: 'ghost' },
];

const inquiryShortcuts = [
  { title: 'استعلام قرارداد', href: '/contracts/new' },
  { title: 'استعلام چک', href: '/account/payment-history' },
  { title: 'استعلام سند', href: '/legal' },
  { title: 'استعلام ملک', href: '/' },
];

export default function AgentDashboardPage() {
  const router = useRouter();
  const properties = useAsyncData(fetchProperties, []);
  const payments = useAsyncData(fetchPayments, []);
  const achievements = useAsyncData(fetchAchievements, []);

  const featuredProperties = properties.data ?? [];
  const latestPayments = payments.data ?? [];
  const totalVolume = latestPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <PageShell title="پنل ملک و عملیات مشاور" subtitle="این نما بر اساس فایل جدید پنل ملک بازآرایی شده تا قراردادهای در جریان، میانبرهای استعلام و عملیات روزانه مشاور در یک صفحه قابل استفاده باشند.">
      <div className="amline-home-metrics">
        <MetricCard label="فایل‌های در جریان" value={String(featuredProperties.length)} />
        <MetricCard label="پرداخت‌های امروز" value={String(latestPayments.length)} />
        <MetricCard label="حجم کمیسیون" value={formatPrice(totalVolume)} />
        <MetricCard label="افتخارات فعال" value={String(achievements.data?.length ?? 0)} />
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

      <div style={{ height: '1rem' }} />

      <SectionCard title="قراردادها و فایل‌های در جریان" actions={<span>{properties.loading ? 'در حال بارگذاری...' : `${featuredProperties.length} فایل`}</span>}>
        {properties.error ? <p style={{ color: '#b91c1c' }}>{properties.error}</p> : null}
        <div className="amline-contract-list">
          {featuredProperties.map((property, index) => (
            <button key={property.id} type="button" className="amline-contract-list__item" onClick={() => router.push('/contracts/new')}>
              <div>
                <strong>{property.title}</strong>
                <p>{property.city} • {property.status}</p>
              </div>
              <span className="amline-contract-list__badge">مرحله {Math.min(index + 3, 7)} از ۷</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <div style={{ height: '1rem' }} />

      <div className="amline-panel-grid">
        <SectionCard title="بنرهای تبدیل">
          <div className="amline-panel-banners">
            <button type="button" className="amline-home-promo amline-home-promo--compact" onClick={() => router.push('/contracts/new')}>
              <div className="amline-home-promo__media">
                <img src="/assets/amline/contract-3.jpeg" alt="کد رهگیری املاین" />
              </div>
              <div className="amline-home-promo__body">
                <h3>برای همه قراردادها کد رهگیری بگیر</h3>
                <p>شروع مستقیم فرایند انعقاد قرارداد از پنل مشاور.</p>
              </div>
            </button>

            <button type="button" className="amline-home-discount amline-home-discount--compact" onClick={() => router.push('/contracts/new')}>
              <div className="amline-home-discount__visual">
                <img src="/assets/amline/contract-5.jpeg" alt="تخفیف قرارداد" />
              </div>
              <div className="amline-home-discount__body">
                <h3>با تخفیف املاین قرارداد ببند</h3>
                <div className="amline-home-discount__coupon">
                  <span>AML2buhLe6</span>
                  <span>فعال</span>
                </div>
              </div>
            </button>
          </div>
        </SectionCard>

        <SectionCard title="آخرین پرداخت‌ها">
          <div className="amline-payment-feed">
            {latestPayments.map((payment) => (
              <div key={payment.id} className="amline-payment-feed__item">
                <div>
                  <strong>{payment.gateway}</strong>
                  <p>{payment.propertyId}</p>
                </div>
                <div className="amline-payment-feed__meta">
                  <strong>{formatPrice(payment.amount)}</strong>
                  <span>{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
