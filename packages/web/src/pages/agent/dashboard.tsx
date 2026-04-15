import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAchievements, fetchPayments, fetchProperties } from '../../services/api';

export default function AgentDashboardPage() {
  const properties = useAsyncData(fetchProperties, []);
  const payments = useAsyncData(fetchPayments, []);
  const achievements = useAsyncData(fetchAchievements, []);

  return (
    <PageShell title="داشبورد مشاور" subtitle="نمای یکپارچه‌ی فایل‌های فعال، پرداخت‌ها و جایگاه عملکردی مشاور در پلتفرم.">
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <MetricCard label="فایل‌های فعال" value={String(properties.data?.length ?? 0)} />
        <MetricCard label="پرداخت‌ها" value={String(payments.data?.length ?? 0)} />
        <MetricCard label="افتخارات" value={String(achievements.data?.length ?? 0)} />
      </div>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '2fr 1fr' }}>
        <SectionCard title="فایل‌های امروز">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {(properties.data ?? []).map((property) => (
              <div key={property.id} style={{ padding: '0.85rem', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
                {property.title} - {property.city}
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="اقدام‌های سریع">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button>ثبت فایل جدید</button>
            <button>پیگیری مشتری</button>
            <button>صدور پیش‌فاکتور</button>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
