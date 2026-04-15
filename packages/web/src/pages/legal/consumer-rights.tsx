import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function ConsumerRightsPage() {
  return (
    <PageShell title="حقوق مصرف‌کننده" subtitle="تعهدات پلتفرم نسبت به شفافیت قیمت، صحت اطلاعات و پشتیبانی پس از ثبت درخواست.">
      <SectionCard title="تعهدات اصلی">
        <ul style={{ lineHeight: 2 }}>
          <li>نمایش شفاف قیمت و وضعیت فایل</li>
          <li>امکان ثبت اعتراض و بازبینی</li>
          <li>حفظ محرمانگی اطلاعات شخصی</li>
        </ul>
      </SectionCard>
    </PageShell>
  );
}
