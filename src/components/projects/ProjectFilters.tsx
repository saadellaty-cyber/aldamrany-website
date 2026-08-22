'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import type { FilterOption, ProjectFilterOptions } from '@/lib/content/projects';
import { cn } from '@/lib/utils';

type FilterKey = 'governorate' | 'sector' | 'collection' | 'year' | 'status';

/**
 * Archive filters. Every change is written to the query string, so a filtered
 * view can be shared, bookmarked and restored with the back button.
 */
export function ProjectFilters({
  options,
  resultCount,
}: {
  options: ProjectFilterOptions;
  resultCount: number;
}) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const firstRender = useRef(true);

  const current = (key: FilterKey) => searchParams.get(key) ?? '';

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const queryString = params.toString();
    startTransition(() => {
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const setFilter = (key: FilterKey, value: string) => {
    pushParams((params) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
  };

  // Debounce the free-text search so typing does not fire a request per keystroke.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      pushParams((params) => {
        const trimmed = query.trim();
        if (trimmed) params.set('q', trimmed);
        else params.delete('q');
      });
    }, 350);

    return () => window.clearTimeout(timeout);
    // `pushParams` is recreated per render by design; the query text is the trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const hasFilters = Boolean(
    searchParams.get('governorate') ||
      searchParams.get('sector') ||
      searchParams.get('collection') ||
      searchParams.get('year') ||
      searchParams.get('status') ||
      searchParams.get('q'),
  );

  const allSelects: Array<{ key: FilterKey; label: string; items: FilterOption[] }> = [
    { key: 'sector', label: t('projects.sector'), items: options.sectors },
    { key: 'governorate', label: t('projects.governorate'), items: options.governorates },
    { key: 'collection', label: t('projects.collection'), items: options.collections },
    { key: 'year', label: t('projects.year'), items: options.years },
    {
      key: 'status',
      label: t('projects.status'),
      items: options.statuses.map((status) => ({
        ...status,
        label: t(`projectStatus.${status.value as 'PLANNED' | 'ONGOING' | 'COMPLETED'}`),
      })),
    },
  ];

  // Hide a dropdown entirely when no published project carries that dimension.
  const selects = allSelects.filter((select) => select.items.length > 0);

  return (
    <div className={cn('transition-opacity duration-200', isPending && 'opacity-60')}>
      <div className="flex flex-col gap-5 border-y border-night-line py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {selects.map((select) => (
            <label key={select.key} className="relative">
              <span className="sr-only">{select.label}</span>
              <select
                value={current(select.key)}
                onChange={(event) => setFilter(select.key, event.target.value)}
                className={cn(
                  'h-10 cursor-pointer appearance-none border bg-transparent ps-3 pe-9 text-sm transition-colors',
                  'focus:outline-none focus-visible:border-ink',
                  current(select.key) ? 'border-gold text-gold' : 'border-night-line hover:border-gold/50',
                )}
              >
                <option value="">
                  {select.label} — {t('projects.all')}
                </option>
                {select.items.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label} ({item.count})
                  </option>
                ))}
              </select>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-xs opacity-50"
              >
                ▾
              </span>
            </label>
          ))}

          {hasFilters ? (
            <button
              type="button"
              onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
              className="inline-flex h-10 items-center gap-1.5 px-2 text-sm text-paper/55 underline-offset-4 transition-colors hover:text-gold hover:underline"
            >
              <X className="size-3.5" aria-hidden="true" />
              {t('projects.clearFilters')}
            </button>
          ) : null}
        </div>

        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-paper/55 lg:block" aria-live="polite">
            {t('projects.resultsCount', { count: resultCount })}
          </p>

          <label className="relative flex-1 lg:w-64 lg:flex-none">
            <span className="sr-only">{t('common.search')}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 opacity-45"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('projects.searchPlaceholder')}
              className="h-10 w-full border border-night-line bg-transparent ps-9 pe-3 text-sm transition-colors placeholder:text-paper/40 focus:border-gold focus:outline-none"
            />
          </label>
        </div>
      </div>

      <p className="pt-4 text-sm text-paper/55 lg:hidden" aria-live="polite">
        {t('projects.resultsCount', { count: resultCount })}
      </p>
    </div>
  );
}
