'use client';

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ButtonLink } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import type { ImageRef } from '@/lib/content/media';

type HeroProps = {
  eyebrow: string | null;
  title: string | null;
  body: string[];
  image: ImageRef | null;
  primaryCta: { label: string; href: string } | null;
  secondaryCta: { label: string; href: string } | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Full-viewport opening frame. The photograph drifts slowly as the page
 * scrolls and the copy lifts in behind a mask — restrained rather than showy.
 */
export function Hero({ eyebrow, title, body, image, primaryCta, secondaryCta }: HeroProps) {
  const t = useTranslations();
  const reduceMotion = useReducedMotion();
  const container = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0px', '60px']);

  return (
    <section
      ref={container}
      className="surface-dark relative flex min-h-dvh flex-col justify-end overflow-hidden"
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 -bottom-[14%]"
        style={reduceMotion ? undefined : { y: imageY }}
        initial={reduceMotion ? false : { scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <SmartImage
          image={image}
          sizes="100vw"
          priority
          className="h-full w-full"
          placeholderTone="dark"
          placeholderBare
        />
      </motion.div>

      {/* Legibility scrim — heavier at the bottom where the copy sits. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-ink/25" />

      <motion.div
        className="container-page relative z-10 pb-16 pt-32 md:pb-20 lg:pb-24"
        style={reduceMotion ? undefined : { opacity: contentOpacity, y: contentY }}
      >
        <motion.div
          className="flex items-center gap-4"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        >
          <span className="h-px w-10 bg-paper/50" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-[0.24em]">EL DAMARANY</span>
          {eyebrow ? (
            <span className="eyebrow text-paper/60">{eyebrow}</span>
          ) : null}
        </motion.div>

        {title ? (
          <h1 className="heading-gold display-1 mt-7 max-w-[18ch] text-balance">
            <span className="block overflow-hidden">
              <motion.span
                className="block"
                initial={reduceMotion ? false : { y: '105%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1.2, delay: 0.35, ease: EASE }}
              >
                {title}
              </motion.span>
            </span>
          </h1>
        ) : null}

        {body.length > 0 ? (
          <motion.p
            className="lead mt-8 max-w-xl text-paper/75"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: EASE }}
          >
            {body[0]}
          </motion.p>
        ) : null}

        {primaryCta || secondaryCta ? (
          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.75, ease: EASE }}
          >
            {primaryCta ? (
              <ButtonLink href={primaryCta.href} variant="inverse" size="lg" withArrow>
                {primaryCta.label}
              </ButtonLink>
            ) : null}
            {secondaryCta ? (
              <ButtonLink href={secondaryCta.href} variant="outlineLight" size="lg">
                {secondaryCta.label}
              </ButtonLink>
            ) : null}
          </motion.div>
        ) : null}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-5 z-10 hidden justify-center md:flex"
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        style={reduceMotion ? undefined : { opacity: contentOpacity }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="eyebrow text-paper/45">{t('common.scroll')}</span>
          <span className="relative block h-12 w-px overflow-hidden bg-paper/20">
            <motion.span
              className="absolute inset-x-0 top-0 block h-1/2 bg-paper/80"
              animate={reduceMotion ? undefined : { y: ['-100%', '200%'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </div>
      </motion.div>
    </section>
  );
}
