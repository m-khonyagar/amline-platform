import type { PropertySummary } from '../../services/api';
import { formatPrice } from '../../utils/helpers';

const propertyImages = [
  '/assets/amline/slider-01.jpeg',
  '/assets/amline/slider-02.jpeg',
  '/assets/amline/slider-03.jpeg',
];

export function PropertyCard({ property }: { property: PropertySummary }) {
  const image = propertyImages[property.title.length % propertyImages.length];

  return (
    <article className="amline-card amline-property-card">
      <div className="amline-property-card__image">
        <img src={image} alt={property.title} />
        <span className="amline-property-card__badge">{property.city}</span>
      </div>
      <div className="amline-property-card__body">
        <div className="amline-property-card__meta">
          <span>فایل قابل معامله</span>
          <span>{property.status}</span>
        </div>
        <h3 className="amline-property-card__title">{property.title}</h3>
        <div className="amline-property-card__price">{formatPrice(property.price)} ریال</div>
        <div className="amline-property-card__footer">
          <span className="amline-pill">استعلام و قرارداد آنلاین</span>
          <span className="amline-footer__meta">آماده بازدید</span>
        </div>
      </div>
    </article>
  );
}
