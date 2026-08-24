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
import { NewsList } from '@/components/sections/NewsList';
import { PartnerStrip } from '@/components/sections/PartnerStrip';
import { NewsletterForm } from '@/components/sections/NewsletterForm';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { IconGrid } from '@/components/ui/IconGrid';
import { ButtonLink } from '@/components/ui/Button';
import {
  getAdvantages,
  getCapabilities,
  getHomeSections,
  getQualitySections,
  getRiskItems,
  getServices,
  getStatistics,
} from '@/lib/content/collections';
import { getFeaturedProjects } from '@/lib/content/projects';
import { getNews, getPartners } from '@/lib/content/news';
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

  const [
    t,
    sections,
    stats,
    services,
    projects,
    capabilities,
    advantages,
    quality,
    risks,
    news,
    partners,
    settings,
  ] =
    await Promise.all([
      getTranslations(),
      getHomeSections(locale),
      getStatistics(locale),
      getServices(locale, { featuredOnly: true }),
      getFeaturedProjects(locale, 8),
      getCapabilities(locale),
      getAdvantages(locale),
      getQualitySections(locale),
      getRiskItems(locale),
      getNews(locale, 4),
      getPartners(locale),
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

      <Stats
        stats={stats}
        locale={locale}
        eyebrow={sections.STATS?.eyebrow}
        showIcons={settings.showIcons}
      />

      {/* Services */}
      {services.length > 0 ? (
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle
              title={servicesSection?.title ?? (locale === 'ar' ? 'مجالات العمل' : 'Fields of Work')}
              description={servicesSection?.body[0]}
            />

            <div className="mt-12">
              <ServiceCarousel
                services={services}
                locale={locale}
                showIcons={settings.showIcons}
                moreLabel={t('common.readMore')}
                label={servicesSection?.title ?? (locale === 'ar' ? 'مجالات العمل' : 'Fields of Work')}
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

      {/* Featured projects */}
      {projects.length > 0 ? (
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle
              title={
                projectsSection?.title ??
                (locale === 'ar' ? 'نماذج من أعمالنا' : 'Selected Work')
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

      {/* Capabilities & equipment — every capability in one grid. "Why us"
          below has content of its own, so nothing has to be held back here. */}
      {capabilities.length > 0 ? (
        <section className="bg-night px-5 py-10 md:px-10 md:py-14 xl:px-16">
          <div className="panel-light mx-auto max-w-[96rem] px-6 py-12 md:px-10 md:py-14">
            <SectionTitle
              tone="light"
              title={locale === 'ar' ? 'قدراتنا ومعداتنا' : 'Capabilities & Equipment'}
            />
            <IconGrid items={capabilities} showIcons={settings.showIcons} className="mt-12" />
            {/* Filled rather than outlined: a gold rule on cream is too faint
                to read as a control. */}
            <div className="mt-10 flex justify-center">
              <ButtonLink href={`/${locale}/capabilities`} variant="gold" withArrow>
                {locale === 'ar' ? 'كل القدرات' : 'All capabilities'}
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
              fallbackImage={qualitySection.image}
              labels={{
                quality: locale === 'ar' ? 'الجودة' : 'Quality',
                safety: locale === 'ar' ? 'السلامة' : 'Safety',
              }}
            />
          </div>
        </section>
      ) : null}

      {/* Risk management — the other half of the quality story, so it follows it. */}
      {riskSection && risks.length > 0 ? (
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle title={riskSection.title} description={riskSection.body[0]} />
            <RiskProcess steps={risks} />
          </div>
        </section>
      ) : null}

      {/* Why us — the experience band, kept back from the capabilities section
          above so the page builds to the case rather than opening with it. */}
      <WhyUs
        reasons={advantages}
        showIcons={settings.showIcons}
        title={locale === 'ar' ? 'لماذا الضمراني؟' : 'Why EL DAMARANY?'}
      />

      {/* News — the section removes itself until something is published. */}
      {news.length > 0 ? (
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle title={t('news.title')} />
            <NewsList items={news} locale={locale} className="mt-12" />
            <div className="mt-10 flex justify-center">
              <ButtonLink href={`/${locale}/news`} variant="outlineGold" withArrow>
                {t('news.viewAll')}
              </ButtonLink>
            </div>
          </div>
        </section>
      ) : null}

      {/* Partners — likewise hidden until logos have been uploaded. */}
      {partners.length > 0 ? (
        <section className="bg-night py-16 md:py-20">
          <div className="container-page">
            <SectionTitle title={t('partners.title')} />
            <div className="mt-12">
              <PartnerStrip partners={partners} />
            </div>
          </div>
        </section>
      ) : null}

      {/* Newsletter */}
      <section className="bg-night px-5 py-4 md:px-10 xl:px-16">
        <div className="panel-dark mx-auto flex max-w-[96rem] flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight text-paper md:text-xl">
              {t('newsletter.title')}
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-paper/60">
              {t('newsletter.body')}
            </p>
          </div>
          <div className="w-full md:max-w-md">
            <NewsletterForm locale={locale} />
          </div>
        </div>
      </section>

      <ContactCTA
        locale={locale}
        headline={cta?.title}
        body={cta?.body[0]}
        image={cta?.image}
      />
    </div>
  );
}
