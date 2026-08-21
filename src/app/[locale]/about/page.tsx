import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/PageHero';
import { Stats } from '@/components/sections/Stats';
import { Timeline } from '@/components/sections/Timeline';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { ArrowLink } from '@/components/ui/Button';
import { findBlock, getPage, getPageBlocks } from '@/lib/content/pages';
import { getCapabilities, getStatistics, getTimeline } from '@/lib/content/collections';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('about', locale);
  return buildMetadata({
    locale,
    path: '/about',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description ?? page?.intro[0],
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, page, blocks, stats, timeline, capabilities] = await Promise.all([
    getTranslations(),
    getPage('about', locale),
    getPageBlocks('about', locale),
    getStatistics(locale),
    getTimeline(locale),
    getCapabilities(locale),
  ]);

  const vision = findBlock(blocks, 'vision');
  const mission = findBlock(blocks, 'mission');
  const values = findBlock(blocks, 'values');
  const scope = findBlock(blocks, 'geographic-scope');
  const otherBlocks = blocks.filter(
    (block) => !['vision', 'mission', 'values', 'geographic-scope'].includes(block.key),
  );

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: page?.title ?? t('nav.about'), path: '/about' },
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

      <Stats
        stats={stats}
        locale={locale}
        eyebrow={locale === 'ar' ? 'بالأرقام' : 'At a Glance'}
      />

      {/* Vision & mission */}
      {vision || mission ? (
        <section className="section-y">
          <div className="container-page grid gap-14 lg:grid-cols-2 lg:gap-20">
            {vision ? (
              <div>
                <Reveal>
                  <p className="eyebrow heading-yellow flex items-center gap-3">
                    <span className="inline-block h-px w-8 bg-current opacity-50" aria-hidden="true" />
                    {locale === 'ar' ? 'رؤيتنا' : 'Our Vision'}
                  </p>
                </Reveal>
                {vision.title ? (
                  <h2 className="display-3 mt-6 text-balance">
                    <RevealHeading>{vision.title}</RevealHeading>
                  </h2>
                ) : null}
                {vision.body.length > 0 ? (
                  <Reveal delay={0.1}>
                    <div className="prose-editorial mt-6 text-ink-muted">
                      {vision.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                ) : null}
              </div>
            ) : null}

            {mission ? (
              <div>
                <Reveal>
                  <p className="eyebrow heading-yellow flex items-center gap-3">
                    <span className="inline-block h-px w-8 bg-current opacity-50" aria-hidden="true" />
                    {mission.title ?? (locale === 'ar' ? 'رسالتنا' : 'Our Mission')}
                  </p>
                </Reveal>
                {mission.body.length > 0 ? (
                  <Reveal delay={0.1}>
                    <div className="prose-editorial lead mt-6">
                      {mission.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Values */}
      {values && values.lines.length > 0 ? (
        <section className="surface-dark section-y">
          <div className="container-page">
            <SectionHeader tone="light-text" eyebrow={values.title} />
            <ul className="mt-12 grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {values.lines.map((value, index) => (
                <li key={value} className="bg-ink p-8">
                  <Reveal delay={index * 0.07}>
                    <span className="latin-nums text-xs tracking-[0.2em] text-paper/40">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="display-4 mt-4">{value}</p>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* History */}
      {timeline.length > 0 ? (
        <section className="section-y">
          <div className="container-page">
            <SectionHeader
              eyebrow={locale === 'ar' ? 'مسيرتنا' : 'Our Story'}
              title={locale === 'ar' ? 'مسيرة تمتد منذ 1978' : 'A Story That Began in 1978'}
            />
            <Timeline entries={timeline} />
          </div>
        </section>
      ) : null}

      {/* Capabilities */}
      {capabilities.length > 0 ? (
        <section className="section-y bg-paper-soft">
          <div className="container-page">
            <SectionHeader
              eyebrow={locale === 'ar' ? 'قدراتنا' : 'Capabilities'}
              action={
                <ArrowLink href={`/${locale}/capabilities`}>
                  {locale === 'ar' ? 'تفاصيل القدرات' : 'Explore Capabilities'}
                </ArrowLink>
              }
            />
            <ul className="mt-12 flex flex-wrap gap-x-8 gap-y-5 border-t border-line pt-10">
              {capabilities.map((capability, index) => (
                <li key={capability.id}>
                  <Reveal delay={index * 0.04}>
                    <span className="display-4 text-ink/85">{capability.title}</span>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Geographic scope + any additional blocks */}
      {scope || otherBlocks.length > 0 ? (
        <section className="section-y">
          <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
            {scope ? (
              <div className="lg:col-span-6">
                <Reveal>
                  <p className="eyebrow heading-yellow flex items-center gap-3">
                    <span className="inline-block h-px w-8 bg-current opacity-50" aria-hidden="true" />
                    {scope.title}
                  </p>
                </Reveal>
                {scope.body.length > 0 ? (
                  <Reveal delay={0.08}>
                    <div className="prose-editorial display-4 mt-6 max-w-lg">
                      {scope.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                ) : null}
              </div>
            ) : null}

            {otherBlocks.map((block) => (
              <div key={block.key} className="lg:col-span-6">
                {block.title ? (
                  <Reveal>
                    <h2 className="display-4">{block.title}</h2>
                  </Reveal>
                ) : null}
                {block.body.length > 0 ? (
                  <Reveal delay={0.08}>
                    <div className="prose-editorial mt-5 text-ink-muted">
                      {block.body.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </Reveal>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <ContactCTA locale={locale} />
    </>
  );
}
