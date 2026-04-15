import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function LegalComplaintsPage() {
  return (
    <PageShell title="فرآیند قانونی شکایات" subtitle="مسیر حقوقی رسیدگی، ثبت مستندات و زمان‌بندی پاسخ‌دهی به پرونده‌ها.">
      <SectionCard title="روند رسیدگی">
        <ol style={{ lineHeight: 2 }}>
          <li>ثبت شکایت و دریافت کد پیگیری</li>
          <li>بازبینی اولیه توسط تیم حقوقی</li>
          <li>ارتباط با طرفین و جمع‌آوری مستندات</li>
          <li>اعلام نتیجه و مسیر ادامه پیگیری</li>
        </ol>
      </SectionCard>
    </PageShell>
  );
}
