import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import { groupCapabilities, type CapabilityItem } from '@/lib/content/collections';
import type { Locale } from '@/i18n/config';

/**
 * The capabilities, read as three ideas rather than one list.
 *
 * A flat run of nine items — technical expertise, roads, paving, concrete —
 * mixes what the company knows how to do with what it works on, and reads as a
 * services menu. Splitting it into what we bring, what we have and where we
 * work makes the section legible at a glance.
 *
 * Each band is a labelled row: the eye travels down the three labels first and
 * across the items second, instead of hunting through two columns of unrelated
 * things.
 */
export function CapabilityBands({
  capabilities,
  locale,
  showIcons,
  /** The dedicated page shows each item's description; the homepage does not. */
  withDescriptions = false,
}: {
  capabilities: CapabilityItem[];
  locale: Locale;
  showIcons: boolean;
  withDescriptions?: boolean;
}) {
  const bands = groupCapabilities(capabilities, locale);
  if (bands.length === 0) return null;

  return (
    <div className="divide-y divide-[var(--color-gold-calm)]/25 border-y border-[var(--color-gold-calm)]/25">
      {bands.map((band, bandIndex) => {
        // Descriptions are optional content. A band whose items are bare names
        // would leave half the grid empty, so it flows as a wrapped row instead
        // of holding open a two-column layout for text that is not there.
        const described = withDescriptions && band.items.some((item) => item.description.length > 0);

        return (
          <section
            key={band.group}
            className="grid gap-x-10 gap-y-5 py-9 md:grid-cols-12 md:py-11"
          >
            <Reveal delay={bandIndex * 0.05} className="md:col-span-3">
              <h3 className="eyebrow heading-gold-calm flex items-center gap-3">
                <span className="inline-block h-px w-6 shrink-0 bg-current opacity-60" aria-hidden="true" />
                <span className="text-balance">{band.label}</span>
              </h3>
            </Reveal>

            <ul
              className={
                described
                  ? 'grid gap-x-10 gap-y-7 md:col-span-9 md:grid-cols-2'
                  : 'flex flex-wrap gap-x-10 gap-y-4 md:col-span-9'
              }
            >
              {band.items.map((item, index) => {
                const icon = showIcons ? resolveIcon(item.icon, item.slug) : null;

                return (
                  <li key={item.id}>
                    <Reveal delay={bandIndex * 0.05 + index * 0.04}>
                      <p className="flex items-center gap-2.5 text-lg font-medium tracking-tight text-ink md:text-xl">
                        {icon ? (
                          <Icon name={icon} className="heading-gold-calm size-5 shrink-0" />
                        ) : null}
                        {item.title}
                      </p>

                      {described && item.description.length > 0 ? (
                        <div className="prose-editorial mt-2 text-sm text-ink/70">
                          {item.description.map((paragraph, paragraphIndex) => (
                            <p key={paragraphIndex}>{paragraph}</p>
                          ))}
                        </div>
                      ) : null}
                    </Reveal>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
