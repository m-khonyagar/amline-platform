import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAchievements, fetchPayments, fetchProperties } from '../../services/api';

export default function AgentDashboardPage() {
  const router = useRouter();
  const properties = useAsyncData(fetchProperties, []);
  const payments = useAsyncData(fetchPayments, []);
  const achievements = useAsyncData(fetchAchievements, []);

  const actionButtonStyle = {
    borderRadius: '14px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    padding: '0.8rem 1rem',
    cursor: 'pointer',
    textAlign: 'right' as const,
  };

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
              <button
                key={property.id}
                onClick={() => router.push('/')}
                style={{ ...actionButtonStyle, padding: '0.85rem', borderRadius: '16px' }}
              >
                {property.title} - {property.city}
              </button>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="اقدام‌های سریع">
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <button onClick={() => router.push('/')} style={actionButtonStyle}>ثبت فایل جدید</button>
            <button onClick={() => router.push('/support/complaints')} style={actionButtonStyle}>پیگیری مشتری</button>
            <button onClick={() => router.push('/account/invoices')} style={actionButtonStyle}>صدور پیش‌فاکتور</button>
          </div>
        </SectionCard>
      </div>
    </PageShell>
  );
}
