import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/PageHero';
import { RiskProcess } from '@/components/sections/RiskProcess';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { getPage } from '@/lib/content/pages';
import { getRiskItems } from '@/lib/content/collections';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('risk-management', locale);
  return buildMetadata({
    locale,
    path: '/risk-management',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description ?? page?.intro[0],
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function RiskManagementPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, page, steps] = await Promise.all([
    getTranslations(),
    getPage('risk-management', locale),
    getRiskItems(locale),
  ]);

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: page?.title ?? t('nav.riskManagement'), path: '/risk-management' },
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

      {steps.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <RiskProcess steps={steps} />
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} />
    </>
  );
}
