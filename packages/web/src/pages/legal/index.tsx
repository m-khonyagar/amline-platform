import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function LegalIndexPage() {
  return (
    <PageShell title="مرکز اسناد قانونی" subtitle="دسترسی سریع به سیاست‌ها، شرایط استفاده، حقوق مصرف‌کننده و فرآیند شکایات.">
      <SectionCard title="سرفصل‌ها">
        <ul style={{ lineHeight: 2 }}>
          <li>شرایط استفاده از خدمات</li>
          <li>حریم خصوصی</li>
          <li>حقوق مصرف‌کننده</li>
          <li>فرآیند رسیدگی به شکایات</li>
        </ul>
      </SectionCard>
    </PageShell>
  );
}
