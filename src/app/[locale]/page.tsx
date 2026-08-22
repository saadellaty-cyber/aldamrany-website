import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Hero } from '@/components/home/Hero';
import { AboutPanel } from '@/components/sections/AboutPanel';
import { Stats } from '@/components/sections/Stats';
import { ServiceCarousel } from '@/components/sections/ServiceCarousel';
import { WhyUs } from '@/components/sections/WhyUs';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { QualityThemes } from '@/components/sections/QualityThemes';
import { RiskProcess } from '@/components/sections/RiskProcess';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { ButtonLink } from '@/components/ui/Button';
import {
  getCapabilities,
  getHomeSections,
  getQualitySections,
  getRiskItems,
  getServices,
  getStatistics,
} from '@/lib/content/collections';
import { getFeaturedProjects } from '@/lib/content/projects';
import { getSiteSettings } from '@/lib/content/site';
import { getPage } from '@/lib/content/pages';
import { buildMetadata } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

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

  const [t, sections, stats, services, projects, capabilities, quality, risks, settings] =
    await Promise.all([
      getTranslations(),
      getHomeSections(locale),
      getStatistics(locale),
      getServices(locale, { featuredOnly: true }),
      getFeaturedProjects(locale, 8),
      getCapabilities(locale),
      getQualitySections(locale),
      getRiskItems(locale),
      getSiteSettings(),
    ]);

  const hero = sections.HERO;
  const about = sections.ABOUT;
  const servicesSection = sections.SERVICES;
  const projectsSection = sections.PROJECTS;
  const qualitySection = sections.QUALITY;
  const riskSection = sections.RISK;
  const cta = sections.CTA;

  return (
    <div className="bg-night">
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

      {/* Who we are — the one long read, lifted onto a cream panel. */}
      {about ? (
        <AboutPanel
          eyebrow={about.eyebrow}
          title={about.title}
          body={about.body}
          image={about.image}
          cta={about.primaryCta}
          closing={about.subtitle}
        />
      ) : null}

      <Stats stats={stats} locale={locale} eyebrow={sections.STATS?.eyebrow} />

      {/* Services */}
      {services.length > 0 ? (
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle
              title={servicesSection?.title ?? (locale === 'ar' ? 'خدماتنا' : 'Our Services')}
              description={servicesSection?.body[0]}
            />

            <div className="mt-12">
              <ServiceCarousel
                services={services}
                locale={locale}
                showIcons={settings.showIcons}
                moreLabel={t('common.readMore')}
                label={servicesSection?.title ?? (locale === 'ar' ? 'خدماتنا' : 'Our Services')}
              />
            </div>

            {servicesSection?.primaryCta ? (
              <div className="mt-10 flex justify-center">
                <ButtonLink href={servicesSection.primaryCta.href} variant="outlineGold" withArrow>
                  {servicesSection.primaryCta.label}
                </ButtonLink>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Why us — drawn from the experience and resources capability bands. */}
      <WhyUs
        capabilities={capabilities}
        showIcons={settings.showIcons}
        title={locale === 'ar' ? 'لماذا الضمراني؟' : 'Why EL DAMARANY?'}
      />

      {/* Featured projects */}
      {projects.length > 0 ? (
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle
              title={
                projectsSection?.title ??
                (locale === 'ar' ? 'مشروعات نفخر بتنفيذها' : 'Projects We Are Proud Of')
              }
              description={projectsSection?.body[0]}
            />

            <FeaturedProjects
              projects={projects}
              label={projectsSection?.title ?? (locale === 'ar' ? 'المشروعات' : 'Projects')}
            />

            <div className="mt-10 flex justify-center">
              <ButtonLink
                href={projectsSection?.primaryCta?.href ?? `/${locale}/projects`}
                variant="gold"
                withArrow
              >
                {projectsSection?.primaryCta?.label ?? t('common.viewAllProjects')}
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* Quality & safety */}
      {qualitySection && quality.length > 0 ? (
        <section className="bg-night px-5 py-4 md:px-10 xl:px-16">
          <div className="mx-auto max-w-[96rem]">
            <QualityThemes
              showIcons={settings.showIcons}
              items={quality}
              images={{ quality: qualitySection.image, safety: qualitySection.image }}
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
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle title={riskSection.title} description={riskSection.body[0]} />
            <RiskProcess steps={risks} />
          </div>
        </section>
      ) : null}

      <ContactCTA
        locale={locale}
        headline={cta?.title}
        body={cta?.body[0]}
        image={cta?.image}
      />
    </div>
  );
}
