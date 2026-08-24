'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Viewport-triggered entrance used across the site.
 *
 * Everything carries `data-reveal`, which a <noscript> rule in the layout
 * forces back to full opacity — content is never left invisible when scripts
 * fail to run.
 *
 * Visibility is decided with `amount` (a fraction of the element) rather than a
 * negative percentage `margin`: percentage root margins are unreliable across
 * browsers, and a reveal that never fires leaves the content permanently
 * invisible, which is far worse than one that fires slightly early.
 */
const VIEWPORT = { once: true, amount: 0.15 } as const;
const EASE = [0.16, 1, 0.3, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Seconds of delay, for staggering sibling elements. */
  delay?: number;
  /** Travel distance in pixels. */
  distance?: number;
  direction?: 'up' | 'down' | 'none';
  once?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 28,
  direction = 'up',
  once = true,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = direction === 'none' ? 0 : direction === 'up' ? distance : -distance;

  return (
    <motion.div
      data-reveal
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline reveal: the text rises from behind a mask rather than simply fading.
 *
 * The mask is the reason this cannot use `whileInView` directly. The inner span
 * starts translated fully below its `overflow-hidden` parent, so it is clipped
 * out of the intersection rectangle and would never be reported as visible.
 * The *wrapper* is observed instead, and the inner span is animated from that.
 */
export function RevealHeading({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const wrapper = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrapper, { once: true, amount: 0.15 });

  if (reduceMotion) {
    return <span className={cn('block', className)}>{children}</span>;
  }

  // The mask has to clear the descenders. Arabic drops well below the baseline
  // — the tail of ع, ج, ي — and a mask sized to the line box shears them off.
  // The padding gives it room and the matching negative margin keeps the
  // heading's position and spacing unchanged.
  return (
    <span ref={wrapper} className="block overflow-hidden pb-[0.28em] -mb-[0.28em]">
      <motion.span
        data-reveal
        className={cn('block', className)}
        initial={{ opacity: 0, y: '110%' }}
        animate={inView ? { opacity: 1, y: '0%' } : undefined}
        transition={{ duration: 1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Wraps a list so children animate in sequence. Pair with `StaggerItem`. */
export function Stagger({
  children,
  className,
  delay = 0,
  step = 0.08,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  step?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: step, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  distance = 24,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-reveal
      className={className}
      variants={{
        hidden: reduceMotion ? { opacity: 1 } : { opacity: 0, y: distance },
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A hairline that draws itself horizontally when scrolled into view. */
export function RevealLine({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-reveal
      className={cn('h-px w-full origin-[left_center] bg-current opacity-20 rtl:origin-[right_center]', className)}
      initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 1.1, ease: EASE }}
    />
  );
}
