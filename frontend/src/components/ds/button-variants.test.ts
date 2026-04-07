import { describe, expect, it } from 'vitest';
import { dsButtonClassName, type DsButtonVariant } from './button-variants';

describe('dsButtonClassName', () => {
  it.each<[DsButtonVariant, string]>([
    ['primary', 'bg-brand-700'],
    ['secondary', 'border-neutral-300'],
    ['ghost', 'text-neutral-700'],
  ])('variant %s includes expected token', (variant, token) => {
    expect(dsButtonClassName(variant)).toContain(token);
  });

  it('includes touch-friendly min height and focus ring', () => {
    const c = dsButtonClassName('primary');
    expect(c).toContain('min-h-[44px]');
    expect(c).toContain('focus-visible:ring-brand-600');
  });

  it('includes disabled styles for form buttons', () => {
    expect(dsButtonClassName('primary')).toContain('disabled:opacity-50');
    expect(dsButtonClassName('primary')).toContain('disabled:pointer-events-none');
  });
});
