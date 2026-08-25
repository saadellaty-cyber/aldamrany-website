import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import { SmartImage } from '@/components/ui/SmartImage';
import type { ServiceItem } from '@/lib/content/collections';
import { cn } from '@/lib/utils';

/**
 * Services rendered as full-width editorial bands — a large index, a
 * photograph and the copy — rather than a grid of identical cards.
 *
 * `tone` is the ground it sits on, not the colour of the type.
 */
export function ServiceBlocks({
  services,
  showIcons = true,
  tone = 'dark',
}: {
  services: ServiceItem[];
  showIcons?: boolean;
  tone?: 'dark' | 'light';
}) {
  if (services.length === 0) return null;

  const onDark = tone === 'dark';
  const rule = onDark ? 'border-night-line' : 'border-gold-calm/25';
  const muted = onDark ? 'text-paper/55' : 'text-ink/60';
  const heading = onDark ? 'text-paper' : 'text-ink';
  const mark = onDark ? 'text-gold' : 'text-gold-calm';

  return (
    <div className="flex flex-col">
      {services.map((service, index) => {
        const reversed = index % 2 === 1;

        return (
          <article
            key={service.id}
            id={service.slug}
            className={cn(
              'group grid scroll-mt-24 items-center gap-8 border-t py-12 lg:grid-cols-12 lg:gap-14 lg:py-16',
              rule,
              index === 0 && 'border-t-0 pt-0',
            )}
          >
            <Reveal
              className={cn('lg:col-span-6', reversed && 'lg:order-2')}
              distance={36}
              delay={0.05}
            >
              <SmartImage
                image={service.image}
                sizes="(min-width: 1024px) 50vw, 100vw"
                topicSlug={service.slug}
                placeholderLabel={service.title}
                className="aspect-[4/3] w-full rounded-[var(--radius-card)]"
                imageClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            </Reveal>

            <div className={cn('lg:col-span-6', reversed && 'lg:order-1')}>
              <Reveal>
                <span className={cn('flex items-center gap-3', muted)}>
                  {showIcons && resolveIcon(service.icon, service.slug) ? (
                    <Icon
                      name={resolveIcon(service.icon, service.slug)!}
                      className={cn('size-7', mark)}
                    />
                  ) : null}
                  <span className="latin-nums text-sm font-medium tracking-[0.2em]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
              </Reveal>

              <h3
                className={cn(
                  'mt-5 text-balance text-2xl font-semibold tracking-tight',
                  heading,
                )}
              >
                <RevealHeading>{service.title}</RevealHeading>
              </h3>

              {service.description.length > 0 ? (
                <Reveal delay={0.1}>
                  <div className={cn('prose-editorial mt-6 max-w-xl', muted)}>
                    {service.description.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
