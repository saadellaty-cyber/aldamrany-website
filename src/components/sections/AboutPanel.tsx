import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SmartImage } from '@/components/ui/SmartImage';
import { cn } from '@/lib/utils';
import type { ImageRef } from '@/lib/content/media';

/**
 * The company introduction, on a cream band running the full width of the page.
 *
 * This is the one long passage on the homepage, and long prose is tiring in
 * paper-on-black. Putting it on a light ground gives the reading its own space
 * and marks it as the moment the page slows down.
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
    <section className="band-light">
      <div className="mx-auto max-w-[120rem]">
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

          {/* Without a photograph beside it the column is the full width of the
              screen, and prose set across 1400px is unreadable — so the text is
              held to a measure and centred rather than allowed to run. */}
          <div className={image ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <div
              className={cn(
                'px-5 py-10 md:px-10 md:py-14 lg:py-16 xl:px-16',
                !image && 'mx-auto max-w-4xl',
              )}
            >
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
