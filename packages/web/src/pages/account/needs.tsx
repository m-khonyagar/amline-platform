import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { EmptyState } from '../../components/UI/EmptyState';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccountNeeds } from '../../services/api';

export default function AccountNeedsPage() {
  const router = useRouter();
  const needs = useAsyncData(fetchAccountNeeds, []);
  const needItems = needs.data ?? [];

  return (
    <PageShell title="نیازمندی‌های من" subtitle="نیازمندی‌های فعال را یکجا ببینید، اصلاح کنید و برای هر مورد گفتگوی مستقیم داشته باشید.">
      <SectionCard title="نیازمندی‌های فعال">
        {needs.error ? <p className="amline-form-feedback amline-form-feedback--error">بارگذاری نیازمندی‌ها انجام نشد. چند لحظه بعد دوباره تلاش کنید.</p> : null}
        {needs.loading ? (
          <p className="amline-form-feedback">در حال بارگذاری نیازمندی‌های شما...</p>
        ) : needItems.length === 0 ? (
          <EmptyState
            title="هنوز نیازمندی فعالی ندارید"
            description="نیازمندی جدید ثبت کنید تا مشاوران مرتبط سریع‌تر با شما ارتباط بگیرند."
            actions={
              <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/agent/dashboard')}>
                ثبت نیازمندی جدید
              </button>
            }
          />
        ) : (
          <div className="amline-listing-stack">
            {needItems.map((item) => (
              <article key={item.id} className="amline-listing-card">
                <img src="/assets/amline/contract-2.jpeg" alt={item.title} />
                <div className="amline-listing-card__body">
                  <strong>{item.title}</strong>
                  <span>{item.city} • <span className="amline-status-chip amline-status-chip--warning">{item.budget}</span></span>
                  <p>نیازمندی فعال با امکان تماس مستقیم، چت با کارشناس و بررسی پیشنهادهای مرتبط.</p>
                  <div className="amline-listing-card__actions">
                    <button type="button" className="amline-button amline-button--ghost">تماس</button>
                    <button type="button" className="amline-button amline-button--ghost">ویرایش</button>
                    <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/chat/need-250')}>
                      چت
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </PageShell>
  );
}
