import { Counter } from '@/components/motion/Counter';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import type { Stat } from '@/lib/content/collections';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Headline figures as square cells across the full width of the page: a gold
 * mark, the number, then what it counts.
 *
 * Two per row from the narrowest screen up — a figure and a two-word label do
 * not need the width of a phone, and stacking them one per row turns a glance
 * into a scroll. The cells are separated by hairlines showing the ground
 * through the grid gaps rather than by borders, so the band reads as one plate.
 *
 * Statistics without a value never reach this component — they are filtered out
 * of the query — so no empty cells are rendered.
 */

/** Column counts written out so Tailwind can find the class strings. */
const COLUMNS: Record<number, string> = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 lg:grid-cols-5',
  6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
};

export function Stats({
  stats,
  locale,
  eyebrow,
  showIcons = true,
  className,
}: {
  stats: Stat[];
  locale: Locale;
  eyebrow?: string | null;
  showIcons?: boolean;
  className?: string;
}) {
  if (stats.length === 0) return null;

  const columns = COLUMNS[Math.min(stats.length, 6)] ?? 'grid-cols-2 lg:grid-cols-4';

  return (
    <section className={cn('bg-night py-10 md:py-14', className)}>
      {eyebrow ? (
        <Reveal className="mb-8">
          <p className="flex items-center justify-center gap-3">
            <span className="gold-rule" aria-hidden="true" />
            <span className="eyebrow text-gold">{eyebrow}</span>
            <span className="gold-rule" aria-hidden="true" />
          </p>
        </Reveal>
      ) : null}

      <dl
        className={cn(
          'grid gap-px border-y border-night-line bg-night-line',
          columns,
        )}
      >
        {stats.map((stat, index) => {
          const icon = showIcons ? resolveIcon(stat.icon, '') : null;

          return (
            <Reveal
              key={stat.id}
              delay={(index % 5) * 0.07}
              // Square while two sit side by side on a phone, where the cell is
              // narrow enough for that to look right. Above it the cell would be
              // a third of the page wide, and a square of that becomes a
              // half-empty block — so it takes a fixed height instead.
              className="flex aspect-square flex-col items-center justify-center gap-3 bg-night-soft px-4 text-center sm:aspect-auto sm:min-h-[12rem] sm:py-8"
            >
              {icon ? <Icon name={icon} className="size-8 shrink-0 text-gold md:size-9" /> : null}

              <dd className="latin-nums flex items-baseline justify-center gap-1 text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] font-semibold leading-none tracking-tight text-gold">
                {stat.prefix ? <span className="text-[0.6em] opacity-70">{stat.prefix}</span> : null}
                <Counter value={stat.value} locale={locale} />
                {stat.suffix ? <span className="text-[0.6em] opacity-70">{stat.suffix}</span> : null}
              </dd>

              <dt className="text-xs leading-snug text-paper/60 md:text-sm">{stat.label}</dt>
            </Reveal>
          );
        })}
      </dl>
    </section>
  );
}
