'use client';

import { animate, useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Counts a numeric value up once it scrolls into view.
 *
 * Values that are not purely numeric (or a reduced-motion preference) render
 * immediately and untouched, so a label like "1978+" is never mangled.
 */
export function Counter({
  value,
  locale,
  duration = 1.6,
}: {
  value: string;
  locale: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const reduceMotion = useReducedMotion();

  const target = Number(value.replace(/[^\d.-]/g, ''));
  const isNumeric = value.trim() !== '' && Number.isFinite(target) && /^\s*[\d.,]+\s*$/.test(value);
  const shouldAnimate = isNumeric && !reduceMotion;

  const [animated, setAnimated] = useState('0');

  useEffect(() => {
    if (!shouldAnimate || !inView) return;

    const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      maximumFractionDigits: 0,
      useGrouping: target >= 10_000,
    });

    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setAnimated(formatter.format(Math.round(latest))),
      onComplete: () => setAnimated(formatter.format(target)),
    });

    return () => controls.stop();
  }, [inView, shouldAnimate, target, locale, duration]);

  // Non-numeric values (and reduced motion) are rendered verbatim, so a label
  // like "1978+" is never reformatted or animated.
  return (
    <span ref={ref} className="tabular-nums">
      {shouldAnimate ? animated : value}
    </span>
  );
}
