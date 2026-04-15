import { PageShell } from '../../components/Common/PageShell';
import { DataTable } from '../../components/UI/DataTable';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchJobs } from '../../services/api';

export default function AdminJobsPage() {
  const { data, loading, error } = useAsyncData(fetchJobs, []);
  const jobs = data ?? [];

  return (
    <PageShell title="پنل ادمین: استخدام" subtitle="نمایش فرصت‌های شغلی باز، مکان استخدام و نوع قراردادها.">
      <SectionCard title={loading ? 'در حال بارگذاری فرصت‌ها...' : 'مدیریت موقعیت‌های استخدامی'}>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <DataTable columns={['عنوان', 'مکان', 'نوع همکاری']} rows={jobs.map((job) => [job.title, job.location, job.type])} />
      </SectionCard>
    </PageShell>
  );
}
