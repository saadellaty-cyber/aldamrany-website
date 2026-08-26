/**
 * Building an embeddable map URL from whatever the owner has saved.
 *
 * Google's `output=embed` form needs no API key, so there is no secret in the
 * page source, nothing to bill and nothing to expire. The trade-off is that it
 * takes a place as text rather than a place ID, which is why the address is a
 * perfectly good fallback.
 */

/**
 * The place a pasted Google Maps link points at.
 *
 * Owners paste whatever the app gave them. A "share" link carries the place in
 * `query` or `q`; a link copied from the address bar carries `@lat,lng` in the
 * path. A shortened `maps.app.goo.gl` link carries neither without following a
 * redirect, so it returns null and the caller falls back to the address.
 */
function placeFromMapsUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (!/(^|\.)google\.[a-z.]+$/i.test(parsed.hostname)) return null;

  const query = parsed.searchParams.get('query') ?? parsed.searchParams.get('q');
  if (query?.trim()) return query.trim();

  const coords = parsed.pathname.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  return coords ? `${coords[1]},${coords[2]}` : null;
}

/**
 * The `src` for the embedded map, or null when there is nothing to show.
 *
 * Prefers the saved Maps link, because that is where an owner drops a precise
 * pin, and falls back to the office address so a map appears as soon as an
 * address exists — without anyone having to paste a link at all.
 */
export function mapEmbedSrc({
  mapsUrl,
  address,
  locale,
}: {
  mapsUrl?: string | null;
  address?: string | null;
  locale: string;
}): string | null {
  const place = placeFromMapsUrl(mapsUrl) ?? address?.trim();
  if (!place) return null;

  const params = new URLSearchParams({
    q: place,
    hl: locale,
    z: '16',
    output: 'embed',
  });
  return `https://www.google.com/maps?${params.toString()}`;
}
