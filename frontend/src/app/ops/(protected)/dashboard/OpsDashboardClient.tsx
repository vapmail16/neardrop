'use client';

import { OpsStatCards } from '@/components/ops/OpsStatCards';
import { PageSkeleton } from '@/components/ui/PageSkeleton';
import { useOpsStats } from '@/lib/hooks/useOpsStats';

export function OpsDashboardClient() {
  const { data, loading, error } = useOpsStats();

  if (loading) {
    return (
      <PageSkeleton
        title="Operations dashboard"
        subtitle="Network-wide parcel and hub overview."
      />
    );
  }
  if (error || !data) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
        {error ?? 'Failed to load stats'}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Operations dashboard</h1>
        <p className="mt-1 text-sm text-neutral-600">Network-wide parcel and hub overview.</p>
      </div>
      <OpsStatCards data={data} />
    </div>
  );
}
