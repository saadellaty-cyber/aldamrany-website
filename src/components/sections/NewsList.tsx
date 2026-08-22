import Link from 'next/link';
import { Reveal } from '@/components/motion/Reveal';
import { SmartImage } from '@/components/ui/SmartImage';
import { formatDate } from '@/lib/utils';
import type { NewsCard } from '@/lib/content/news';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * News items as a stack of rows: date and headline on one side, a small
 * picture on the other.
 *
 * Rows rather than cards, because a headline is the thing being scanned and a
 * row lets it run to a readable length instead of being squeezed into a
 * card-width column.
 */
export function NewsList({
  items,
  locale,
  className,
}: {
  items: NewsCard[];
  locale: Locale;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <ul className={cn('divide-y divide-night-line border-y border-night-line', className)}>
      {items.map((item, index) => (
        <li key={item.id}>
          <Reveal delay={(index % 4) * 0.06}>
            <Link
              href={item.href}
              className="group flex items-center gap-5 py-5 transition-opacity duration-300 hover:opacity-80 md:gap-8"
            >
              <div className="min-w-0 flex-1">
                <time
                  dateTime={item.publishedAt.toISOString()}
                  className="latin-nums text-xs text-gold"
                >
                  {formatDate(item.publishedAt, locale)}
                </time>

                <h3 className="mt-2 text-balance text-base font-semibold leading-snug text-paper md:text-lg">
                  {item.title}
                </h3>

                {item.excerpt ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-paper/55">
                    {item.excerpt}
                  </p>
                ) : null}
              </div>

              {item.image ? (
                <div className="w-24 shrink-0 overflow-hidden rounded-[var(--radius-card)] sm:w-32 md:w-40">
                  <div className="aspect-[4/3]">
                    <SmartImage
                      image={item.image}
                      sizes="(min-width: 768px) 10rem, 6rem"
                      className="h-full w-full"
                      imageClassName="transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              ) : null}
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
