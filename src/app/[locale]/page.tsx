import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/home/Hero';
import { Stats } from '@/components/sections/Stats';
import { ServiceList } from '@/components/sections/ServiceSection';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { QualityThemes } from '@/components/sections/QualityThemes';
import { RiskProcess } from '@/components/sections/RiskProcess';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ButtonLink, ArrowLink } from '@/components/ui/Button';
import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import {
  getCapabilities,
  getHomeSections,
  getQualitySections,
  getRiskItems,
  getServices,
  getStatistics,
  getTimeline,
} from '@/lib/content/collections';
import { getFeaturedProjects } from '@/lib/content/projects';
import { getSiteSettings } from '@/lib/content/site';
import { getPage } from '@/lib/content/pages';
import { buildMetadata } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';
import { CapabilityBands } from '@/components/sections/CapabilityBands';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('home', locale);
  return buildMetadata({
    locale,
    path: '',
    title: page?.seo.title,
    description: page?.seo.description,
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, sections, stats, services, projects, capabilities, quality, risks, timeline, settings] =
    await Promise.all([
      getTranslations(),
      getHomeSections(locale),
      getStatistics(locale),
      getServices(locale, { featuredOnly: true }),
      getFeaturedProjects(locale, 6),
      getCapabilities(locale),
      getQualitySections(locale),
      getRiskItems(locale),
      getTimeline(locale),
      getSiteSettings(),
    ]);

  const hero = sections.HERO;
  const about = sections.ABOUT;
  const servicesSection = sections.SERVICES;
  const projectsSection = sections.PROJECTS;
  const qualitySection = sections.QUALITY;
  const riskSection = sections.RISK;
  const cta = sections.CTA;
  const founding = timeline[0];

  return (
    <>
      {hero ? (
        <Hero
          eyebrow={hero.eyebrow}
          title={hero.title}
          body={hero.body}
          image={hero.image}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
        />
      ) : null}

      {/* Who we are */}
      {about ? (
        <section className="section-y">
          <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              {about.eyebrow ? (
                <Reveal>
                  <p className="eyebrow frame-yellow-sm">
                    {about.eyebrow}
                  </p>
                </Reveal>
              ) : null}
            </div>

            <div className="lg:col-span-7">
              {about.title ? (
                <h2 className="frame-yellow display-2 text-balance">
                  <RevealHeading>{about.title}</RevealHeading>
                </h2>
              ) : null}

              {about.body.length > 0 ? (
                <Reveal delay={0.1}>
                  <div className="prose-editorial lead mt-8 max-w-2xl text-ink-muted">
                    {about.body.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
              ) : null}

              {about.primaryCta ? (
                <Reveal delay={0.15}>
                  <div className="mt-10">
                    <ButtonLink href={about.primaryCta.href} variant="outline" withArrow>
                      {about.primaryCta.label}
                    </ButtonLink>
                  </div>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <Stats stats={stats} locale={locale} eyebrow={sections.STATS?.eyebrow} />

      {/* Capabilities */}
      {capabilities.length > 0 ? (
        <section className="section-y bg-paper-soft">
          <div className="container-page">
            <SectionHeader
              eyebrow={locale === 'ar' ? 'قدراتنا' : 'Capabilities'}
              title={
                locale === 'ar'
                  ? 'قدرات فنية وتشغيلية متكاملة'
                  : 'Integrated Technical and Operational Capabilities'
              }
              action={
                <ArrowLink href={`/${locale}/capabilities`}>
                  {locale === 'ar' ? 'كل القدرات' : 'All Capabilities'}
                </ArrowLink>
              }
            />

            <div className="mt-12">
              <CapabilityBands
                capabilities={capabilities}
                locale={locale}
                showIcons={settings.showIcons}
              />
            </div>
          </div>
        </section>
      ) : null}

      {/* Services — plain paper, so the cream stats + capabilities block above
          reads as one warm passage rather than three bands running together. */}
      {services.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={servicesSection?.eyebrow}
              title={servicesSection?.title}
              action={
                servicesSection?.primaryCta ? (
                  <ArrowLink href={servicesSection.primaryCta.href}>
                    {servicesSection.primaryCta.label}
                  </ArrowLink>
                ) : null
              }
            />
            <ServiceList services={services} showIcons={settings.showIcons} />
          </div>
        </section>
      ) : null}

      {/* Featured projects */}
      {projects.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={projectsSection?.eyebrow}
              title={projectsSection?.title}
              titleClass="display-2"
              action={
                projectsSection?.primaryCta ? (
                  <ArrowLink href={projectsSection.primaryCta.href}>
                    {projectsSection.primaryCta.label}
                  </ArrowLink>
                ) : null
              }
            />
            <FeaturedProjects projects={projects} />
          </div>
        </section>
      ) : null}

      {/* Quality & safety */}
      {qualitySection ? (
        <section className="surface-dark section-y">
          <div className="container-page">
            <SectionHeader
              tone="light-text"
              eyebrow={qualitySection.eyebrow}
              title={qualitySection.title}
              titleClass="display-2"
              description={
                qualitySection.body.length > 0 ? <p>{qualitySection.body[0]}</p> : undefined
              }
              action={
                qualitySection.primaryCta ? (
                  <ArrowLink href={qualitySection.primaryCta.href} className="text-paper">
                    {qualitySection.primaryCta.label}
                  </ArrowLink>
                ) : null
              }
            />
            <QualityThemes
              showIcons={settings.showIcons}
              items={quality.slice(0, 10)}
              tone="dark"
              labels={{
                quality: locale === 'ar' ? 'الجودة' : 'Quality',
                safety: locale === 'ar' ? 'السلامة' : 'Safety',
              }}
            />
          </div>
        </section>
      ) : null}

      {/* Risk management */}
      {riskSection && risks.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={riskSection.eyebrow}
              title={riskSection.title}
              titleClass="display-2"
              action={
                riskSection.primaryCta ? (
                  <ArrowLink href={riskSection.primaryCta.href}>
                    {riskSection.primaryCta.label}
                  </ArrowLink>
                ) : null
              }
            />
            <RiskProcess steps={risks} />
          </div>
        </section>
      ) : null}

      {/* Company story */}
      {founding ? (
        <section className="section-y bg-paper-soft">
          <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <p className="eyebrow frame-yellow-sm">
                  {locale === 'ar' ? 'مسيرتنا' : 'Our Story'}
                </p>
              </Reveal>
              <Reveal delay={0.05}>
                <p className="latin-nums mt-6 text-[clamp(3.5rem,2rem+6vw,8rem)] font-medium leading-none tracking-tight text-ink/15">
                  {founding.year}
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7 lg:pt-6">
              {founding.title ? (
                <h2 className="display-3 text-balance">
                  <RevealHeading>{founding.title}</RevealHeading>
                </h2>
              ) : null}
              {founding.description.length > 0 ? (
                <Reveal delay={0.1}>
                  <div className="prose-editorial lead mt-6 max-w-xl text-ink-muted">
                    {founding.description.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </Reveal>
              ) : null}
              <Reveal delay={0.15}>
                <div className="mt-9">
                  <ArrowLink href={`/${locale}/about`}>{t('common.moreAbout')}</ArrowLink>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} headline={cta?.title} body={cta?.body[0]} />
    </>
  );
}
