import { Icon } from './Icon';

export function TrustPanel({
  items,
  compact = false,
}: {
  items: string[];
  compact?: boolean;
}) {
  return (
    <div className={`amline-trust-panel${compact ? ' amline-trust-panel--compact' : ''}`}>
      {items.map((item) => (
        <span key={item} className="amline-trust-panel__item">
          <Icon name="check" className="amline-icon amline-icon--xs" />
          {item}
        </span>
      ))}
    </div>
  );
}
