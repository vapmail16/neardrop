/**
 * Lightweight loading skeleton for route-level `loading.tsx` and client hooks.
 */
export function PageSkeleton({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div
      className="space-y-6 p-1"
      aria-busy="true"
      aria-live="polite"
      data-testid="page-skeleton"
    >
      <h1 className="sr-only">{title}</h1>
      {subtitle ? <p className="sr-only">{subtitle}</p> : null}
      <div className="space-y-2">
        <div className="h-8 w-64 max-w-full animate-pulse rounded-md bg-neutral-200" aria-hidden />
        {subtitle ? (
          <div className="h-4 w-96 max-w-full animate-pulse rounded-md bg-neutral-100" aria-hidden />
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-lg border border-neutral-200 bg-neutral-50"
          />
        ))}
      </div>
    </div>
  );
}
