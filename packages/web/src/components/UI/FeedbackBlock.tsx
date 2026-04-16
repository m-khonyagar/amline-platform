import type { ReactNode } from 'react';

export function FeedbackBlock({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'error';
  children: ReactNode;
}) {
  const toneClass =
    tone === 'success'
      ? 'amline-feedback-block--success'
      : tone === 'error'
        ? 'amline-feedback-block--error'
        : 'amline-feedback-block--info';

  return <div className={`amline-feedback-block ${toneClass}`}>{children}</div>;
}
