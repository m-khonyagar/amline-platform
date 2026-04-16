import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonIntent = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  children,
  intent = 'primary',
  className = '',
  ...props
}: {
  children: ReactNode;
  intent?: ButtonIntent;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const intentClass =
    intent === 'secondary'
      ? 'amline-button--secondary'
      : intent === 'ghost'
        ? 'amline-button--ghost'
        : intent === 'danger'
          ? 'amline-button--danger'
          : 'amline-button--primary';

  return (
    <button {...props} className={['amline-button', intentClass, className].filter(Boolean).join(' ')}>
      {children}
    </button>
  );
}
