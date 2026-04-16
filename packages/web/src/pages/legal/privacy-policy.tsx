import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function PrivacyPage() {
  return (
    <PageShell title="حریم خصوصی" subtitle="نحوه ذخیره‌سازی، پردازش و استفاده از داده‌های کاربران در پلتفرم.">
      <SectionCard title="سیاست داده">
        <ul className="amline-legal-list">
          <li>اطلاعات تماس، داده‌های پرونده و سوابق تراکنش فقط برای ارائه خدمات قرارداد و پشتیبانی استفاده می‌شود.</li>
          <li>اشتراک داده با اشخاص ثالث خارج از الزامات قانونی یا رضایت کاربر انجام نمی‌شود.</li>
          <li>لاگ فعالیت برای امنیت حساب، کنترل تقلب و بهبود کیفیت سرویس نگه‌داری می‌شود.</li>
          <li>کاربر می‌تواند از طریق پشتیبانی درخواست اصلاح اطلاعات هویتی خود را ثبت کند.</li>
        </ul>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="امنیت و نگه‌داری اطلاعات">
        <ul className="amline-legal-list">
          <li>مسیرهای حساس با کنترل دسترسی و ثبت رویداد عملیاتی محافظت می‌شوند.</li>
          <li>دسترسی به اطلاعات کاربر برای تیم‌ها بر اساس نقش و نیاز عملیاتی محدود است.</li>
          <li>ارتباطات پشتیبانی و اسناد پرونده صرفا در چارچوب حل مسئله و پیگیری قانونی بررسی می‌شود.</li>
        </ul>
      </SectionCard>
    </PageShell>
  );
}
