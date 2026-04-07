import type { ReactNode } from 'react';

export type DsPageHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function DsPageHeader({ title, description, action }: DsPageHeaderProps) {
  return (
    <div
      className="flex flex-col gap-4 border-b border-neutral-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between"
      data-testid="ds-page-header"
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  );
}
