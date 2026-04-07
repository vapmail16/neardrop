import type { ButtonHTMLAttributes } from 'react';
import { dsButtonClassName, type DsButtonVariant } from './button-variants';

export type DsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DsButtonVariant;
};

export function DsButton({ variant = 'primary', className = '', type = 'button', ...props }: DsButtonProps) {
  const merged = `${dsButtonClassName(variant)} ${className}`.trim();
  return <button type={type} className={merged} {...props} />;
}
