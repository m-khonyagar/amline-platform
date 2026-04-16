export function Progress({ value, max = 100, className = '' }: { value: number; max?: number; className?: string }) {
  return <progress max={max} value={value} className={['amline-progress-bar', className].filter(Boolean).join(' ')} />;
}
