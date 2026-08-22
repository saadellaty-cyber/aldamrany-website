import { Counter } from '@/components/motion/Counter';
import { Reveal } from '@/components/motion/Reveal';
import type { Stat } from '@/lib/content/collections';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Headline figures. Statistics without a value never reach this component —
 * they are filtered out of the query — so no empty cells are rendered.
 */
export function Stats({
  stats,
  locale,
  eyebrow,
  tone = 'light',
  className,
}: {
  stats: Stat[];
  locale: Locale;
  eyebrow?: string | null;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  if (stats.length === 0) return null;

  const isDark = tone === 'dark';

  return (
    <section className={cn(isDark ? 'surface-dark' : 'bg-paper-soft', className)}>
      <div className="container-page py-16 md:py-20">
        {eyebrow ? (
          <Reveal className="mb-10">
            {isDark ? (
              <p className="eyebrow heading-yellow flex items-center gap-3">
                <span className="inline-block h-px w-8 bg-current opacity-50" aria-hidden="true" />
                {eyebrow}
              </p>
            ) : (
              <p className="eyebrow frame-yellow-sm">{eyebrow}</p>
            )}
          </Reveal>
        ) : null}

        <dl
          className={cn(
            'grid gap-px',
            // A single hairline grid rather than boxed cards.
            isDark ? 'bg-white/10' : 'bg-line',
            stats.length >= 4
              ? 'grid-cols-2 lg:grid-cols-4'
              : stats.length === 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-1 sm:grid-cols-2',
          )}
        >
          {stats.map((stat, index) => (
            <Reveal
              key={stat.id}
              delay={index * 0.08}
              className={cn('p-6 md:p-8', isDark ? 'bg-ink' : 'bg-paper-soft')}
            >
              <dd
                className={cn(
                  'latin-nums flex items-baseline gap-1 text-[clamp(2.25rem,1.4rem+2.6vw,3.75rem)] font-medium leading-none tracking-tight',
                )}
              >
                {stat.prefix ? <span className="text-[0.6em] opacity-60">{stat.prefix}</span> : null}
                <Counter value={stat.value} locale={locale} />
                {stat.suffix ? <span className="text-[0.6em] opacity-60">{stat.suffix}</span> : null}
              </dd>
              <dt
                className={cn(
                  'mt-4 text-sm leading-snug',
                  isDark ? 'text-paper/55' : 'text-ink-muted',
                )}
              >
                {stat.label}
              </dt>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
