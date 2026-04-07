import type { AffiliateSummaryPublic } from '@neardrop/shared';

function mapsSearchUrl(affiliate: AffiliateSummaryPublic): string {
  const q = [affiliate.addressLine1, affiliate.city, affiliate.postcode].filter(Boolean).join(', ');
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
}

/** Map / deep-link for pickup location (no third-party map API key in MVP). */
export function AffiliateMap({ affiliate }: { affiliate: AffiliateSummaryPublic }) {
  const lat = affiliate.latitude;
  const lng = affiliate.longitude;
  const embed =
    lat && lng
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
          `${Number(lng) - 0.01},${Number(lat) - 0.01},${Number(lng) + 0.01},${Number(lat) + 0.01}`,
        )}&layer=mapnik&marker=${lat}%2C${lng}`
      : null;

  return (
    <div className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm" data-testid="affiliate-map">
      <h2 className="text-lg font-semibold text-neutral-900">Pickup location</h2>
      <p className="text-sm text-neutral-800">{affiliate.displayName}</p>
      <p className="text-sm text-neutral-600">
        {affiliate.addressLine1}
        {affiliate.addressLine2 ? `, ${affiliate.addressLine2}` : ''}
        <br />
        {affiliate.city} {affiliate.postcode}
      </p>
      {embed ? (
        <iframe
          title="Pickup map"
          className="h-56 w-full rounded-md border border-neutral-200"
          src={embed}
          loading="lazy"
        />
      ) : null}
      <p className="text-sm">
        <a
          href={mapsSearchUrl(affiliate)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-neutral-900 underline"
        >
          Open area in OpenStreetMap
        </a>
      </p>
    </div>
  );
}
