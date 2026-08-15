import type { Metadata } from 'next';
import { getSiteSettings } from '@/lib/content/site';
import { mediaUrl } from '@/lib/content/media';
import { env } from '@/lib/env';
import { pick, locales, type Locale } from '@/i18n/config';
import { absoluteUrl } from '@/lib/utils';

type BuildMetadataOptions = {
  locale: Locale;
  /** Path without the locale prefix, e.g. "/projects/smouha-bridges". */
  path: string;
  title?: string | null;
  description?: string | null;
  /** Storage key of a page-specific Open Graph image. */
  ogImageKey?: string | null;
  canonicalUrl?: string | null;
  noIndex?: boolean;
  type?: 'website' | 'article';
  /** Per-locale paths for hreflang, when slugs differ between languages. */
  alternatePaths?: Partial<Record<Locale, string>>;
};

/**
 * Builds page metadata from CMS values, falling back to the site-wide defaults
 * in Site Settings. Both languages are always cross-linked with hreflang.
 */
export async function buildMetadata(options: BuildMetadataOptions): Promise<Metadata> {
  const {
    locale,
    path,
    title,
    description,
    ogImageKey,
    canonicalUrl,
    noIndex = false,
    type = 'website',
    alternatePaths,
  } = options;

  const settings = await getSiteSettings();
  const siteUrl = env.siteUrl;

  const siteName =
    pick(locale, settings.companyNameAr, settings.companyNameEn) ?? 'EL DAMARANY';
  const defaultTitle =
    pick(locale, settings.defaultSeoTitleAr, settings.defaultSeoTitleEn) ?? siteName;
  const defaultDescription = pick(
    locale,
    settings.defaultSeoDescriptionAr,
    settings.defaultSeoDescriptionEn,
  );

  const resolvedTitle = title?.trim() || defaultTitle;
  const resolvedDescription = description?.trim() || defaultDescription || undefined;

  const ogImage =
    (ogImageKey ? mediaUrl({ storageKey: ogImageKey }) : null) ?? mediaUrl(settings.ogImage);
  const absoluteOgImage = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : absoluteUrl(siteUrl, ogImage)
    : undefined;

  const canonical = canonicalUrl?.trim() || absoluteUrl(siteUrl, `/${locale}${path}`);

  const languages: Record<string, string> = {};
  for (const option of locales) {
    const localePath = alternatePaths?.[option] ?? path;
    languages[option] = absoluteUrl(siteUrl, `/${option}${localePath}`);
  }
  languages['x-default'] = languages.ar ?? canonical;

  return {
    metadataBase: new URL(siteUrl),
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: { canonical, languages },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      type,
      siteName,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
      url: canonical,
      title: resolvedTitle,
      description: resolvedDescription,
      images: absoluteOgImage ? [{ url: absoluteOgImage }] : undefined,
    },
    twitter: {
      card: absoluteOgImage ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description: resolvedDescription,
      images: absoluteOgImage ? [absoluteOgImage] : undefined,
    },
    verification: settings.googleVerification
      ? { google: settings.googleVerification }
      : undefined,
  };
}

/**
 * Organization / LocalBusiness structured data. Only fields the company has
 * actually supplied are emitted.
 */
export async function organizationJsonLd(locale: Locale) {
  const settings = await getSiteSettings();
  const socials = await import('@/lib/content/site').then((module) => module.getSocialLinks());

  const name = pick(locale, settings.companyNameAr, settings.companyNameEn) ?? 'EL DAMARANY';
  const address = pick(locale, settings.headOfficeAr, settings.headOfficeEn);
  const logo = mediaUrl(settings.logoPrimary);

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name,
    alternateName: 'EL DAMARANY',
    url: env.siteUrl,
    foundingDate: '1978',
    areaServed: { '@type': 'Country', name: 'Egypt' },
  };

  if (logo) data.logo = logo.startsWith('http') ? logo : absoluteUrl(env.siteUrl, logo);
  if (settings.email) data.email = settings.email;
  if (settings.phone) data.telephone = settings.phone;
  if (address) {
    data.address = {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: locale === 'ar' ? 'الإسكندرية' : 'Alexandria',
      addressCountry: 'EG',
    };
  }
  if (socials.length > 0) data.sameAs = socials.map((social) => social.url);

  const description = pick(
    locale,
    settings.defaultSeoDescriptionAr,
    settings.defaultSeoDescriptionEn,
  );
  if (description) data.description = description;

  return data;
}

/** Breadcrumb structured data for inner pages. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(env.siteUrl, `/${locale}${item.path}`),
    })),
  };
}

/** Serialises JSON-LD safely for embedding in a <script> tag. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
