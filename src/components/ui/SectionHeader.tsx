import type { ReactNode } from 'react';
import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

/**
 * A left-aligned section heading: a gold eyebrow above a large title, with an
 * optional action pinned to the far end.
 *
 * Used where a section needs a heading and a link on the same line. Sections
 * that want their heading centred use `SectionTitle` instead.
 *
 * The site sits on a near-black ground, so `dark` here means the ground, and
 * `light` is for the cream panels lifted out of it.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  titleClass = 'text-2xl font-semibold tracking-tight md:text-3xl',
  className,
  tone = 'dark',
}: {
  eyebrow?: string | null;
  title?: string | null;
  description?: ReactNode;
  action?: ReactNode;
  align?: 'start' | 'center';
  titleClass?: string;
  className?: string;
  /** The ground it sits on. */
  tone?: 'dark' | 'light';
}) {
  if (!eyebrow && !title && !description && !action) return null;

  const onDark = tone === 'dark';
  const muted = onDark ? 'text-paper/60' : 'text-ink/65';

  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? (
          <Reveal className="mb-4">
            <p className="flex items-center gap-3">
              <span className="gold-rule" aria-hidden="true" />
              <span className={cn('eyebrow', onDark ? 'text-gold' : 'text-gold-calm')}>
                {eyebrow}
              </span>
            </p>
          </Reveal>
        ) : null}

        {title ? (
          <h2 className={cn(titleClass, 'text-balance', onDark ? 'text-paper' : 'text-ink')}>
            <RevealHeading>{title}</RevealHeading>
          </h2>
        ) : null}

        {description ? (
          <Reveal delay={0.1}>
            <div className={cn('mt-5 max-w-2xl text-sm leading-[2] md:text-base', muted)}>
              {description}
            </div>
          </Reveal>
        ) : null}
      </div>

      {action ? (
        <Reveal delay={0.15} className="shrink-0">
          {action}
        </Reveal>
      ) : null}
    </div>
  );
}
