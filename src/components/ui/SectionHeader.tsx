import type { ReactNode } from 'react';
import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { cn } from '@/lib/utils';

/**
 * Section heading: a small tracked eyebrow above a large display title.
 * Every part is optional — nothing is rendered for content the CMS has not
 * been given.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  titleClass = 'display-3',
  className,
  tone = 'dark-text',
}: {
  eyebrow?: string | null;
  title?: string | null;
  description?: ReactNode;
  action?: ReactNode;
  align?: 'start' | 'center';
  titleClass?: string;
  className?: string;
  tone?: 'dark-text' | 'light-text';
}) {
  if (!eyebrow && !title && !description && !action) return null;

  const muted = tone === 'light-text' ? 'text-paper/55' : 'text-ink-muted';

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
          <Reveal>
            <p className="eyebrow heading-yellow mb-5 flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-current opacity-50" aria-hidden="true" />
              {eyebrow}
            </p>
          </Reveal>
        ) : null}

        {title ? (
          <h2 className={cn(titleClass, 'heading-yellow text-balance')}>
            <RevealHeading>{title}</RevealHeading>
          </h2>
        ) : null}

        {description ? (
          <Reveal delay={0.1}>
            <div className={cn('lead mt-6 max-w-2xl', muted)}>{description}</div>
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
