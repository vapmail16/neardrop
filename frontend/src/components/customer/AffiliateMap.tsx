import type { AffiliateSummaryPublic } from '@neardrop/shared';

function mapsSearchUrl(affiliate: AffiliateSummaryPublic): string {
  const postcode = affiliate.postcode?.trim();
  // Postcode-only lookup is far more reliable with OSM Nominatim than long descriptive strings.
  const q = postcode || [affiliate.addressLine1, affiliate.city].filter(Boolean).join(', ');
  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(q)}`;
}

function parseCoord(value: string | null): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value.trim().replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function hasUsableCoords(lat: number | null, lng: number | null): boolean {
  if (lat === null || lng === null) return false;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  // (0,0) is a common sentinel/default and not a meaningful pickup location.
  if (Math.abs(lat) < 0.000001 && Math.abs(lng) < 0.000001) return false;
  return true;
}

function mapsOpenUrl(affiliate: AffiliateSummaryPublic): string {
  const lat = parseCoord(affiliate.latitude);
  const lng = parseCoord(affiliate.longitude);
  if (hasUsableCoords(lat, lng)) {
    const safeLat = lat as number;
    const safeLng = lng as number;
    const latStr = String(safeLat);
    const lngStr = String(safeLng);
    return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
      latStr,
    )}&mlon=${encodeURIComponent(lngStr)}#map=16/${encodeURIComponent(latStr)}/${encodeURIComponent(lngStr)}`;
  }
  return mapsSearchUrl(affiliate);
}

/** Map / deep-link for pickup location (no third-party map API key in MVP). */
export function AffiliateMap({ affiliate }: { affiliate: AffiliateSummaryPublic }) {
  const lat = parseCoord(affiliate.latitude);
  const lng = parseCoord(affiliate.longitude);
  const hasCoords = hasUsableCoords(lat, lng);
  const embed =
    hasCoords
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
          `${(lng as number) - 0.01},${(lat as number) - 0.01},${(lng as number) + 0.01},${(lat as number) + 0.01}`,
        )}&layer=mapnik&marker=${encodeURIComponent(String(lat))}%2C${encodeURIComponent(String(lng))}`
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
          href={mapsOpenUrl(affiliate)}
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
