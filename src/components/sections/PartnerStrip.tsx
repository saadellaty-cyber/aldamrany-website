import { Reveal } from '@/components/motion/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';
import type { PartnerItem } from '@/lib/content/news';

/**
 * The partners strip.
 *
 * Logos arrive in every colour and weight, so each is held in a panel of its
 * own at a fixed height and contained rather than cropped — a strip of logos
 * looks disorderly the moment one is allowed to set its own size.
 */
export function PartnerStrip({ partners }: { partners: PartnerItem[] }) {
  if (partners.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {partners.map((partner, index) => {
        const logo = (
          <span className="card-dark flex h-24 items-center justify-center p-5 transition-colors duration-300 hover:border-gold/40">
            <SmartImage
              image={partner.logo}
              sizes="12rem"
              className="h-full w-full"
              imageClassName="object-contain"
            />
          </span>
        );

        return (
          <li key={partner.id}>
            <Reveal delay={(index % 5) * 0.05}>
              {partner.url ? (
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={partner.name}
                  className="block"
                >
                  {logo}
                </a>
              ) : (
                <span aria-label={partner.name} className="block">
                  {logo}
                </span>
              )}
            </Reveal>
          </li>
        );
      })}
    </ul>
  );
}
