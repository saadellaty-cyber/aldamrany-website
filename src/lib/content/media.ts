import type { MediaAsset } from '@/generated/prisma/client';
import { storage } from '@/lib/storage';
import { focalPosition } from '@/lib/utils';
import { pick, type Locale } from '@/i18n/config';

/**
 * A plain, serialisable description of an image, ready to hand to a client
 * component. Focal points are already resolved into CSS `object-position`
 * strings for both breakpoints.
 */
export type ImageRef = {
  id: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  position: string;
  mobilePosition: string;
  caption: string | null;
  isVector: boolean;
};

type FocalOverrides = {
  focalX?: number | null;
  focalY?: number | null;
  mobileFocalX?: number | null;
  mobileFocalY?: number | null;
  altTextAr?: string | null;
  altTextEn?: string | null;
  captionAr?: string | null;
  captionEn?: string | null;
};

/**
 * Builds an ImageRef from a media asset, letting a specific usage (for example
 * a project gallery row) override the focal point, alt text and caption.
 *
 * The URL is derived from the storage key rather than the stored `url` column
 * so that switching STORAGE_DRIVER does not strand existing rows.
 */
export function toImageRef(
  asset: MediaAsset | null | undefined,
  locale: Locale,
  overrides: FocalOverrides = {},
  fallbackAlt = '',
): ImageRef | null {
  if (!asset) return null;

  const alt =
    pick(locale, overrides.altTextAr ?? null, overrides.altTextEn ?? null) ??
    pick(locale, asset.altAr, asset.altEn) ??
    fallbackAlt;

  const caption =
    pick(locale, overrides.captionAr ?? null, overrides.captionEn ?? null) ??
    pick(locale, asset.captionAr, asset.captionEn);

  const first = (override: number | null | undefined, base: number) =>
    typeof override === 'number' ? override : base;

  return {
    id: asset.id,
    url: storage().url(asset.storageKey),
    alt,
    width: asset.width,
    height: asset.height,
    blurDataUrl: asset.blurDataUrl,
    position: focalPosition(
      first(overrides.focalX, asset.focalX),
      first(overrides.focalY, asset.focalY),
    ),
    mobilePosition: focalPosition(
      first(overrides.mobileFocalX, asset.mobileFocalX),
      first(overrides.mobileFocalY, asset.mobileFocalY),
    ),
    caption,
    isVector: asset.mimeType === 'image/svg+xml',
  };
}

/** Public URL for a stored asset — used for Open Graph tags and the admin UI. */
export function mediaUrl(asset: Pick<MediaAsset, 'storageKey'> | null | undefined): string | null {
  return asset ? storage().url(asset.storageKey) : null;
}
