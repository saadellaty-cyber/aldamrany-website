import { CircleCheck } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { resolveIcon } from '@/lib/icons';
import type { QualityItem } from '@/lib/content/collections';
import type { ImageRef } from '@/lib/content/media';

/**
 * Quality and safety, as a matched pair of panels.
 *
 * The two are separate commitments read as a comparison, so they get one shape
 * each rather than two columns of a shared list. Each panel carries its own
 * photograph behind a heavy scrim — the site work is the evidence for the
 * claim, and putting it behind the text says so without a caption.
 *
 * Both the backdrop and the opening statement come from the themes themselves,
 * so the owner fills a panel by editing one theme rather than by finding a
 * separate setting: the first theme carrying a description supplies the
 * statement, and the first carrying an image supplies the backdrop.
 */
export function QualityThemes({
  items,
  labels,
  showIcons = true,
  /** Used behind a panel whose own themes carry no image. */
  fallbackImage,
}: {
  items: QualityItem[];
  labels: { quality: string; safety: string };
  showIcons?: boolean;
  fallbackImage?: ImageRef | null;
}) {
  const quality = items.filter((item) => item.category === 'QUALITY');
  const safety = items.filter((item) => item.category === 'SAFETY');

  if (quality.length === 0 && safety.length === 0) return null;

  const panel = (title: string, entries: QualityItem[]) => {
    if (entries.length === 0) return null;

    // A theme only becomes the panel's opening statement if it actually has
    // one. Otherwise nothing is promoted and every theme stays in the list —
    // dropping the first item to introduce a statement that does not exist
    // would just lose a line.
    const lead = entries.find((item) => item.body.length > 0) ?? null;
    const listed = lead ? entries.filter((item) => item.id !== lead.id) : entries;

    const image = entries.find((item) => item.image)?.image ?? fallbackImage ?? null;
    const markIcon = showIcons ? resolveIcon(entries[0].icon, entries[0].slug) : null;

    return (
      <Reveal className="h-full">
        <article className="panel-dark relative h-full overflow-hidden">
          {image ? (
            <>
              <div aria-hidden="true" className="absolute inset-0">
                <SmartImage
                  image={image}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-full w-full"
                  placeholderTone="dark"
                  placeholderBare
                />
              </div>
              {/* Two layers: a flat scrim that guarantees legibility over any
                  photograph, and a gradient that lifts it further behind the
                  text and lets the picture through on the far side. The
                  gradient direction follows the reading direction. */}
              <div aria-hidden="true" className="absolute inset-0 bg-night/70" />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-night via-night/80 to-night/25 rtl:bg-gradient-to-l"
              />
            </>
          ) : null}

          <div className="relative p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold tracking-tight text-gold md:text-2xl">
                {title}
              </h3>
              {markIcon ? (
                <Icon name={markIcon} className="size-9 shrink-0 text-gold/60" />
              ) : null}
            </div>

            {lead ? (
              <p className="mt-4 max-w-md text-sm leading-[2] text-paper/75 md:text-[0.9375rem]">
                {lead.body[0]}
              </p>
            ) : null}

            <ul className="mt-6 space-y-3.5">
              {listed.map((item) => (
                <li key={item.id} className="flex items-start gap-3 text-sm text-paper/80">
                  <CircleCheck
                    className="mt-0.5 size-4 shrink-0 text-gold"
                    aria-hidden="true"
                  />
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </Reveal>
    );
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {panel(labels.safety, safety)}
      {panel(labels.quality, quality)}
    </div>
  );
}
