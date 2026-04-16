import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="amline-empty-panel amline-empty-panel--system">
      <strong>{title}</strong>
      <p>{description}</p>
      {actions ? <div className="amline-empty-panel__actions">{actions}</div> : null}
    </section>
  );
}
