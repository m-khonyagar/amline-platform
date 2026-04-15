import { useEffect, useState } from 'react';
import { PageShell } from '../components/Common/PageShell';
import { SearchBar } from '../components/Common/SearchBar';
import { PropertyCard } from '../components/Properties/PropertyCard';
import { MetricCard } from '../components/UI/MetricCard';
import { SectionCard } from '../components/UI/SectionCard';
import { fetchProperties, type PropertySummary } from '../services/api';

export default function HomePage() {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchProperties()
      .then((items) => setProperties(items))
      .catch((fetchError: unknown) => {
        const message = fetchError instanceof Error ? fetchError.message : 'Failed to load properties.';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageShell
      title="خرید و اجاره ملک با تجربه‌ای یکپارچه"
      subtitle="صفحه اصلی حالا به API واقعی پروژه متصل است و فایل‌های پیشنهادی را از backend لوکال دریافت می‌کند."
    >
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '1.5rem' }}>
        <MetricCard label="املاک فعال" value={loading ? '...' : String(properties.length)} />
        <MetricCard label="شهرهای پوشش داده‌شده" value="12+" />
        <MetricCard label="زمان پاسخ پشتیبانی" value="کمتر از 30 دقیقه" />
      </div>

      <SectionCard title="جست‌وجوی سریع">
        <div style={{ maxWidth: '420px' }}>
          <SearchBar />
        </div>
      </SectionCard>

      <div style={{ height: '1rem' }} />

      <SectionCard title="املاک پیشنهادی" actions={loading ? <span>در حال بارگذاری...</span> : <span>{properties.length} فایل</span>}>
        {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </SectionCard>
    </PageShell>
  );
}
