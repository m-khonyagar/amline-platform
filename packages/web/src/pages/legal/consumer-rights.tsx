import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function ConsumerRightsPage() {
  return (
    <PageShell title="حقوق مصرف‌کننده" subtitle="تعهدات پلتفرم نسبت به شفافیت قیمت، صحت اطلاعات و پشتیبانی پس از ثبت درخواست.">
      <SectionCard title="تعهدات اصلی">
        <ul className="amline-legal-list">
          <li>نمایش شفاف قیمت و وضعیت فایل</li>
          <li>امکان ثبت اعتراض و بازبینی</li>
          <li>حفظ محرمانگی اطلاعات شخصی</li>
          <li>امکان دریافت نسخه قرارداد و پیگیری اصالت</li>
          <li>دسترسی به پشتیبانی برای حل اختلافات احتمالی</li>
        </ul>
      </SectionCard>
    </PageShell>
  );
}
