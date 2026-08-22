import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

/**
 * A centred section title flanked by two gold rules.
 *
 * The rules do the work the old left-aligned eyebrow did — they mark where a
 * section starts without spending a line on a label. The title itself stays
 * plain: paper on the dark ground, ink on the cream panels. Gold is kept for
 * the rules, so the accent frames the heading instead of colouring it.
 */
export function SectionTitle({
  title,
  description,
  tone = 'dark',
  className,
}: {
  title?: string | null;
  description?: string | null;
  /** The ground it sits on, not the colour of the text. */
  tone?: 'dark' | 'light';
  className?: string;
}) {
  if (!title && !description) return null;

  return (
    <div className={cn('text-center', className)}>
      {title ? (
        <div className="flex items-center justify-center gap-4">
          <span className="gold-rule shrink-0" aria-hidden="true" />
          <h2
            className={cn(
              'text-balance text-2xl font-semibold tracking-tight md:text-3xl',
              tone === 'dark' ? 'text-paper' : 'text-ink',
            )}
          >
            <RevealHeading>{title}</RevealHeading>
          </h2>
          <span className="gold-rule shrink-0" aria-hidden="true" />
        </div>
      ) : null}

      {description ? (
        <Reveal delay={0.1}>
          <p
            className={cn(
              'mx-auto mt-4 max-w-2xl text-sm leading-relaxed md:text-base',
              tone === 'dark' ? 'text-paper/60' : 'text-ink/65',
            )}
          >
            {description}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
