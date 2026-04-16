import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccountListings } from '../../services/api';

export default function AccountListingsPage() {
  const router = useRouter();
  const properties = useAsyncData(fetchAccountListings, []);

  return (
    <PageShell title="آگهی‌های من" subtitle="لیست آگهی‌های ثبت‌شده‌ی کاربر با actionهای ویرایش، حذف و ورود به مکالمه یا درخواست بازدید.">
      <SectionCard title={properties.loading ? 'در حال بارگذاری آگهی‌ها...' : 'آگهی‌های منتشرشده'}>
        <div className="amline-listing-stack">
          {(properties.data ?? []).map((property, index) => (
            <article key={property.id} className="amline-listing-card">
              <img src={`/assets/amline/slider-0${(index % 3) + 1}.jpeg`} alt={property.title} />
              <div className="amline-listing-card__body">
                <strong>{property.title}</strong>
                <span>{property.city} • {property.status}</span>
                <p>لوکیشن مناسب، امکان بازدید و پیگیری مستقیم از پنل شخصی.</p>
                <div className="amline-listing-card__actions">
                  <button type="button" className="amline-button amline-button--ghost">ویرایش</button>
                  <button type="button" className="amline-button amline-button--ghost">حذف</button>
                  <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/chat/listing-250')}>
                    گفتگو
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
