'use client';

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import type { RiskStep } from '@/lib/content/collections';

/**
 * The risk-management process drawn as a vertical track that fills as the
 * section scrolls, with each step lifting in as it is reached.
 */
export function RiskProcess({ steps }: { steps: RiskStep[] }) {
  const container = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start 75%', 'end 55%'],
  });

  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 26, restDelta: 0.001 });
  const scaleY = useTransform(progress, [0, 1], [0, 1]);

  if (steps.length === 0) return null;

  return (
    <ol ref={container} className="relative mt-14">
      {/* Track */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 start-[1.4375rem] w-px bg-paper/12 md:start-[1.9375rem]"
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 start-[1.4375rem] w-px origin-top bg-gold md:start-[1.9375rem]"
        style={reduceMotion ? { scaleY: 1 } : { scaleY }}
      />

      {steps.map((step, index) => (
        <motion.li
          key={step.id}
          data-reveal
          className="relative flex gap-6 pb-12 last:pb-0 md:gap-10"
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-night-raised text-gold md:size-16">
            <span className="latin-nums text-sm font-semibold md:text-base">{step.step}</span>
          </span>

          <div className="pt-2 md:pt-4">
            <h3 className="text-balance text-lg font-semibold tracking-tight text-paper md:text-xl">
              {step.title}
            </h3>
            {step.description.length > 0 ? (
              <div className="prose-editorial mt-3 max-w-xl text-sm leading-[2] text-paper/60">
                {step.description.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
