'use client';

import type { AffiliateEarningRowPublic, AffiliateEarningsSummaryPublic } from '@neardrop/shared';

export function EarningsSummary({ data }: { data: AffiliateEarningsSummaryPublic }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Pending total</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900" data-testid="earn-pending-total">
            £{data.pendingTotal}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Paid total</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">£{data.paidTotal}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase text-neutral-500">Pending rows</p>
          <p className="mt-1 text-2xl font-semibold text-neutral-900">{data.pendingCount}</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-600">
            <tr>
              <th className="px-4 py-3 font-medium">Parcel</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {data.recent.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                  No earnings yet.
                </td>
              </tr>
            ) : (
              data.recent.map((r: AffiliateEarningRowPublic) => (
                <tr key={r.id} data-testid={`earning-row-${r.id}`}>
                  <td className="px-4 py-3 font-mono text-xs">{r.parcelId}</td>
                  <td className="px-4 py-3">£{r.amount}</td>
                  <td className="px-4 py-3">{r.payoutStatus}</td>
                  <td className="px-4 py-3 text-neutral-600">{r.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
