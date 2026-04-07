'use client';

import { useState } from 'react';
import type { ManifestUploadSummary } from '@neardrop/shared';
import { uploadManifest } from '@/lib/api/parcels';
import { ApiRequestError } from '@/lib/api/client';

const sampleCsv = `carrier_ref,recipient_name,recipient_postcode,recipient_email,estimated_drop_time
REF-001,Jane Smith,SW1A1AA,jane@example.com,2026-04-03T14:00:00Z`;

export function ManifestUploadForm({
  onSuccess,
}: {
  onSuccess?: (summary: ManifestUploadSummary) => void;
}) {
  const [content, setContent] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ManifestUploadSummary | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSummary(null);
    setPending(true);
    try {
      const result = await uploadManifest({ format: 'csv', content });
      setSummary(result);
      onSuccess?.(result);
      setContent('');
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Upload failed';
      setError(msg);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div>
        <label htmlFor="manifest-csv" className="mb-1 block text-sm font-medium text-neutral-700">
          CSV manifest
        </label>
        <p className="mb-2 text-xs text-neutral-500">
          Headers: carrier_ref, recipient_name, recipient_postcode, recipient_email (optional),
          estimated_drop_time (optional).
        </p>
        <textarea
          id="manifest-csv"
          name="content"
          rows={12}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="Paste CSV here…"
          data-testid="manifest-csv-input"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending || !content.trim()}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {pending ? 'Uploading…' : 'Upload manifest'}
        </button>
        <button
          type="button"
          onClick={() => setContent(sampleCsv)}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
        >
          Load sample rows
        </button>
      </div>
      {error ? (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {summary ? (
        <div
          className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          data-testid="manifest-summary"
        >
          <p className="font-medium">Upload complete</p>
          <ul className="mt-2 list-inside list-disc text-emerald-800">
            <li>Total rows: {summary.total}</li>
            <li>Matched affiliate: {summary.matchedAffiliate}</li>
            <li>Unmatched: {summary.unmatched}</li>
          </ul>
        </div>
      ) : null}
    </form>
  );
}
