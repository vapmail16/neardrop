import type { ReactNode } from 'react';

export type DsSectionProps = {
  title: string;
  /** Stable id for aria-labelledby */
  sectionId: string;
  children: ReactNode;
  className?: string;
};

export function DsSection({ title, sectionId, children, className = '' }: DsSectionProps) {
  return (
    <section
      role="region"
      className={`space-y-3 ${className}`.trim()}
      aria-labelledby={sectionId}
    >
      <h2 id={sectionId} className="text-lg font-semibold text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}
