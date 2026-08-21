import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/PageHero';
import { QualityThemes } from '@/components/sections/QualityThemes';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { getPage } from '@/lib/content/pages';
import { getQualitySections } from '@/lib/content/collections';
import { getSiteSettings } from '@/lib/content/site';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('quality-safety', locale);
  return buildMetadata({
    locale,
    path: '/quality-safety',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description ?? page?.intro[0],
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function QualitySafetyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, page, items, settings] = await Promise.all([
    getTranslations(),
    getPage('quality-safety', locale),
    getQualitySections(locale),
    getSiteSettings(),
  ]);

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: page?.title ?? t('nav.qualitySafety'), path: '/quality-safety' },
    ],
    locale,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />

      <PageHero
        eyebrow={page?.eyebrow}
        title={page?.title}
        intro={page?.intro}
        image={page?.hero}
      />

      {items.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <QualityThemes
              showIcons={settings.showIcons}
              items={items}
              labels={{
                quality: locale === 'ar' ? 'الجودة' : 'Quality',
                safety: locale === 'ar' ? 'السلامة' : 'Safety',
              }}
            />
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} />
    </>
  );
}
