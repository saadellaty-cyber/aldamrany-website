import { SmartImage } from '@/components/ui/SmartImage';
import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import type { ImageRef } from '@/lib/content/media';
import { cn } from '@/lib/utils';

/**
 * Dark opening band shared by every inner page.
 *
 * Keeping a dark surface at the top of each route is what lets the sticky
 * header sit transparently over the page and stay legible before it condenses.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  size = 'default',
}: {
  eyebrow?: string | null;
  title?: string | null;
  intro?: string[];
  image?: ImageRef | null;
  size?: 'default' | 'tall';
}) {
  return (
    <section
      className={cn(
        'surface-dark relative flex items-end overflow-hidden',
        size === 'tall' ? 'min-h-[72vh] md:min-h-[80vh]' : 'min-h-[52vh] md:min-h-[58vh]',
      )}
    >
      {image ? (
        <>
          <SmartImage
            image={image}
            sizes="100vw"
            priority
            className="absolute inset-0 h-full w-full"
            placeholderTone="dark"
            placeholderBare
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40"
          />
        </>
      ) : null}

      <div className="container-page relative z-10 pb-14 pt-32 md:pb-20 md:pt-40">
        {eyebrow ? (
          <Reveal>
            <p className="eyebrow text-gold flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-current opacity-60" aria-hidden="true" />
              {eyebrow}
            </p>
          </Reveal>
        ) : null}

        {title ? (
          <h1 className="mt-6 max-w-[20ch] text-balance text-3xl font-semibold leading-[1.3] text-paper md:text-4xl">
            <RevealHeading>{title}</RevealHeading>
          </h1>
        ) : null}

        {intro && intro.length > 0 ? (
          <Reveal delay={0.12}>
            <div className="prose-editorial lead mt-8 max-w-2xl text-paper/70">
              {intro.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
