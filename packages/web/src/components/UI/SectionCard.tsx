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
    <section className="amline-card amline-section-card">
      <div className="amline-section-card__header">
        <h2 className="amline-section-card__title">{title}</h2>
        {actions ? <div className="amline-section-card__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
