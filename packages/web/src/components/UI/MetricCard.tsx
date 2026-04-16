export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="amline-card amline-metric-card">
      <div className="amline-metric-card__label">{label}</div>
      <div className="amline-metric-card__value">{value}</div>
    </div>
  );
}
