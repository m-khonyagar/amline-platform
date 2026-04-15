import { PageShell } from '../../components/Common/PageShell';
import { DataTable } from '../../components/UI/DataTable';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchLicenses } from '../../services/api';

export default function AdminLicensesPage() {
  const { data, loading, error } = useAsyncData(fetchLicenses, []);
  const licenses = data ?? [];

  return (
    <PageShell title="پنل ادمین: مجوزها" subtitle="رهگیری مجوزهای قانونی، تاریخ انقضا و وضعیت انطباق کسب‌وکار.">
      <SectionCard title={loading ? 'در حال بارگذاری مجوزها...' : `تعداد مجوزها: ${licenses.length}`}>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <DataTable
          columns={['مرجع صادرکننده', 'وضعیت', 'انقضا']}
          rows={licenses.map((license) => [license.authority, license.status, license.expiresAt])}
        />
      </SectionCard>
    </PageShell>
  );
}
