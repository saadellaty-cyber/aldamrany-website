import { Counter } from '@/components/motion/Counter';
import { Reveal } from '@/components/motion/Reveal';
import type { Stat } from '@/lib/content/collections';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Headline figures, as a row of gold-ruled cells across the dark ground.
 *
 * Statistics without a value never reach this component — they are filtered
 * out of the query — so no empty cells are rendered.
 */
export function Stats({
  stats,
  locale,
  eyebrow,
  className,
}: {
  stats: Stat[];
  locale: Locale;
  eyebrow?: string | null;
  className?: string;
}) {
  if (stats.length === 0) return null;

  return (
    <section className={cn('bg-night px-5 py-4 md:px-10 xl:px-16', className)}>
      <div className="panel-dark mx-auto max-w-[96rem] px-6 py-10 md:px-10">
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
            'grid divide-y divide-night-line sm:divide-x sm:divide-y-0 rtl:sm:divide-x-reverse',
            stats.length >= 4
              ? 'sm:grid-cols-2 lg:grid-cols-4'
              : stats.length === 3
                ? 'sm:grid-cols-3'
                : 'sm:grid-cols-2',
          )}
        >
          {stats.map((stat, index) => (
            <Reveal key={stat.id} delay={index * 0.08} className="px-4 py-6 text-center">
              <dd className="latin-nums flex items-baseline justify-center gap-1 text-[clamp(2rem,1.3rem+2.2vw,3rem)] font-semibold leading-none tracking-tight text-gold">
                {stat.prefix ? <span className="text-[0.6em] opacity-70">{stat.prefix}</span> : null}
                <Counter value={stat.value} locale={locale} />
                {stat.suffix ? <span className="text-[0.6em] opacity-70">{stat.suffix}</span> : null}
              </dd>
              <dt className="mt-3 text-xs leading-snug text-paper/55 md:text-sm">{stat.label}</dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
