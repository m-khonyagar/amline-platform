import type { ReactNode } from 'react';

type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const toneClass = tone === 'neutral' ? '' : `amline-status-chip--${tone}`;
  return <span className={['amline-status-chip', toneClass, className].filter(Boolean).join(' ')}>{children}</span>;
}
