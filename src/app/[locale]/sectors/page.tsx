import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SmartImage } from '@/components/ui/SmartImage';
import { Reveal } from '@/components/motion/Reveal';
import { getPage } from '@/lib/content/pages';
import { getProjectCollections, getSectors } from '@/lib/content/collections';
import { getSiteSettings } from '@/lib/content/site';
import { Icon } from '@/components/ui/Icon';
import { resolveIcon } from '@/lib/icons';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('sectors', locale);
  return buildMetadata({
    locale,
    path: '/sectors',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description ?? page?.intro[0],
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function SectorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, page, sectors, collections, settings] = await Promise.all([
    getTranslations(),
    getPage('sectors', locale),
    getSectors(locale),
    getProjectCollections(locale),
    getSiteSettings(),
  ]);

  // A sector is only worth linking to if published projects sit behind it.
  const withProjects = sectors.filter((sector) => sector.projectCount > 0);
  const withoutProjects = sectors.filter((sector) => sector.projectCount === 0);

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: page?.title ?? t('nav.sectors'), path: '/sectors' },
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

      {withProjects.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {withProjects.map((sector, index) => (
                <Reveal key={sector.id} delay={(index % 3) * 0.07} distance={30}>
                  <Link
                    href={`/${locale}/projects?sector=${encodeURIComponent(sector.slug)}`}
                    className="group block"
                  >
                    <SmartImage
                      image={sector.image}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      topicSlug={sector.slug}
                      placeholderLabel={sector.name}
                      className="aspect-[4/3] w-full"
                      imageClassName="transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                    />
                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <h2 className="flex items-center gap-2.5 text-xl font-semibold tracking-tight text-paper transition-colors duration-300 group-hover:text-gold">
                        {settings.showIcons && resolveIcon(sector.icon, sector.slug) ? (
                          <Icon
                            name={resolveIcon(sector.icon, sector.slug)!}
                            className="size-5 text-gold"
                          />
                        ) : null}
                        {sector.name}
                      </h2>
                      <span className="latin-nums text-sm text-ink-muted">
                        {String(sector.projectCount).padStart(2, '0')}
                      </span>
                    </div>
                    {sector.description.length > 0 ? (
                      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                        {sector.description[0]}
                      </p>
                    ) : null}
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Sectors the company works in that have no published project yet are
          listed as plain text — never presented as delivered work. */}
      {withoutProjects.length > 0 ? (
        <section className="section-y pt-0 md:pt-0 xl:pt-0">
          <div className="container-page pt-16 md:pt-20">
            <SectionHeader
              eyebrow={locale === 'ar' ? 'قطاعات أخرى' : 'Other Sectors'}
            />
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-8">
              {withoutProjects.map((sector, index) => (
                <li key={sector.id}>
                  <Reveal delay={index * 0.04}>
                    <span className="display-4 flex items-center gap-2.5 text-ink/70">
                      {settings.showIcons && resolveIcon(sector.icon, sector.slug) ? (
                        <Icon
                          name={resolveIcon(sector.icon, sector.slug)!}
                          className="size-5 text-gold"
                        />
                      ) : null}
                      {sector.name}
                    </span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {collections.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={locale === 'ar' ? 'مجموعات المشروعات' : 'Project Collections'}
            />
            <ul className="mt-10 border-t border-line">
              {collections.map((collection, index) => (
                <li key={collection.id} className="border-b border-line">
                  <Reveal delay={index * 0.05}>
                    <Link
                      href={`/${locale}/projects?collection=${encodeURIComponent(collection.slug)}`}
                      className="group flex items-center justify-between gap-6 py-7"
                    >
                      <span className="display-4 transition-opacity duration-300 group-hover:opacity-70">
                        {collection.name}
                      </span>
                      <span className="flex items-center gap-4 text-sm text-ink-muted">
                        <span className="latin-nums">
                          {String(collection.projectCount).padStart(2, '0')}
                        </span>
                        <ArrowRight
                          aria-hidden="true"
                          className="size-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
                        />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} />
    </>
  );
}
