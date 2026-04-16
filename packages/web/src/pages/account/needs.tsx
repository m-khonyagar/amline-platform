import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccountNeeds } from '../../services/api';

export default function AccountNeedsPage() {
  const router = useRouter();
  const needs = useAsyncData(fetchAccountNeeds, []);

  return (
    <PageShell title="نیازمندی‌های من" subtitle="لیست نیازمندی‌های فعال کاربر با امکان مدیریت، تماس و ورود به گفتگوی مربوط به همان نیازمندی.">
      <SectionCard title="نیازمندی‌های فعال">
        <div className="amline-listing-stack">
          {(needs.data ?? []).map((item) => (
            <article key={item.id} className="amline-listing-card">
              <img src="/assets/amline/contract-2.jpeg" alt={item.title} />
              <div className="amline-listing-card__body">
                <strong>{item.title}</strong>
                <span>{item.city} • {item.budget}</span>
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
      </SectionCard>
    </PageShell>
  );
}
