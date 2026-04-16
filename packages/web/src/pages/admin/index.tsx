import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { MetricCard } from '../../components/UI/MetricCard';
import { SectionCard } from '../../components/UI/SectionCard';

const modules = [
  { title: 'مدیریت قراردادها', description: 'لیست، فیلتر، تایم‌لاین، مدارک و اکشن‌های مدیریتی قرارداد.', href: '/admin/contracts/ct-1001' },
  { title: 'صف بررسی', description: 'اولویت‌بندی، تخصیص کارشناس، ارجاع سطحی و کنترل SLA.', href: '/admin/review-queue' },
  { title: 'مدیریت کاربران و آژانس', description: 'کنترل نقش‌ها، وضعیت احراز هویت و عملکرد تیمی.', href: '/account/profile' },
  { title: 'مدیریت مالی و تسویه', description: 'پایش تراکنش، Ledger، بازگشت وجه و تسویه کمیسیون.', href: '/account/payment-history' },
  { title: 'میز تقلب', description: 'پایش ریسک، بررسی موارد مشکوک و تصمیم تایید/مانیتور/مسدود.', href: '/admin/fraud-desk' },
  { title: 'گزارش و KPI', description: 'داشبوردهای تحلیلی، نرخ تبدیل قیف و وضعیت سلامت عملیات.', href: '/admin/reports-kpi' },
];

export default function AdminHomePage() {
  const router = useRouter();

  return (
    <PageShell
      title="پنل ادمین املاین (Enterprise v5)"
      subtitle="این صفحه طبق سند Enterprise Master بازطراحی شده تا ماژول‌های عملیاتی، مالی، بررسی، تقلب و گزارش در یک دید مدیریتی یکپارچه در دسترس باشند."
    >
      <div className="amline-home-metrics">
        <MetricCard label="SLA بررسی" value="96%" />
        <MetricCard label="پرونده‌های در صف" value="28" />
        <MetricCard label="نرخ موفقیت رهگیری" value="98.4%" />
        <MetricCard label="موارد Fraud باز" value="6" />
      </div>

      <SectionCard title="ماژول‌های کلیدی پنل ادمین" actions={<span>بر اساس نقشه محصول نسخه ۵</span>}>
        <div className="amline-panel-actions">
          {modules.map((module) => (
            <button
              key={module.title}
              type="button"
              className="amline-panel-action"
              onClick={() => router.push(module.href)}
            >
              <strong>{module.title}</strong>
              <span>{module.description}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="چرخه کامل قرارداد در عملیات ادمین">
        <div className="amline-funnel-grid">
          {[
            'Draft / InProgress',
            'Waiting Counterparty / Signatures',
            'Waiting Payment / Partial',
            'Under Review / Escalated',
            'Approved / Tracking',
            'Completed / Ended / Voided',
          ].map((step, index) => (
            <article key={step} className="amline-funnel-step">
              <span className="amline-funnel-step__index">{index + 1}</span>
              <strong>{step}</strong>
              <small>مطابق ماشین حالت سند</small>
            </article>
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
