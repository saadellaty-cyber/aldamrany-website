import { IconGrid } from '@/components/ui/IconGrid';
import { SectionTitle } from '@/components/ui/SectionTitle';
import type { CapabilityItem } from '@/lib/content/collections';
import type { CapabilityGroup } from '@/generated/prisma/enums';

/**
 * "Why us" — the case for the company, on a cream panel.
 *
 * The content is the experience band of the capabilities, not a separate list
 * of claims: what the company brings *is* the answer, and keeping it there
 * means the owner maintains it once. The resources and fields bands belong to
 * the capabilities section further up the page, so the two never repeat each
 * other — and a list of disciplines answers "what", not "why".
 */
export function WhyUs({
  capabilities,
  title,
  description,
  showIcons,
  only = ['EXPERIENCE'],
}: {
  capabilities: CapabilityItem[];
  title: string;
  description?: string | null;
  showIcons: boolean;
  /** Which capability bands answer "why". */
  only?: CapabilityGroup[];
}) {
  const reasons = capabilities.filter((item) => only.includes(item.group));
  if (reasons.length === 0) return null;

  return (
    <section className="bg-night px-5 py-4 md:px-10 xl:px-16">
      <div className="panel-light mx-auto max-w-[96rem] px-6 py-12 md:px-10 md:py-14">
        <SectionTitle title={title} description={description} tone="light" />
        <IconGrid items={reasons} showIcons={showIcons} className="mt-12" />
      </div>
    </section>
  );
}
