import { IconGrid } from '@/components/ui/IconGrid';
import { SectionTitle } from '@/components/ui/SectionTitle';
import type { AdvantageItem } from '@/lib/content/collections';

/**
 * "Why us" — the case for the company, on a cream panel.
 *
 * Its own content rather than a slice of the capabilities. Drawing both bands
 * from one table meant they competed: whatever this section took, the
 * capabilities grid lost, which is what left that grid missing items.
 *
 * Stays off the page until at least one reason is published.
 */
export function WhyUs({
  reasons,
  title,
  description,
  showIcons,
}: {
  reasons: AdvantageItem[];
  title: string;
  description?: string | null;
  showIcons: boolean;
}) {
  if (reasons.length === 0) return null;

  return (
    <section className="band-light py-14 md:py-20">
      <div className="container-page">
        <SectionTitle title={title} description={description} tone="light" />
        <IconGrid items={reasons} showIcons={showIcons} className="mt-12" />
      </div>
    </section>
  );
}
