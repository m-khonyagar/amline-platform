import { PageShell } from '../../components/Common/PageShell';
import { DataTable } from '../../components/UI/DataTable';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAchievements } from '../../services/api';

export default function AdminAchievementsPage() {
  const { data, loading, error } = useAsyncData(fetchAchievements, []);
  const rows = data ?? [];

  return (
    <PageShell title="پنل ادمین: افتخارات" subtitle="مدیریت leaderboard، انگیزش فروش و تخصیص نشان‌های عملکردی.">
      <SectionCard title={loading ? 'در حال بارگذاری...' : 'فهرست رتبه‌ها'}>
        {error ? <p className="amline-form-feedback amline-form-feedback--error">{error}</p> : null}
        <DataTable columns={['کاربر', 'نشان', 'امتیاز']} rows={rows.map((item) => [item.userId, item.title, item.points])} />
      </SectionCard>
    </PageShell>
  );
}
