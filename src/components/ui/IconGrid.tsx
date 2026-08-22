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
 * A grid of icon cells on the cream panels: a gold line mark over a bold name,
 * with a short line under it where one has been written.
 *
 * Cells are separated by hairlines rather than boxed, so the grid reads as one
 * plate rather than a row of cards. The rules are drawn by the gaps showing the
 * container's colour through — a `divide-*` pair leaves the outer edges
 * unruled, which looks unfinished once the grid wraps.
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

  // The column count follows the number of cells, so four never sit in a
  // six-column grid with two empty slots at the end.
  const columns =
    items.length >= 8
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : items.length >= 6
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : items.length >= 4
          ? 'sm:grid-cols-2 lg:grid-cols-4'
          : 'sm:grid-cols-3';

  return (
    <ul className={cn('grid gap-px bg-gold-calm/20', columns, className)}>
      {items.map((item, index) => {
        const icon = showIcons ? resolveIcon(item.icon, item.slug) : null;

        return (
          <li key={item.id} className="bg-[#fdfcfa]">
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
