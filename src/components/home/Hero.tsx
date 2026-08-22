'use client';

import { motion, useReducedMotion } from 'framer-motion';
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
 * The opening frame: copy held against the near-black on one side, the
 * photograph running off the other edge.
 *
 * The image is not a full-bleed backdrop with text laid over it — at this size
 * the machinery is the subject, and a scrim heavy enough to make copy legible
 * over it would flatten the photograph. Instead the two share the frame, with
 * a short gradient where they meet so the edge is not a hard seam.
 */
export function Hero({ eyebrow, title, body, image, primaryCta, secondaryCta }: HeroProps) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative bg-night">
      <div className="relative grid min-h-[34rem] lg:min-h-[40rem] lg:grid-cols-2">
        {/* Photograph. Clipped, because it settles in from slightly oversize —
            without this the extra 6% spills sideways and widens the page. */}
        <div className="absolute inset-0 overflow-hidden lg:relative lg:col-start-2">
          <motion.div
            className="absolute inset-0"
            initial={reduceMotion ? false : { scale: 1.06, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: EASE }}
          >
            <SmartImage
              image={image}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="h-full w-full"
              placeholderTone="dark"
              placeholderBare
            />
          </motion.div>

          {/* The seam. On narrow screens the copy sits over the photograph, so
              the whole frame darkens; from lg the gradient only softens the
              inner edge where the two halves meet. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-night/75 lg:bg-gradient-to-l lg:from-transparent lg:via-night/20 lg:to-night rtl:lg:bg-gradient-to-r"
          />
        </div>

        {/* Copy */}
        <div className="relative z-10 flex items-center lg:col-start-1 lg:row-start-1">
          <motion.div
            className="w-full px-5 py-20 md:px-10 lg:py-24 lg:ps-16 lg:pe-10 xl:ps-24"
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: EASE }}
          >
            {eyebrow ? (
              <p className="mb-5 flex items-center gap-3">
                <span className="gold-rule" aria-hidden="true" />
                <span className="eyebrow text-gold">{eyebrow}</span>
              </p>
            ) : null}

            {title ? (
              <h1 className="text-balance text-3xl font-semibold leading-[1.25] text-paper md:text-4xl lg:text-[2.75rem]">
                <span className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={reduceMotion ? false : { y: '105%' }}
                    animate={{ y: '0%' }}
                    transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
                  >
                    {title}
                  </motion.span>
                </span>
              </h1>
            ) : null}

            {body.length > 0 ? (
              <motion.p
                className="mt-6 max-w-lg text-sm leading-[2] text-paper/65 md:text-base"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
              >
                {body[0]}
              </motion.p>
            ) : null}

            {primaryCta || secondaryCta ? (
              <motion.div
                className="mt-9 flex flex-wrap items-center gap-3"
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
              >
                {primaryCta ? (
                  <ButtonLink href={primaryCta.href} variant="gold">
                    {primaryCta.label}
                  </ButtonLink>
                ) : null}
                {secondaryCta ? (
                  <ButtonLink href={secondaryCta.href} variant="outlineGold" withArrow>
                    {secondaryCta.label}
                  </ButtonLink>
                ) : null}
              </motion.div>
            ) : null}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
