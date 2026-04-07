import type { ReactNode } from 'react';

export type DsEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DsEmptyState({ title, description, action }: DsEmptyStateProps) {
  return (
    <div
      className="rounded-nd border border-dashed border-neutral-300 bg-surface-card px-6 py-10 text-center shadow-sm"
      data-testid="ds-empty-state"
    >
      <p className="font-medium text-neutral-900">{title}</p>
      {description ? <p className="mt-2 text-sm text-neutral-600">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
