import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import { SmartImage } from '@/components/ui/SmartImage';
import type { ServiceItem } from '@/lib/content/collections';
import { cn } from '@/lib/utils';

/**
 * Services rendered as full-width editorial bands — a large index, a
 * photograph and the copy — rather than a grid of identical cards.
 */
export function ServiceBlocks({
  services,
  showIcons = true,
}: {
  services: ServiceItem[];
  showIcons?: boolean;
}) {
  if (services.length === 0) return null;

  return (
    <div className="flex flex-col">
      {services.map((service, index) => {
        const reversed = index % 2 === 1;

        return (
          <article
            key={service.id}
            id={service.slug}
            className={cn(
              'group grid scroll-mt-24 items-center gap-8 border-t border-line py-12 lg:grid-cols-12 lg:gap-14 lg:py-16',
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
                className="aspect-[4/3] w-full"
                imageClassName="transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
              />
            </Reveal>

            <div className={cn('lg:col-span-6', reversed && 'lg:order-1')}>
              <Reveal>
                <span className="flex items-center gap-3 text-ink-muted">
                  {showIcons && resolveIcon(service.icon, service.slug) ? (
                    <Icon
                      name={resolveIcon(service.icon, service.slug)!}
                      className="size-7 text-gold-dim"
                    />
                  ) : null}
                  <span className="latin-nums text-sm font-medium tracking-[0.2em]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </span>
              </Reveal>

              <h3 className="display-3 mt-5 text-balance">
                <RevealHeading>{service.title}</RevealHeading>
              </h3>

              {service.description.length > 0 ? (
                <Reveal delay={0.1}>
                  <div className="prose-editorial mt-6 max-w-xl text-ink-muted">
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

/**
 * Condensed variant for the homepage: a numbered list of services with a
 * single shared image, keeping the page from becoming a stack of photos.
 */
export function ServiceList({
  services,
  showIcons = true,
}: {
  services: ServiceItem[];
  showIcons?: boolean;
}) {
  if (services.length === 0) return null;

  return (
    <ul className="mt-14 border-t border-line">
      {services.map((service, index) => (
        <li key={service.id} className="border-b border-line">
          <Reveal delay={index * 0.05}>
            <div className="grid items-baseline gap-3 py-7 md:grid-cols-12 md:gap-8 md:py-9">
              <span className="flex items-center gap-2.5 text-ink-muted md:col-span-1">
                {showIcons && resolveIcon(service.icon, service.slug) ? (
                  <Icon
                    name={resolveIcon(service.icon, service.slug)!}
                    className="size-5 text-gold-dim"
                  />
                ) : null}
                <span className="latin-nums text-sm font-medium tracking-[0.2em]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </span>

              <h3 className="display-4 text-balance md:col-span-5">{service.title}</h3>

              {service.description.length > 0 ? (
                <p className="max-w-prose text-sm leading-relaxed text-ink-muted md:col-span-6">
                  {service.description[0]}
                </p>
              ) : null}
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
