import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import type { ImageRef } from '@/lib/content/media';

/**
 * The company introduction, held in a cream panel lifted off the dark ground.
 *
 * This is the one long passage on the homepage, and long prose is tiring in
 * paper-on-black. Lifting it onto a light panel gives the reading its own
 * space and marks it as the moment the page slows down.
 */
export function AboutPanel({
  eyebrow,
  title,
  body,
  image,
  cta,
  closing,
}: {
  eyebrow: string | null;
  title: string | null;
  body: string[];
  image: ImageRef | null;
  cta: { label: string; href: string } | null;
  /** Optional single line set apart in gold under the prose. */
  closing?: string | null;
}) {
  if (!title && body.length === 0) return null;

  return (
    <section className="bg-night px-5 pb-4 md:px-10 xl:px-16">
      <div className="panel-light mx-auto max-w-[96rem] overflow-hidden">
        <div className="grid gap-0 lg:grid-cols-12">
          {image ? (
            <div className="lg:col-span-5">
              <div className="h-56 sm:h-72 lg:h-full lg:min-h-[26rem]">
                <SmartImage
                  image={image}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="h-full w-full"
                />
              </div>
            </div>
          ) : null}

          <div className={image ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div className="p-6 md:p-10 lg:p-12">
              {eyebrow ? (
                <Reveal>
                  <p className="mb-4 flex items-center gap-3">
                    <span className="gold-rule" aria-hidden="true" />
                    <span className="eyebrow text-gold-calm">{eyebrow}</span>
                  </p>
                </Reveal>
              ) : null}

              {title ? (
                <h2 className="text-balance text-2xl font-semibold leading-[1.4] tracking-tight text-ink md:text-[1.75rem]">
                  <RevealHeading>{title}</RevealHeading>
                </h2>
              ) : null}

              {body.length > 0 ? (
                <Reveal delay={0.1}>
                  <div className="mt-6 space-y-4 text-sm leading-[2.1] text-ink/70 md:text-[0.9375rem]">
                    {body.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {closing ? (
                <Reveal delay={0.15}>
                  <p className="mt-7 border-t border-gold/25 pt-5 text-sm font-medium leading-relaxed text-gold-calm">
                    {closing}
                  </p>
                </Reveal>
              ) : null}

              {cta ? (
                <Reveal delay={0.2}>
                  <div className="mt-8">
                    <ButtonLink href={cta.href} variant="gold" withArrow>
                      {cta.label}
                    </ButtonLink>
                  </div>
                </Reveal>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
