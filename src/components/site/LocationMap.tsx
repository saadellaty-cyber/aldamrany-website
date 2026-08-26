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
  className,
}: {
  src: string;
  /** Names the frame for screen readers, e.g. "Head office on the map". */
  title: string;
  className?: string;
}) {
  return (
    <div className={cn('aspect-[4/3] w-full overflow-hidden sm:aspect-[16/9] lg:aspect-[21/9]', className)}>
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
