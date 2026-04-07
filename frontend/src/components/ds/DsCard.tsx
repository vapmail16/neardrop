import type { HTMLAttributes, ReactNode } from 'react';

export type DsCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padding?: 'none' | 'md' | 'lg';
};

const paddingClass: Record<NonNullable<DsCardProps['padding']>, string> = {
  none: '',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function DsCard({ children, className = '', padding = 'md', ...props }: DsCardProps) {
  const p = paddingClass[padding];
  const merged = [
    'rounded-nd border border-neutral-200/80 bg-surface-card shadow-sm',
    p,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div data-testid="ds-card" className={merged} {...props}>
      {children}
    </div>
  );
}
