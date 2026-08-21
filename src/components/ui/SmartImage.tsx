import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { ImageRef } from '@/lib/content/media';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { TopicPattern, patternForSlug, type TopicPatternName } from '@/components/ui/TopicPattern';
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
  /** Texture only, no wordmark — for full-bleed heroes with copy on top. */
  placeholderBare?: boolean;
  /**
   * Subject of the block. When no photograph has been uploaded, topical
   * artwork is drawn instead of the neutral placeholder — pass either the
   * pattern name directly or the content slug to derive it from.
   */
  topic?: TopicPatternName;
  topicSlug?: string | null;
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
  topic,
  topicSlug,
}: SmartImageProps) {
  if (!image) {
    const pattern = topic ?? (topicSlug ? patternForSlug(topicSlug) : null);

    return (
      <div className={cn('relative overflow-hidden', className)}>
        {pattern ? (
          <TopicPattern name={pattern} label={placeholderBare ? null : placeholderLabel} />
        ) : (
          <ImagePlaceholder
            label={placeholderLabel}
            tone={placeholderTone}
            showMark={!placeholderBare}
          />
        )}
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
