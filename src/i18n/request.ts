import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/i18n/config';

/**
 * Resolves messages for the active request. The locale comes from the
 * `[locale]` route segment, published via `setRequestLocale` in the layout.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
