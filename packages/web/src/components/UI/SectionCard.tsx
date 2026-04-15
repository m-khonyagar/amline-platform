import type { ReactNode } from 'react';

export function SectionCard({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      style={{
        backgroundColor: '#fff',
        borderRadius: '22px',
        padding: '1.25rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 28px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
