import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function SupportComplaintsPage() {
  return (
    <PageShell title="مرکز رسیدگی به شکایات" subtitle="ثبت، پیگیری و طبقه‌بندی شکایات مشتریان، مشاوران و مالکان.">
      <SectionCard title="ثبت شکایت جدید">
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <input placeholder="موضوع شکایت" />
          <textarea placeholder="شرح موضوع" rows={6} />
          <button style={{ width: 'fit-content' }}>ارسال برای بررسی</button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
