'use client';

import type { OpsAffiliateMapPinPublic, ParcelPublic } from '@neardrop/shared';
import { useState } from 'react';
import { StatusBadge } from '@/components/carrier/StatusBadge';
import { assignParcelAffiliate } from '@/lib/api/ops';
import { ApiRequestError } from '@/lib/api/client';

export function OpsParcelPipeline({
  parcels,
  affiliatePins,
  onUpdated,
}: {
  parcels: ParcelPublic[];
  affiliatePins: OpsAffiliateMapPinPublic[];
  onUpdated?: () => void;
}) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});

  async function applyFor(parcel: ParcelPublic) {
    setError(null);
    const raw = selection[parcel.id] ?? parcel.affiliateId ?? '';
    const affiliateId = raw === '' ? null : raw;
    setBusyId(parcel.id);
    try {
      await assignParcelAffiliate(parcel.id, affiliateId);
      onUpdated?.();
    } catch (e) {
      const msg =
        e instanceof ApiRequestError ? e.message : e instanceof Error ? e.message : 'Update failed';
      setError(msg);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Ref</th>
              <th className="px-4 py-3 font-medium">Recipient</th>
              <th className="px-4 py-3 font-medium">Postcode</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Assign hub</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {parcels.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                  No parcels in the system yet.
                </td>
              </tr>
            ) : (
              parcels.map((p) => (
                <tr key={p.id} data-testid={`ops-parcel-row-${p.id}`}>
                  <td className="px-4 py-3 font-mono text-xs">{p.carrierRef ?? '-'}</td>
                  <td className="px-4 py-3">{p.recipientName}</td>
                  <td className="px-4 py-3">{p.recipientPostcode}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label={`Assign affiliate for parcel ${p.carrierRef ?? p.id}`}
                        className="min-h-11 min-w-[10rem] rounded-md border border-neutral-300 bg-white px-2 py-2 text-base sm:text-sm"
                        value={selection[p.id] ?? p.affiliateId ?? ''}
                        onChange={(e) =>
                          setSelection((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        disabled={busyId === p.id}
                        data-testid={`ops-assign-select-${p.id}`}
                      >
                        <option value="">Unassigned</option>
                        {affiliatePins.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.displayName} ({a.postcode})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => void applyFor(p)}
                        className="min-h-11 touch-manipulation rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50"
                        data-testid={`ops-assign-apply-${p.id}`}
                      >
                        {busyId === p.id ? '…' : 'Apply'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
