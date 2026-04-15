import { PageShell } from '../components/Common/PageShell';
import { SectionCard } from '../components/UI/SectionCard';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchJobs } from '../services/api';

export default function CareersPage() {
  const { data, loading, error } = useAsyncData(fetchJobs, []);
  const jobs = data ?? [];

  return (
    <PageShell title="فرصت‌های شغلی" subtitle="تیم Amline برای توسعه‌ی فروش، تکنولوژی و عملیات، موقعیت‌های جدید باز کرده است.">
      <SectionCard title={loading ? 'در حال بارگذاری موقعیت‌ها...' : `${jobs.length} موقعیت باز`}>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {jobs.map((job) => (
            <article key={job.id} style={{ border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>{job.title}</h3>
              <p style={{ margin: '0 0 0.35rem', color: '#475569' }}>مکان: {job.location}</p>
              <p style={{ margin: 0, color: '#475569' }}>نوع همکاری: {job.type}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
