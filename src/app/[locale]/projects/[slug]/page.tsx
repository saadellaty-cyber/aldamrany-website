import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/PageHero';
import { ProjectGallery } from '@/components/projects/ProjectGallery';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { ArrowLink } from '@/components/ui/Button';
import { getProjectBySlug, getRelatedProjects } from '@/lib/content/projects';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readPreviewToken(searchParams: Record<string, string | string[] | undefined>) {
  const value = searchParams.preview;
  return typeof value === 'string' ? value : null;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const project = await getProjectBySlug(decodeURIComponent(slug), locale, {
    previewToken: readPreviewToken(await searchParams),
  });
  if (!project) return {};

  return buildMetadata({
    locale,
    path: `/projects/${project.slug}`,
    title: project.seo.title ?? project.title,
    description: project.seo.description ?? project.summary,
    ogImageKey: project.seo.ogImage,
    canonicalUrl: project.seo.canonicalUrl,
    noIndex: project.seo.noIndex,
    type: 'article',
    alternatePaths: {
      ar: `/projects/${project.slugs.ar}`,
      en: `/projects/${project.slugs.en}`,
    },
  });
}

export default async function ProjectDetailPage({ params, searchParams }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const resolvedSearchParams = await searchParams;
  const previewToken = readPreviewToken(resolvedSearchParams);
  const decodedSlug = decodeURIComponent(slug);

  const project = await getProjectBySlug(decodedSlug, locale, { previewToken });
  if (!project) notFound();

  // Each language has its own slug; send visitors to the canonical one so the
  // language switcher never leaves a mismatched URL in the address bar.
  if (decodedSlug !== project.slug) {
    const query = previewToken ? `?preview=${encodeURIComponent(previewToken)}` : '';
    redirect(`/${locale}/projects/${encodeURIComponent(project.slug)}${query}`);
  }

  const [t, related] = await Promise.all([
    getTranslations(),
    getRelatedProjects(project, locale, 3),
  ]);

  const facts = [
    { label: t('projects.location'), value: project.location },
    { label: t('projects.sector'), value: project.sector },
    { label: t('projects.year'), value: project.year ? String(project.year) : null },
    { label: t('projects.status'), value: project.status ? t(`projectStatus.${project.status}`) : null },
    { label: t('projects.client'), value: project.client },
  ].filter((fact) => Boolean(fact.value));

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: t('projects.title'), path: '/projects' },
      { name: project.title, path: `/projects/${project.slug}` },
    ],
    locale,
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbs) }}
      />

      {project.isDraft ? (
        <p className="fixed inset-x-0 top-0 z-90 bg-warning px-4 py-2 text-center text-xs font-medium text-paper">
          {t('projects.draftNotice')}
        </p>
      ) : null}

      <PageHero
        eyebrow={[project.sector, project.location].filter(Boolean).join(' · ') || null}
        title={project.title}
        image={project.hero}
        size="tall"
      />

      {/* Facts + overview */}
      {facts.length > 0 || project.description.length > 0 || project.scope.length > 0 ? (
        <section className="section-y">
          <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
            {facts.length > 0 ? (
              <div className="lg:col-span-4">
                <dl className="border-t border-line">
                  {facts.map((fact) => (
                    <Reveal key={fact.label}>
                      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line py-4">
                        <dt className="eyebrow frame-yellow-sm">{fact.label}</dt>
                        <dd className="text-sm font-medium">{fact.value}</dd>
                      </div>
                    </Reveal>
                  ))}
                </dl>

                {project.collection ? (
                  <Reveal delay={0.1}>
                    <p className="mt-8 text-sm text-ink-muted">
                      {t('projects.partOfCollection')}{' '}
                      <ArrowLink
                        href={`/${locale}/projects?collection=${encodeURIComponent(project.collection.slug)}`}
                        className="ms-1 inline-flex text-ink"
                      >
                        {project.collection.name}
                      </ArrowLink>
                    </p>
                  </Reveal>
                ) : null}
              </div>
            ) : null}

            <div className="lg:col-span-8">
              {project.description.length > 0 ? (
                <>
                  <Reveal>
                    <h2 className="eyebrow frame-yellow-sm">{t('projects.overview')}</h2>
                  </Reveal>
                  <Reveal delay={0.08}>
                    <div className="prose-editorial lead mt-6 max-w-2xl">
                      {project.description.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                </>
              ) : project.summary ? (
                <Reveal>
                  <p className="lead max-w-2xl">{project.summary}</p>
                </Reveal>
              ) : null}

              {project.scope.length > 0 ? (
                <div className="mt-14">
                  <Reveal>
                    <h2 className="eyebrow frame-yellow-sm">{t('projects.scope')}</h2>
                  </Reveal>
                  <Reveal delay={0.08}>
                    <div className="prose-editorial mt-6 max-w-2xl text-ink-muted">
                      {project.scope.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Gallery */}
      {project.gallery.length > 0 ? (
        <section className="section-y bg-paper-soft pt-0 md:pt-0 xl:pt-0">
          <div className="container-page pt-16 md:pt-20">
            <SectionHeader eyebrow={t('projects.gallery')} />
            <div className="mt-10">
              <ProjectGallery images={project.gallery} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={t('projects.related')}
              action={
                <ArrowLink href={`/${locale}/projects`}>{t('common.viewAllProjects')}</ArrowLink>
              }
            />
            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.08} distance={30}>
                  <ProjectCard
                    project={item}
                    ratio="landscape"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} />
    </>
  );
}
