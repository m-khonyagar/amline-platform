import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function ForgotPasswordPage() {
  return (
    <PageShell title="بازیابی دسترسی" subtitle="ارسال لینک یا کد بازیابی برای ورود دوباره به حساب کاربری.">
      <SectionCard title="درخواست بازیابی">
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px' }}>
          <input placeholder="شماره موبایل یا ایمیل" />
          <button>ارسال لینک بازیابی</button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
