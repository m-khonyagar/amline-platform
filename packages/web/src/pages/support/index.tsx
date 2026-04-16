import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { EmptyState } from '../../components/UI/EmptyState';
import { SectionCard } from '../../components/UI/SectionCard';
import { TrustPanel } from '../../components/UI/TrustPanel';

const supportCategories = [
  {
    title: 'گفتگوی زنده با پشتیبانی',
    description: 'برای پیگیری سریع قرارداد، پرداخت، آگهی و وضعیت پرونده مستقیماً با کارشناس گفتگو کنید.',
    href: '/chat',
  },
  {
    title: 'ثبت شکایت رسمی',
    description: 'اگر نیاز به بررسی حقوقی، ثبت شکایت یا دریافت کد پیگیری دارید، شکایت خود را دقیق ثبت کنید.',
    href: '/support/complaints',
  },
  {
    title: 'راهنمای حقوقی و فرایندها',
    description: 'قوانین، حریم خصوصی، شکایات و پاسخ به سوالات متداول در مرکز حقوقی در دسترس است.',
    href: '/legal',
  },
];

export default function SupportHomePage() {
  const router = useRouter();

  return (
    <PageShell
      title="مرکز پشتیبانی املاین"
      subtitle="برای هر پرسش، مشکل یا پیگیری حقوقی یک مسیر مشخص، قابل رهگیری و شفاف در اختیار شماست."
    >
      <SectionCard title="ورود به مسیر پشتیبانی" actions={<span>پاسخگویی روزانه از ۹ تا ۲۱</span>}>
        <div className="amline-panel-actions">
          {supportCategories.map((item) => (
            <button key={item.title} type="button" className="amline-panel-action" onClick={() => router.push(item.href)}>
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <div className="amline-section-gap" />

      <SectionCard title="اعتماد و شفافیت در رسیدگی">
        <TrustPanel
          items={['کد پیگیری برای شکایات', 'پاسخگویی حقوقی و عملیاتی', 'فرایند رسیدگی شفاف', 'حفظ محرمانگی اطلاعات']}
        />
      </SectionCard>

      <div className="amline-section-gap" />

      <EmptyState
        title="نمی‌دانید از کجا شروع کنید؟"
        description="اگر موضوع شما فوری است، از گفتگوی پشتیبانی شروع کنید. برای موارد رسمی و حقوقی، مسیر ثبت شکایت بهترین نقطه شروع است."
        actions={
          <>
            <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/chat')}>
              شروع گفتگو
            </button>
            <button type="button" className="amline-button amline-button--ghost" onClick={() => router.push('/support/complaints')}>
              ثبت شکایت
            </button>
          </>
        }
      />
    </PageShell>
  );
}
