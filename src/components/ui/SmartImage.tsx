import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { ImageRef } from '@/lib/content/media';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { cn } from '@/lib/utils';

/**
 * Renders a CMS image inside a fixed-ratio frame, honouring the focal point
 * chosen in the admin — including a separate focal point for narrow screens.
 *
 * The two positions are passed as custom properties so a media query can pick
 * between them; the source file is never cropped.
 */
type SmartImageProps = {
  image: ImageRef | null;
  /** Responsive `sizes` hint. Always pass a real value for full-width imagery. */
  sizes: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  /** Fallback text shown inside the placeholder when no image exists. */
  placeholderLabel?: string | null;
  placeholderTone?: 'light' | 'dark';
  /** Texture only — for full-bleed heroes where a mark would clash with copy. */
  placeholderBare?: boolean;
};

export function SmartImage({
  image,
  sizes,
  className,
  imageClassName,
  priority = false,
  placeholderLabel,
  placeholderTone = 'light',
  placeholderBare = false,
}: SmartImageProps) {
  if (!image) {
    return (
      <div className={cn('relative overflow-hidden', className)}>
        <ImagePlaceholder
          label={placeholderLabel}
          tone={placeholderTone}
          showMark={!placeholderBare}
        />
      </div>
    );
  }

  const focalVars = {
    '--focal-mobile': image.mobilePosition,
    '--focal-desktop': image.position,
  } as CSSProperties;

  return (
    <div className={cn('relative overflow-hidden', className)} style={focalVars}>
      <Image
        src={image.url}
        alt={image.alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        placeholder={image.blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={image.blurDataUrl ?? undefined}
        className={cn(
          'object-cover [object-position:var(--focal-mobile)] md:[object-position:var(--focal-desktop)]',
          imageClassName,
        )}
      />
    </div>
  );
}
