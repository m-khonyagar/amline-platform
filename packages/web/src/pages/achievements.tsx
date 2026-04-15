import { PageShell } from '../components/Common/PageShell';
import { DataTable } from '../components/UI/DataTable';
import { MetricCard } from '../components/UI/MetricCard';
import { SectionCard } from '../components/UI/SectionCard';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchAchievements } from '../services/api';

export default function AchievementsPage() {
  const { data, loading, error } = useAsyncData(fetchAchievements, []);
  const achievements = data ?? [];

  return (
    <PageShell title="افتخارات و رتبه‌بندی" subtitle="نمایش عملکرد مشاوران، امتیازهای ماهانه و شاخص‌های رشد شبکه فروش.">
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <MetricCard label="تعداد رتبه‌بندی" value={loading ? '...' : String(achievements.length)} />
        <MetricCard label="بالاترین امتیاز" value={achievements[0] ? String(achievements[0].points) : '-'} />
      </div>
      <SectionCard title="جدول افتخارات">
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <DataTable
          columns={['کاربر', 'عنوان', 'امتیاز']}
          rows={achievements.map((item) => [item.userId, item.title, item.points.toLocaleString('fa-IR')])}
        />
      </SectionCard>
    </PageShell>
  );
}
