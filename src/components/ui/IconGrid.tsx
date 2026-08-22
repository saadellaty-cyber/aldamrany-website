import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';

export type IconGridItem = {
  id: string;
  slug: string;
  title: string;
  icon: string | null;
  description: string[];
};

/**
 * Column counts that have a static class string for Tailwind to find.
 *
 * Two columns from the narrowest screen up: a single stacked column turns nine
 * short labels into a long scroll, and these cells are a mark over one or two
 * words — they have no need of the full width of a phone.
 */
const COLUMN_CLASS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 lg:grid-cols-5',
};

/**
 * Picks a column count that leaves no half-empty final row where it can.
 * Nine cells read far better as three rows of three than as two rows of four
 * and a lonely ninth.
 */
function columnsFor(count: number): string {
  const even = [4, 3, 5, 2].find((n) => count >= n && count % n === 0);
  return COLUMN_CLASS[even ?? (count > 6 ? 4 : 3)];
}

/**
 * A grid of icon cells on the cream panels: a gold line mark over a bold name,
 * with a short line under it where one has been written.
 *
 * The hairlines are drawn as an outline on each cell rather than by letting a
 * tinted container show through 1px gaps. Adjacent outlines sit on the same
 * pixel, so they read as single rules — and, unlike the gap trick, a row that
 * does not fill leaves panel behind it instead of a slab of rule colour.
 *
 * Shared by "capabilities & equipment" and "why us" so the two cream sections
 * present their icons identically.
 */
export function IconGrid({
  items,
  showIcons,
  className,
}: {
  items: IconGridItem[];
  showIcons: boolean;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={cn('grid bg-[#fdfcfa]', columnsFor(items.length), className)}>
      {items.map((item, index) => {
        const icon = showIcons ? resolveIcon(item.icon, item.slug) : null;

        return (
          <li
            key={item.id}
            className="outline outline-1 -outline-offset-[0.5px] outline-gold-calm/20"
          >
            <Reveal delay={(index % 4) * 0.06}>
              <div className="flex h-full flex-col items-center px-5 py-8 text-center md:px-6 md:py-10">
                {icon ? (
                  <Icon name={icon} className="mb-4 size-9 shrink-0 text-gold-calm" />
                ) : null}

                <h3 className="text-balance text-[0.9375rem] font-semibold tracking-tight text-ink md:text-base">
                  {item.title}
                </h3>

                {item.description.length > 0 ? (
                  <p className="mt-2 text-xs leading-[1.9] text-ink/55">{item.description[0]}</p>
                ) : null}
              </div>
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
