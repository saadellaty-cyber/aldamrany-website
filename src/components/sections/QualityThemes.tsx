import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import type { QualityItem } from '@/lib/content/collections';
import { cn } from '@/lib/utils';

/**
 * Quality and safety themes shown as two hairline-separated columns.
 * Themes without body copy still read as intentional — the title carries them.
 */
export function QualityThemes({
  items,
  labels,
  tone = 'light',
  showIcons = true,
}: {
  items: QualityItem[];
  labels: { quality: string; safety: string };
  tone?: 'light' | 'dark';
  showIcons?: boolean;
}) {
  const quality = items.filter((item) => item.category === 'QUALITY');
  const safety = items.filter((item) => item.category === 'SAFETY');

  if (quality.length === 0 && safety.length === 0) return null;

  const muted = tone === 'dark' ? 'text-paper/50' : 'text-ink-muted';
  // Yellow reads on the dark band; on the paper ground the accent moves to a
  // hollow frame around charcoal text instead.
  const onDark = tone === 'dark';

  const column = (title: string, entries: QualityItem[]) => {
    if (entries.length === 0) return null;

    return (
      <div>
        <Reveal className="pb-6">
          {onDark ? (
            <h3 className="eyebrow heading-yellow flex items-center gap-3">
              <span className="inline-block h-px w-8 bg-current opacity-50" aria-hidden="true" />
              {title}
            </h3>
          ) : (
            <h3 className="eyebrow frame-yellow-sm">{title}</h3>
          )}
        </Reveal>

        <ul className="border-t border-current/15">
          {entries.map((item, index) => (
            <li key={item.id} className="border-b border-current/15">
              <Reveal delay={index * 0.05}>
                <div className="py-5">
                  <h4 className="flex items-center gap-3 text-lg font-medium tracking-tight">
                    {showIcons && resolveIcon(item.icon, item.slug) ? (
                      <Icon
                        name={resolveIcon(item.icon, item.slug)!}
                        className={cn('size-5', onDark ? 'heading-yellow' : 'heading-gold-calm')}
                      />
                    ) : null}
                    {item.title}
                  </h4>
                  {item.body.length > 0 ? (
                    <div className={cn('prose-editorial mt-3 text-sm', muted)}>
                      {item.body.map((paragraph, paragraphIndex) => (
                        <p key={paragraphIndex}>{paragraph}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
      {column(labels.quality, quality)}
      {column(labels.safety, safety)}
    </div>
  );
}
