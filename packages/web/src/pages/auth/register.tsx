import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';

export default function RegisterPage() {
  return (
    <PageShell title="ثبت نام" subtitle="فرم اولیه‌ی ثبت نام کاربر نهایی برای شروع استفاده از خدمات پلتفرم.">
      <SectionCard title="ایجاد حساب">
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: '480px' }}>
          <input placeholder="نام و نام خانوادگی" />
          <input placeholder="شماره موبایل" />
          <input placeholder="شهر" />
          <button>ایجاد حساب</button>
        </div>
      </SectionCard>
    </PageShell>
  );
}
