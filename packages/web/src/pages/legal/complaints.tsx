import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function LegalComplaintsPage() {
  return (
    <PageShell title="فرآیند قانونی شکایات" subtitle="مسیر حقوقی رسیدگی، ثبت مستندات و زمان‌بندی پاسخ‌دهی به پرونده‌ها.">
      <SectionCard title="روند رسیدگی">
        <ol className="amline-legal-list">
          <li>ثبت شکایت و دریافت کد پیگیری</li>
          <li>بازبینی اولیه توسط تیم حقوقی</li>
          <li>ارتباط با طرفین و جمع‌آوری مستندات</li>
          <li>اعلام نتیجه و مسیر ادامه پیگیری</li>
        </ol>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="تعهدات تیم رسیدگی">
        <ul className="amline-legal-list">
          <li>حفظ بی‌طرفی در بررسی پرونده‌های اختلافی.</li>
          <li>پاسخ‌گویی مرحله‌ای با وضعیت قابل پیگیری برای کاربر.</li>
          <li>ارجاع پرونده‌های پیچیده به کارشناس ارشد حقوقی.</li>
        </ul>
      </SectionCard>
    </PageShell>
  );
}
