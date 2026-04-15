import type { PropertySummary } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

export function PropertyCard({ property }: { property: PropertySummary }) {
  return (
    <article
      style={{
        border: '1px solid #dbe4e8',
        borderRadius: '18px',
        padding: '1rem',
        backgroundColor: '#ffffff',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div style={{ fontSize: '0.85rem', color: '#0f766e', marginBottom: '0.35rem' }}>{property.city}</div>
      <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{property.title}</h3>
      <p style={{ marginBottom: 0, color: '#334155' }}>{formatPrice(property.price)} ریال</p>
    </article>
  );
}
