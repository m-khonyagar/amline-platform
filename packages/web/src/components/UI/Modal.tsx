import type { ReactNode } from 'react';

export function Modal({
  children,
  title,
  open = true,
}: {
  children: ReactNode;
  title?: string;
  open?: boolean;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="amline-bottom-sheet-overlay" role="presentation">
      <section className="amline-bottom-sheet" role="dialog" aria-modal="true" aria-label={title ?? 'پنجره'}>
        {title ? <h2>{title}</h2> : null}
        {children}
      </section>
    </div>
  );
}
