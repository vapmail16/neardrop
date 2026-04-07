'use client';

import Link from 'next/link';
import { ManifestUploadForm } from '@/components/carrier/ManifestUploadForm';

export function CarrierManifestsClient() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Manifests</h1>
        <p className="mt-1 text-neutral-600">
          Upload a CSV to create parcels.{' '}
          <Link href="/carrier/parcels" className="font-medium text-neutral-900 underline">
            View parcels
          </Link>
        </p>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <ManifestUploadForm />
      </div>
    </div>
  );
}
