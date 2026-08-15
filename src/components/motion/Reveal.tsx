'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Viewport-triggered entrance used across the site.
 *
 * Everything carries `data-reveal`, which a <noscript> rule in the layout
 * forces back to full opacity — content is never left invisible when scripts
 * fail to run.
 */
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
      viewport={{ once, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Headline reveal: the text rises from behind a mask rather than simply fading,
 * which reads as more deliberate on large display type.
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

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <span className="block overflow-hidden">
      <motion.span
        data-reveal
        className={cn('block', className)}
        initial={{ opacity: 0, y: '110%' }}
        whileInView={{ opacity: 1, y: '0%' }}
        viewport={{ once: true, margin: '-8% 0px' }}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
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
      viewport={{ once: true, margin: '-8% 0px' }}
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
        visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
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
      viewport={{ once: true }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
