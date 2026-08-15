export const locales = ['ar', 'en'] as const;

export type Locale = (typeof locales)[number];

/** Arabic is the company's primary language and the site default. */
export const defaultLocale: Locale = 'ar';

export const localeLabels: Record<Locale, { native: string; short: string }> = {
  ar: { native: 'العربية', short: 'AR' },
  en: { native: 'English', short: 'EN' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

export function direction(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'ar' ? 'en' : 'ar';
}

/**
 * Picks the field matching the active locale, falling back to the other
 * language when a translation has not been filled in yet. Returns null when
 * neither is present so callers can hide the block entirely.
 */
export function pick(
  locale: Locale,
  arabic: string | null | undefined,
  english: string | null | undefined,
): string | null {
  const primary = locale === 'ar' ? arabic : english;
  const fallback = locale === 'ar' ? english : arabic;
  const chosen = primary?.trim() || fallback?.trim();
  return chosen ? chosen : null;
}

/** Best-effort locale negotiation from an Accept-Language header. */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return { tag: tag.trim().toLowerCase(), quality: q ? Number(q.split('=')[1]) || 0 : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of ranked) {
    if (tag.startsWith('ar')) return 'ar';
    if (tag.startsWith('en')) return 'en';
  }
  return defaultLocale;
}
