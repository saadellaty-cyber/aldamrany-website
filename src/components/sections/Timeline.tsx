import { Reveal } from '@/components/motion/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';
import type { TimelineEntry } from '@/lib/content/collections';

/**
 * Company history. Only the milestones stored in the CMS are shown — the
 * founding year stands alone until the owner adds more.
 */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <ol className="mt-12 border-t border-night-line">
      {entries.map((entry, index) => (
        <li key={entry.id} className="border-b border-night-line">
          <Reveal delay={index * 0.06}>
            <div className="grid gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-14">
              <div className="md:col-span-3">
                <span className="latin-nums text-[clamp(2.5rem,1.6rem+3vw,4.5rem)] font-medium leading-none tracking-tight text-paper/20">
                  {entry.year}
                </span>
              </div>

              <div className="md:col-span-6">
                {entry.title ? (
                  <h3 className="display-4 text-balance">
                    <span className="text-paper">{entry.title}</span>
                  </h3>
                ) : null}
                {entry.description.length > 0 ? (
                  <div className="prose-editorial mt-4 max-w-xl text-paper/55">
                    {entry.description.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                ) : null}
              </div>

              {entry.image ? (
                <div className="md:col-span-3">
                  <SmartImage
                    image={entry.image}
                    sizes="(min-width: 768px) 25vw, 100vw"
                    className="aspect-[4/3] w-full"
                  />
                </div>
              ) : null}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
