export function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: '#0f172a',
        color: '#fff',
        borderRadius: '20px',
        padding: '1rem 1.1rem',
      }}
    >
      <div style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '0.35rem' }}>{label}</div>
      <strong style={{ fontSize: '1.25rem' }}>{value}</strong>
    </div>
  );
}
