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
        {error ? <p className="amline-form-feedback amline-form-feedback--error">{error}</p> : null}
        <div className="amline-career-list">
          {jobs.map((job) => (
            <article key={job.id} className="amline-career-card">
              <h3>{job.title}</h3>
              <p>مکان: {job.location}</p>
              <p>نوع همکاری: {job.type}</p>
            </article>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
