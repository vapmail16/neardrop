'use client';

import type { ParcelPublic } from '@neardrop/shared';
import { useMemo } from 'react';
import { useParcels } from '@/lib/hooks/useParcels';

function countByStatus(items: ParcelPublic[], status: string): number {
  return items.filter((p) => p.status === status).length;
}

function isTodayUtc(iso: string): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return (
    d.getUTCFullYear() === t.getUTCFullYear() &&
    d.getUTCMonth() === t.getUTCMonth() &&
    d.getUTCDate() === t.getUTCDate()
  );
}

export function AffiliateDashboardClient() {
  const { data, loading, error } = useParcels({ page: 1, limit: 100 });

  const stats = useMemo(() => {
    const items = data?.items ?? [];
    const today = items.filter(
      (p) => isTodayUtc(p.updatedAt) || isTodayUtc(p.createdAt),
    );
    return {
      total: items.length,
      inTransit: countByStatus(items, 'in_transit'),
      atHub: countByStatus(items, 'dropped_at_affiliate'),
      ready: countByStatus(items, 'ready_to_collect'),
      collected: countByStatus(items, 'collected'),
      todayCount: today.length,
    };
  }, [data?.items]);

  if (loading) {
    return <p className="text-sm text-neutral-600">Loading…</p>;
  }
  if (error) {
    return (
      <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Affiliate dashboard</h1>
      <p className="text-sm text-neutral-600">
        Snapshot of parcels matched to your hub. Use <strong>Parcels</strong> for actions and filters.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Total assigned</p>
          <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">In transit</p>
          <p className="mt-1 text-2xl font-semibold">{stats.inTransit}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">At hub</p>
          <p className="mt-1 text-2xl font-semibold">{stats.atHub}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Ready to collect</p>
          <p className="mt-1 text-2xl font-semibold">{stats.ready}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Collected</p>
          <p className="mt-1 text-2xl font-semibold">{stats.collected}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Touched today (UTC)</p>
          <p className="mt-1 text-2xl font-semibold">{stats.todayCount}</p>
        </div>
      </div>
    </div>
  );
}
