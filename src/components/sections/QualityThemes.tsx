import { Check } from 'lucide-react';
import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { SmartImage } from '@/components/ui/SmartImage';
import { resolveIcon } from '@/lib/icons';
import type { QualityItem } from '@/lib/content/collections';
import type { ImageRef } from '@/lib/content/media';

/**
 * Quality and safety, as a matched pair of panels.
 *
 * The two are separate commitments and are read as a comparison, so they get
 * one shape each rather than two columns of a shared list. Each panel carries
 * its own photograph behind a heavy scrim — the site work is the evidence for
 * the claim, and putting it behind the text says so without a caption.
 */
export function QualityThemes({
  items,
  labels,
  showIcons = true,
  images,
}: {
  items: QualityItem[];
  labels: { quality: string; safety: string };
  showIcons?: boolean;
  /** Optional backdrop per panel. */
  images?: { quality?: ImageRef | null; safety?: ImageRef | null };
}) {
  const quality = items.filter((item) => item.category === 'QUALITY');
  const safety = items.filter((item) => item.category === 'SAFETY');

  if (quality.length === 0 && safety.length === 0) return null;

  const panel = (title: string, entries: QualityItem[], image: ImageRef | null | undefined) => {
    if (entries.length === 0) return null;

    // The lead theme's prose introduces the panel; the rest become the list.
    const [lead, ...rest] = entries;
    const listed = rest.length > 0 ? rest : entries;

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
              <div aria-hidden="true" className="absolute inset-0 bg-night/88" />
            </>
          ) : null}

          <div className="relative p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold tracking-tight text-gold">{title}</h3>
              {showIcons && resolveIcon(lead.icon, lead.slug) ? (
                <Icon
                  name={resolveIcon(lead.icon, lead.slug)!}
                  className="size-8 shrink-0 text-gold/70"
                />
              ) : null}
            </div>

            {lead.body.length > 0 ? (
              <p className="mt-4 text-sm leading-[2] text-paper/65">{lead.body[0]}</p>
            ) : null}

            <ul className="mt-6 space-y-3">
              {listed.map((item) => (
                <li key={item.id} className="flex items-start gap-3 text-sm text-paper/80">
                  <Check className="mt-1 size-3.5 shrink-0 text-gold" aria-hidden="true" />
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
      {panel(labels.safety, safety, images?.safety)}
      {panel(labels.quality, quality, images?.quality)}
    </div>
  );
}
