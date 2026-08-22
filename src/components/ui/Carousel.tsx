'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/**
 * A horizontally scrolling row with arrows on both flanks.
 *
 * Native scroll rather than a transform track: it keeps touch, trackpad and
 * keyboard scrolling working for free, and the row degrades to a plain
 * scrollable list if JavaScript never arrives. The arrows only ever nudge that
 * scroll, and hide themselves when there is nothing further to reach.
 *
 * Direction is left to the browser — in RTL the scroll axis is already
 * mirrored, so "next" is a positive step in both languages.
 */
export function Carousel({
  children,
  label,
  className,
  itemClass = 'w-[17rem] shrink-0 snap-start md:w-[19rem]',
}: {
  children: ReactNode[];
  /** Names the row for screen readers, e.g. "Services". */
  label: string;
  className?: string;
  /** Width of a single slide. */
  itemClass?: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const t = useTranslations();
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const node = track.current;
    if (!node) return;

    // scrollLeft is negative in RTL on every engine that matters now, so the
    // distance from each edge is measured on the absolute value.
    const offset = Math.abs(node.scrollLeft);
    const max = node.scrollWidth - node.clientWidth;
    setAtStart(offset < 8);
    setAtEnd(offset > max - 8);
  }, []);

  useEffect(() => {
    sync();
    const node = track.current;
    if (!node) return;

    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const node = track.current;
    if (!node) return;
    const rtl = getComputedStyle(node).direction === 'rtl';
    node.scrollBy({ left: direction * (rtl ? -1 : 1) * node.clientWidth * 0.8, behavior: 'smooth' });
  };

  const arrow =
    'inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-gold/40 ' +
    'text-gold transition-colors duration-200 hover:border-gold hover:bg-gold hover:text-night ' +
    'disabled:pointer-events-none disabled:opacity-25';

  return (
    <div className={cn('relative flex items-center gap-3', className)}>
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={atStart}
        aria-label={t('common.previous')}
        className={cn(arrow, 'hidden md:inline-flex')}
      >
        <ChevronRight className="size-4 ltr:hidden" aria-hidden="true" />
        <ChevronLeft className="size-4 rtl:hidden" aria-hidden="true" />
      </button>

      <ul
        ref={track}
        onScroll={sync}
        aria-label={label}
        className="scrollbar-none flex min-w-0 flex-1 snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-1"
      >
        {children.map((child, index) => (
          <li key={index} className={itemClass}>
            {child}
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => step(1)}
        disabled={atEnd}
        aria-label={t('common.next')}
        className={cn(arrow, 'hidden md:inline-flex')}
      >
        <ChevronLeft className="size-4 ltr:hidden" aria-hidden="true" />
        <ChevronRight className="size-4 rtl:hidden" aria-hidden="true" />
      </button>
    </div>
  );
}
