'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { locales, localeLabels, type Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

/**
 * Swaps the locale segment of the current URL, preserving the rest of the path
 * and any query string (project filters, for example).
 *
 * Project detail routes resolve by either language's slug, so the swapped URL
 * always lands on the same record; that page then redirects to its canonical
 * slug for the new language.
 */
export function LanguageSwitcher({
  locale,
  className,
  tone = 'light',
}: {
  locale: Locale;
  className?: string;
  tone?: 'light' | 'dark';
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const searchParams = useSearchParams();
  const query = searchParams?.toString();

  const pathFor = (target: Locale) => {
    const segments = pathname.split('/');
    // segments[0] is always the empty string before the leading slash.
    segments[1] = target;
    return `${segments.join('/')}${query ? `?${query}` : ''}`;
  };

  return (
    <div
      className={cn('flex items-center gap-1 text-xs font-medium tracking-wide', className)}
      role="group"
      aria-label="Language"
    >
      {locales.map((option, index) => {
        const isActive = option === locale;
        return (
          <span key={option} className="flex items-center">
            {index > 0 ? (
              <span aria-hidden="true" className="mx-1.5 opacity-30">
                /
              </span>
            ) : null}
            <Link
              href={pathFor(option)}
              hrefLang={option}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'transition-opacity duration-200',
                isActive
                  ? 'opacity-100'
                  : cn('opacity-50 hover:opacity-100', tone === 'dark' && 'opacity-60'),
              )}
            >
              {localeLabels[option].short}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
