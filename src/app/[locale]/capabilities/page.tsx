import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/site/PageHero';
import { ContactCTA } from '@/components/sections/ContactCTA';
import { SmartImage } from '@/components/ui/SmartImage';
import { Reveal } from '@/components/motion/Reveal';
import { getPage } from '@/lib/content/pages';
import { getCapabilities } from '@/lib/content/collections';
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
        <section className="section-y">
          <div className="container-page">
            <ul className="border-t border-line">
              {capabilities.map((capability, index) => (
                <li key={capability.id} className="border-b border-line">
                  <Reveal delay={(index % 4) * 0.05}>
                    <div className="grid items-start gap-6 py-10 md:grid-cols-12 md:gap-10 md:py-12">
                      <span className="flex items-center gap-2.5 text-ink-muted md:col-span-1">
                        {settings.showIcons && resolveIcon(capability.icon, capability.slug) ? (
                          <Icon
                            name={resolveIcon(capability.icon, capability.slug)!}
                            className="size-5 text-gold-dim"
                          />
                        ) : null}
                        <span className="latin-nums text-sm font-medium tracking-[0.2em]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </span>

                      <h2 className="display-3 text-balance md:col-span-5">{capability.title}</h2>

                      <div className="md:col-span-4">
                        {capability.description.length > 0 ? (
                          <div className="prose-editorial text-ink-muted">
                            {capability.description.map((paragraph, paragraphIndex) => (
                              <p key={paragraphIndex}>{paragraph}</p>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {capability.image ? (
                        <div className="md:col-span-2">
                          <SmartImage
                            image={capability.image}
                            sizes="(min-width: 768px) 20vw, 100vw"
                            className="aspect-[4/3] w-full"
                          />
                        </div>
                      ) : null}
                    </div>
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
