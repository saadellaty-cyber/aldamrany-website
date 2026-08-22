import Link from 'next/link';
import { Carousel } from '@/components/ui/Carousel';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import type { ServiceItem } from '@/lib/content/collections';
import type { Locale } from '@/i18n/config';

/**
 * The services, as a row of dark cards that scrolls sideways.
 *
 * A grid would either wrap into a ragged last row or force every description
 * to the same length. A single row keeps them equal and lets the list grow
 * without the section growing taller.
 */
export function ServiceCarousel({
  services,
  locale,
  showIcons,
  moreLabel,
  label,
}: {
  services: ServiceItem[];
  locale: Locale;
  showIcons: boolean;
  /** Text of the per-card link, e.g. "More". */
  moreLabel: string;
  /** Accessible name for the row. */
  label: string;
}) {
  if (services.length === 0) return null;

  return (
    <Carousel label={label}>
      {services.map((service) => {
        const icon = showIcons ? resolveIcon(service.icon, service.slug) : null;

        return (
          <article
            key={service.id}
            className="card-dark flex h-full flex-col p-6 transition-colors duration-300 hover:border-gold/40"
          >
            {icon ? (
              <Icon name={icon} className="mb-5 size-9 shrink-0 text-gold" />
            ) : null}

            <h3 className="text-base font-semibold tracking-tight text-paper">{service.title}</h3>

            {service.description.length > 0 ? (
              <p className="mt-3 flex-1 text-[0.8125rem] leading-[2] text-paper/55">
                {service.description[0]}
              </p>
            ) : (
              <span className="flex-1" />
            )}

            <Link
              href={`/${locale}/services#${service.slug}`}
              className="mt-6 inline-flex h-9 w-fit items-center justify-center rounded-[var(--radius-control)] border border-gold/45 px-5 text-xs font-medium text-gold transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-night"
            >
              {moreLabel}
            </Link>
          </article>
        );
      })}
    </Carousel>
  );
}
