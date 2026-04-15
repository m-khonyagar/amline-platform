import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function PrivacyPage() {
  return (
    <PageShell title="حریم خصوصی" subtitle="نحوه ذخیره‌سازی، پردازش و استفاده از داده‌های کاربران در پلتفرم.">
      <SectionCard title="سیاست داده">
        <p>اطلاعات تماس، جزئیات فایل‌ها و داده‌های تراکنشی صرفاً برای ارائه خدمات، گزارش‌گیری داخلی و بهبود تجربه کاربری استفاده می‌شود.</p>
      </SectionCard>
    </PageShell>
  );
}
