export type DsButtonVariant = 'primary' | 'secondary' | 'ghost';

const base =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<DsButtonVariant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 active:bg-brand-800',
  secondary:
    'border border-neutral-300 bg-surface-card text-neutral-900 shadow-sm hover:bg-neutral-50 active:bg-neutral-100',
  ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900',
};

export function dsButtonClassName(variant: DsButtonVariant): string {
  return `${base} ${variants[variant]}`;
}
