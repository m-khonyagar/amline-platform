import { useRouter } from 'next/router';
import { PageShell } from '../../components/Common/PageShell';
import { EmptyState } from '../../components/UI/EmptyState';
import { SectionCard } from '../../components/UI/SectionCard';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccountListings } from '../../services/api';

export default function AccountListingsPage() {
  const router = useRouter();
  const properties = useAsyncData(fetchAccountListings, []);
  const listingItems = properties.data ?? [];
  const statusTone = (status?: string) => (status?.includes('منتشر') ? 'success' : status?.includes('انتظار') ? 'warning' : 'warning');

  return (
    <PageShell title="آگهی‌های من" subtitle="آگهی‌های ثبت‌شده را مدیریت کنید، سریع ویرایش کنید و مستقیم وارد گفتگوی هر مورد شوید.">
      <SectionCard title={properties.loading ? 'در حال بارگذاری آگهی‌ها...' : 'آگهی‌های منتشرشده'}>
        {properties.error ? <p className="amline-form-feedback amline-form-feedback--error">دریافت آگهی‌ها با خطا مواجه شد. لطفا دوباره تلاش کنید.</p> : null}
        {properties.loading ? (
          <p className="amline-form-feedback">در حال آماده‌سازی لیست آگهی‌ها...</p>
        ) : listingItems.length === 0 ? (
          <EmptyState
            title="هنوز آگهی ثبت نکرده‌اید"
            description="با ساخت اولین آگهی، سریع‌تر با متقاضیان واقعی ارتباط می‌گیرید."
            actions={
              <button type="button" className="amline-button amline-button--primary" onClick={() => router.push('/agent/dashboard')}>
                ثبت اولین آگهی
              </button>
            }
          />
        ) : (
          <div className="amline-listing-stack">
            {listingItems.map((property, index) => (
              <article key={property.id} className="amline-listing-card">
                <img src={`/assets/amline/slider-0${(index % 3) + 1}.jpeg`} alt={property.title} />
                <div className="amline-listing-card__body">
                  <strong>{property.title}</strong>
                  <span>
                    {property.city} •{' '}
                    <span className={`amline-status-chip amline-status-chip--${statusTone(property.status)}`}>{property.status}</span>
                  </span>
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
        )}
      </SectionCard>
    </PageShell>
  );
}
