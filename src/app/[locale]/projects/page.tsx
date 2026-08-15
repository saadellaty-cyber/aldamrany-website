import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { PageHero } from '@/components/site/PageHero';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { Reveal } from '@/components/motion/Reveal';
import { getPage } from '@/lib/content/pages';
import { getProjectFilterOptions, listProjects, type ProjectFilters as Filters } from '@/lib/content/projects';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('projects', locale);
  return buildMetadata({
    locale,
    path: '/projects',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description,
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

function readFilters(searchParams: Record<string, string | string[] | undefined>): Filters {
  const read = (key: string) => {
    const value = searchParams[key];
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
  };

  return {
    governorate: read('governorate'),
    sector: read('sector'),
    collection: read('collection'),
    year: read('year'),
    status: read('status'),
    q: read('q'),
  };
}

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const filters = readFilters(resolvedSearchParams);

  const [t, page, projects, options] = await Promise.all([
    getTranslations(),
    getPage('projects', locale),
    listProjects(locale, filters),
    getProjectFilterOptions(locale),
  ]);

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: page?.title ?? t('projects.title'), path: '/projects' },
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
        eyebrow={page?.eyebrow ?? t('projects.eyebrow')}
        title={page?.title ?? t('projects.title')}
        intro={page?.intro}
        image={page?.hero}
      />

      <section className="section-y">
        <div className="container-page">
          <Suspense fallback={<div className="h-20" />}>
            <ProjectFilters options={options} resultCount={projects.length} />
          </Suspense>

          {projects.length === 0 ? (
            <div className="border-b border-line py-24 text-center">
              <p className="display-4">{t('projects.empty')}</p>
              <p className="mt-4 text-sm text-ink-muted">{t('projects.emptyHint')}</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-20">
              {projects.map((project, index) => (
                <Reveal key={project.id} delay={(index % 3) * 0.08} distance={34}>
                  <ProjectCard
                    project={project}
                    ratio={index % 5 === 0 ? 'portrait' : 'landscape'}
                    priority={index < 3}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <ContactCTA locale={locale} />
    </>
  );
}
