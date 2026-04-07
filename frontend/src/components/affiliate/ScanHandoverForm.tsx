'use client';

import { useState } from 'react';
import { collectParcel } from '@/lib/api/parcels';
import { ApiRequestError } from '@/lib/api/client';

export function ScanHandoverForm({ onSuccess }: { onSuccess?: () => void }) {
  const [parcelId, setParcelId] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setDone(null);
    setPending(true);
    try {
      const { parcel } = await collectParcel(parcelId.trim(), qrToken.trim());
      setDone(`Collected — status: ${parcel.status}`);
      setQrToken('');
      onSuccess?.();
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Collection failed';
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-neutral-900">Complete handover</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Paste the collection code from the customer phone. Use the parcel UUID from your list.
        </p>
      </div>
      <form onSubmit={(e) => void onSubmit(e)} className="flex flex-col gap-4">
        <div>
          <label htmlFor="aff-collect-parcel-id" className="mb-1 block text-sm font-medium">
            Parcel ID
          </label>
          <input
            id="aff-collect-parcel-id"
            name="parcelId"
            inputMode="text"
            autoComplete="off"
            required
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
            className="min-h-11 w-full rounded-md border border-neutral-300 px-3 py-2 text-base font-mono sm:text-sm"
            placeholder="UUID from parcel list"
          />
        </div>
        <div>
          <label htmlFor="aff-collect-token" className="mb-1 block text-sm font-medium">
            Collection token
          </label>
          <textarea
            id="aff-collect-token"
            name="qrToken"
            required
            rows={4}
            value={qrToken}
            onChange={(e) => setQrToken(e.target.value)}
            className="min-h-24 w-full rounded-md border border-neutral-300 px-3 py-2 text-base font-mono sm:text-sm"
            placeholder="Paste JWT"
            data-testid="affiliate-scan-token"
          />
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {done ? (
          <p className="text-sm text-green-800" role="status">
            {done}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 touch-manipulation rounded-md bg-neutral-900 px-4 py-2 text-base font-medium text-white hover:bg-neutral-800 disabled:opacity-50 sm:text-sm"
        >
          {pending ? 'Submitting…' : 'Complete collection'}
        </button>
      </form>
    </div>
  );
}
