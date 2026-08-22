import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/PageHero';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { getPage } from '@/lib/content/pages';
import { getCapabilities } from '@/lib/content/collections';
import { getSiteSettings } from '@/lib/content/site';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';
import { CapabilityBands } from '@/components/sections/CapabilityBands';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('capabilities', locale);
  return buildMetadata({
    locale,
    path: '/capabilities',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description ?? page?.intro[0],
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function CapabilitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, page, capabilities, settings] = await Promise.all([
    getTranslations(),
    getPage('capabilities', locale),
    getCapabilities(locale),
    getSiteSettings(),
  ]);

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: page?.title ?? t('nav.capabilities'), path: '/capabilities' },
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

      {capabilities.length > 0 ? (
        <section className="bg-night px-5 py-10 md:px-10 md:py-14 xl:px-16">
          <div className="panel-light mx-auto max-w-[96rem] px-6 py-10 md:px-10 md:py-12">
            <CapabilityBands
              capabilities={capabilities}
              locale={locale}
              showIcons={settings.showIcons}
              withDescriptions
            />
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} />
    </>
  );
}
