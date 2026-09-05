import { cn } from '@/lib/utils';

/**
 * The office on a map.
 *
 * An iframe rather than a picture of a map, so a reader can pan out to place
 * the street and hand the pin straight to their own navigation app. It loads
 * lazily: the map is near the foot of the page and costs several hundred
 * kilobytes, none of which should hold up the address above it.
 *
 * Nothing here is themed. A map is a map in either mode, and tinting one to
 * match a dark page makes the streets harder to read for no gain.
 */
export function LocationMap({
  src,
  title,
  sizeClassName = 'aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]',
  className,
}: {
  src: string;
  /** Names the frame for screen readers, e.g. "Head office on the map". */
  title: string;
  /**
   * How tall the frame is. A ratio suits a map given a section of its own; a
   * fixed height suits a strip at the foot of the page, where a ratio would
   * make the map enormous on a phone.
   */
  sizeClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn('w-full overflow-hidden', sizeClassName, className)}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  );
}
