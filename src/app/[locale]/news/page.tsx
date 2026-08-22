import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/PageHero';
import { NewsList } from '@/components/sections/NewsList';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { getNews } from '@/lib/content/news';
import { getPage } from '@/lib/content/pages';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('news', locale);
  return buildMetadata({
    locale,
    path: '/news',
    title: page?.seo.title,
    description: page?.seo.description,
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, page, items] = await Promise.all([
    getTranslations(),
    getPage('news', locale),
    getNews(locale),
  ]);

  const breadcrumbs = breadcrumbJsonLd(
    [{ name: page?.title ?? t('news.title'), path: '/news' }],
    locale,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />

      <PageHero
        eyebrow={page?.eyebrow ?? t('news.eyebrow')}
        title={page?.title ?? t('news.title')}
        intro={page?.intro}
        image={page?.hero}
      />

      <section className="section-y">
        <div className="container-page">
          {items.length > 0 ? (
            <NewsList items={items} locale={locale} />
          ) : (
            <p className="py-10 text-center text-sm text-paper/55">{t('news.empty')}</p>
          )}
        </div>
      </section>

      <ContactCTA locale={locale} />
    </>
  );
}
