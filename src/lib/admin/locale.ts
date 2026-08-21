import { cache } from 'react';
import { prisma } from '@/lib/db';
import { adminT, isAdminLocale, type AdminLocale, type AdminTranslator } from '@/lib/admin/i18n';

/**
 * The language the dashboard is presented in.
 *
 * Stored alongside the other site settings rather than per user: this is a
 * single-owner dashboard, and one switch is easier to explain than a per-account
 * preference. Falls back to Arabic if the row does not exist yet, so a fresh
 * installation opens in the owner's language.
 */
export const getAdminLocale = cache(async (): Promise<AdminLocale> => {
  try {
    const settings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
      select: { adminLocale: true },
    });
    return isAdminLocale(settings?.adminLocale) ? settings.adminLocale : 'ar';
  } catch {
    // The dashboard must still render if the database is unreachable — the
    // page itself will surface the real error.
    return 'ar';
  }
});

/** Locale plus its translator, for server components. */
export const getAdminT = cache(
  async (): Promise<{ locale: AdminLocale; t: AdminTranslator }> => {
    const locale = await getAdminLocale();
    return { locale, t: adminT(locale) };
  },
);
