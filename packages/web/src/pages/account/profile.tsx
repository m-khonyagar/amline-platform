import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchProfile } from '../../services/api';

export default function ProfilePage() {
  const { data, loading, error } = useAsyncData(fetchProfile, []);

  return (
    <PageShell title="حساب کاربری: پروفایل" subtitle="نمای کلی از هویت حساب، نوع عضویت و اطلاعات تماس کاربر نهایی.">
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <MetricCard label="نام" value={loading || !data ? '...' : data.fullName} />
        <MetricCard label="عضویت" value={loading || !data ? '...' : data.membership} />
        <MetricCard label="شهر" value={loading || !data ? '...' : data.city} />
      </div>
      <SectionCard title="جزئیات حساب">
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div>موبایل: {data?.mobile ?? '...'}</div>
          <div>نقش: {data?.role ?? '...'}</div>
          <div>شناسه حساب: {data?.id ?? '...'}</div>
        </div>
      </SectionCard>
    </PageShell>
  );
}
