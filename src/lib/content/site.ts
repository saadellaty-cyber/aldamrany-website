import { cache } from 'react';
import { prisma } from '@/lib/db';
import { mediaUrl } from '@/lib/content/media';
import { mailtoLink, telLink, whatsappLink } from '@/lib/utils';
import { pick, type Locale } from '@/i18n/config';
import type { NavLocation, SocialPlatform } from '@/generated/prisma/enums';

const SETTINGS_ID = 'default';

const settingsInclude = {
  logoPrimary: true,
  logoDark: true,
  logoLight: true,
  logoMobile: true,
  favicon: true,
  ogImage: true,
} as const;

/**
 * Loads the singleton settings row, creating it on first access so a fresh
 * database never leaves the admin with nothing to edit.
 * `cache` dedupes the query across a single render pass.
 */
export const getSiteSettings = cache(async () => {
  const existing = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_ID },
    include: settingsInclude,
  });
  if (existing) return existing;

  return prisma.siteSetting.create({
    data: { id: SETTINGS_ID },
    include: settingsInclude,
  });
});

export type SiteSettings = Awaited<ReturnType<typeof getSiteSettings>>;

/** Contact channels reduced to exactly what the site should render. */
export type ContactChannels = {
  phone: string | null;
  phoneHref: string | null;
  mobile: string | null;
  mobileHref: string | null;
  email: string | null;
  emailHref: string | null;
  whatsappNumber: string | null;
  whatsappHref: string | null;
  whatsappFloating: boolean;
  headOffice: string | null;
  branch: string | null;
  googleMapsUrl: string | null;
};

export function contactChannels(settings: SiteSettings, locale: Locale): ContactChannels {
  return {
    phone: settings.phone,
    phoneHref: telLink(settings.phone),
    mobile: settings.mobile,
    mobileHref: telLink(settings.mobile),
    email: settings.email,
    emailHref: mailtoLink(settings.email),
    whatsappNumber: settings.whatsappNumber,
    whatsappHref: whatsappLink(settings.whatsappNumber),
    whatsappFloating: settings.whatsappFloatingEnabled && Boolean(whatsappLink(settings.whatsappNumber)),
    headOffice: pick(locale, settings.headOfficeAr, settings.headOfficeEn),
    branch: pick(locale, settings.branchAr, settings.branchEn),
    googleMapsUrl: settings.googleMapsUrl,
  };
}

export type BrandAssets = {
  companyName: string | null;
  tagline: string | null;
  logoLight: string | null;
  logoDark: string | null;
  logoMobile: string | null;
};

/**
 * `logoLight` is the mark shown on light backgrounds, `logoDark` the one for
 * dark surfaces; each falls back to the primary logo, and the header renders a
 * typographic wordmark when nothing has been uploaded.
 */
export function brandAssets(settings: SiteSettings, locale: Locale): BrandAssets {
  const primary = mediaUrl(settings.logoPrimary);
  return {
    companyName: pick(locale, settings.companyNameAr, settings.companyNameEn),
    tagline: pick(locale, settings.taglineAr, settings.taglineEn),
    logoLight: mediaUrl(settings.logoLight) ?? primary,
    logoDark: mediaUrl(settings.logoDark) ?? primary,
    logoMobile: mediaUrl(settings.logoMobile) ?? primary,
  };
}

export type SocialItem = { platform: SocialPlatform; url: string };

/** Only links that actually have a URL are returned — never invented ones. */
export const getSocialLinks = cache(async (): Promise<SocialItem[]> => {
  const rows = await prisma.socialLink.findMany({
    where: { enabled: true, NOT: { url: null } },
    orderBy: { sortOrder: 'asc' },
  });

  return rows
    .filter((row): row is typeof row & { url: string } => Boolean(row.url?.trim()))
    .map((row) => ({ platform: row.platform, url: row.url.trim() }));
});

export type NavItem = { id: string; label: string; href: string; isExternal: boolean };

export const getNavigation = cache(async (location: NavLocation, locale: Locale): Promise<NavItem[]> => {
  const rows = await prisma.navigationItem.findMany({
    where: { location, enabled: true },
    orderBy: { sortOrder: 'asc' },
  });

  return rows.map((row) => ({
    id: row.id,
    label: pick(locale, row.labelAr, row.labelEn) ?? row.href,
    href: row.isExternal ? row.href : `/${locale}${row.href.startsWith('/') ? row.href : `/${row.href}`}`,
    isExternal: row.isExternal,
  }));
});
