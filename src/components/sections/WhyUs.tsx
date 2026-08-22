import { Reveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { resolveIcon } from '@/lib/icons';
import { cn } from '@/lib/utils';
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

        {/* The column count follows the number of reasons, so four never sit in
            a six-column grid with two empty cells at the end. */}
        <ul
          className={cn(
            'mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2',
            reasons.length >= 6
              ? 'lg:grid-cols-3 xl:grid-cols-6'
              : reasons.length === 5
                ? 'lg:grid-cols-5'
                : reasons.length === 4
                  ? 'lg:grid-cols-4'
                  : 'lg:grid-cols-3',
          )}
        >
          {reasons.map((reason, index) => {
            const icon = showIcons ? resolveIcon(reason.icon, reason.slug) : null;

            return (
              <li key={reason.id}>
                <Reveal delay={(index % 6) * 0.06}>
                  <div className="text-center">
                    {icon ? (
                      <Icon name={icon} className="mx-auto mb-4 size-9 text-gold-calm" />
                    ) : null}

                    <h3 className="text-sm font-semibold tracking-tight text-ink">
                      {reason.title}
                    </h3>

                    {reason.description.length > 0 ? (
                      <p className="mt-2 text-xs leading-[1.9] text-ink/60">
                        {reason.description[0]}
                      </p>
                    ) : null}
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
