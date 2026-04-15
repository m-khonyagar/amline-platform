import { useEffect, useState } from 'react';
import { Footer } from '../components/Common/Footer';
import { Navbar } from '../components/Common/Navbar';
import { SearchBar } from '../components/Common/SearchBar';
import { PropertyCard } from '../components/Properties/PropertyCard';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.25rem' }}>
        <section style={{ marginBottom: '2rem' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #ecfeff 0%, #fef3c7 100%)',
              borderRadius: '28px',
              padding: '2rem',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)',
            }}
          >
            <h1 style={{ marginTop: 0, fontSize: '2.4rem' }}>خرید و اجاره ملک با تجربه‌ای یکپارچه</h1>
            <p style={{ maxWidth: '720px', lineHeight: 1.8 }}>
              این صفحه حالا به API واقعی پروژه متصل است و لیست املاک را به صورت زنده از backend لوکال دریافت می‌کند.
            </p>
            <div style={{ maxWidth: '420px' }}>
              <SearchBar />
            </div>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0 }}>املاک پیشنهادی</h2>
            {loading ? <span>در حال بارگذاری...</span> : <span>{properties.length} فایل</span>}
          </div>

          {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}

          <div
            style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            }}
          >
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
