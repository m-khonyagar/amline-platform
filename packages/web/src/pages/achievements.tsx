import { PageShell } from '../components/Common/PageShell';
import { DataTable } from '../components/UI/DataTable';
import { Icon } from '../components/UI/Icon';
import { MetricCard } from '../components/UI/MetricCard';
import { SectionCard } from '../components/UI/SectionCard';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchAchievements } from '../services/api';

export default function AchievementsPage() {
  const { data, loading, error } = useAsyncData(fetchAchievements, []);
  const achievements = data ?? [];

  return (
    <PageShell title="درباره املاین و اعتبار پلتفرم" subtitle="املاین برای ساده‌سازی و هوشمندسازی معاملات ملکی ایجاد شده تا تنظیم قرارداد، امضا، کد رهگیری و پشتیبانی حقوقی در یک مسیر امن انجام شود.">
      <div className="amline-metric-strip">
        <MetricCard label="تعداد رتبه‌بندی فعال" value={loading ? '...' : String(achievements.length)} />
        <MetricCard label="بالاترین امتیاز ماه" value={achievements[0] ? String(achievements[0].points) : '-'} />
      </div>

      <SectionCard title="چرا املاین قابل اعتماد است؟">
        <ul className="amline-legal-list">
          <li>قراردادها پس از بررسی حقوقی و فرآیند امضای دیجیتال، قابل رهگیری هستند.</li>
          <li>کمیسیون به‌صورت شفاف و مطابق تعرفه قانونی نمایش داده می‌شود.</li>
          <li>در صورت بروز اختلاف، مسیر ثبت شکایت و رسیدگی حقوقی فعال است.</li>
          <li>پشتیبانی تلفنی و ثبت تیکت برای پیگیری پرونده‌ها در دسترس است.</li>
        </ul>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="مجوزها و نهادهای مرجع">
        <div className="amline-mini-list">
          {[
            'نماد اعتماد الکترونیک',
            'اتحادیه کشوری کسب‌وکارهای مجازی',
            'اتحادیه صنف مشاورین املاک',
            'سازمان نظام صنفی رایانه‌ای کشور',
          ].map((item) => (
            <div key={item} className="amline-mini-list__item">
              <div>
                <strong>{item}</strong>
                <span>اعتبارسنجی و انطباق قانونی</span>
              </div>
              <span><Icon name="check" className="amline-icon amline-icon--xs" /></span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="جدول افتخارات">
        {error ? <p className="amline-form-feedback amline-form-feedback--error">{error}</p> : null}
        <DataTable
          columns={['کاربر', 'عنوان', 'امتیاز']}
          rows={achievements.map((item) => [item.userId, item.title, item.points.toLocaleString('fa-IR')])}
        />
      </SectionCard>
    </PageShell>
  );
}
