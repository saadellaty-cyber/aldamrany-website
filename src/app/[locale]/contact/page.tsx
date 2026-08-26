import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Mail, MapPin, Phone, Smartphone } from 'lucide-react';
import { PageHero } from '@/components/site/PageHero';
import { ContactForm } from '@/components/contact/ContactForm';
import { SocialLinks } from '@/components/site/SocialLinks';
import { WhatsAppInlineIcon } from '@/components/site/WhatsAppButton';
import { LocationMap } from '@/components/site/LocationMap';
import { Reveal } from '@/components/motion/Reveal';
import { ArrowLink } from '@/components/ui/Button';
import { getPage } from '@/lib/content/pages';
import { contactChannels, getSiteSettings, getSocialLinks } from '@/lib/content/site';
import { mapEmbedSrc } from '@/lib/maps';
import { breadcrumbJsonLd, buildMetadata, jsonLdScript } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const page = await getPage('contact', locale);
  return buildMetadata({
    locale,
    path: '/contact',
    title: page?.seo.title ?? page?.title,
    description: page?.seo.description ?? page?.intro[0],
    ogImageKey: page?.seo.ogImageKey,
    canonicalUrl: page?.seo.canonicalUrl,
    noIndex: page?.seo.noIndex,
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [t, page, settings, socials] = await Promise.all([
    getTranslations(),
    getPage('contact', locale),
    getSiteSettings(),
    getSocialLinks(),
  ]);

  const contact = contactChannels(settings, locale);

  // Only channels the owner has actually filled in are rendered.
  const channels = [
    contact.phoneHref && contact.phone
      ? { icon: Phone, label: t('contact.phone'), value: contact.phone, href: contact.phoneHref, ltr: true }
      : null,
    contact.mobileHref && contact.mobile
      ? { icon: Smartphone, label: t('contact.mobile'), value: contact.mobile, href: contact.mobileHref, ltr: true }
      : null,
    contact.emailHref && contact.email
      ? { icon: Mail, label: t('contact.email'), value: contact.email, href: contact.emailHref, ltr: true }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Phone;
    label: string;
    value: string;
    href: string;
    ltr?: boolean;
  }>;

  const offices = [
    contact.headOffice ? { label: t('contact.headOffice'), value: contact.headOffice } : null,
    contact.branch ? { label: t('contact.branch'), value: contact.branch } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  // Geocoded off the English address whichever language the page is in: Google
  // finds "Smouha, Alexandria" more reliably than its Arabic spelling, while
  // `hl` still puts the map's own labels in the reader's language.
  const mapSrc = mapEmbedSrc({
    mapsUrl: contact.googleMapsUrl,
    address: settings.headOfficeEn ?? settings.headOfficeAr,
    locale,
  });

  const breadcrumbs = breadcrumbJsonLd(
    [
      { name: t('nav.home'), path: '' },
      { name: page?.title ?? t('nav.contact'), path: '/contact' },
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
        eyebrow={page?.eyebrow ?? t('contact.eyebrow')}
        title={page?.title ?? t('contact.headline')}
        intro={page?.intro}
        image={page?.hero}
      />

      <section className="section-y">
        <div className="container-page grid gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Details */}
          <div className="lg:col-span-5">
            {offices.length > 0 ? (
              <ul className="border-t border-line">
                {offices.map((office) => (
                  <li key={office.label} className="border-b border-line py-6">
                    <Reveal>
                      <div className="flex gap-4">
                        <MapPin className="mt-0.5 size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                        <div>
                          <p className="eyebrow text-gold">{office.label}</p>
                          <p className="mt-2 leading-relaxed">{office.value}</p>
                        </div>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : null}

            {channels.length > 0 ? (
              <ul className="mt-8 space-y-4">
                {channels.map((channel) => (
                  <li key={channel.label}>
                    <Reveal>
                      <a
                        href={channel.href}
                        className="group flex items-center gap-4 text-base transition-opacity hover:opacity-70"
                      >
                        <channel.icon className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                        <span dir={channel.ltr ? 'ltr' : undefined}>{channel.value}</span>
                      </a>
                    </Reveal>
                  </li>
                ))}
              </ul>
            ) : null}

            {contact.whatsappHref ? (
              <Reveal>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-12 items-center gap-3 border border-ink/25 px-5 text-sm font-medium transition-colors hover:bg-ink hover:text-paper"
                >
                  <WhatsAppInlineIcon className="size-4" />
                  {t('common.chatOnWhatsapp')}
                </a>
              </Reveal>
            ) : null}

            {contact.googleMapsUrl ? (
              <Reveal>
                <div className="mt-8">
                  <ArrowLink href={contact.googleMapsUrl} external>
                    {t('common.openInMaps')}
                  </ArrowLink>
                </div>
              </Reveal>
            ) : null}

            {socials.length > 0 ? (
              <div className="mt-10">
                <p className="eyebrow text-gold">{t('common.followUs')}</p>
                <SocialLinks links={socials} size="sm" className="mt-4" />
              </div>
            ) : null}
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <Reveal>
              <h2 className="display-4">{t('contact.formTitle')}</h2>
            </Reveal>
            <div className="mt-8">
              <ContactForm locale={locale} />
            </div>
          </div>
        </div>
      </section>

      {mapSrc ? (
        <section className="border-t border-line">
          <div className="container-page py-12">
            <Reveal>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h2 className="display-4">{t('common.openInMaps')}</h2>
                {contact.headOffice ? (
                  <p className="flex items-center gap-2 text-sm text-ink-muted">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    {contact.headOffice}
                  </p>
                ) : null}
              </div>
            </Reveal>

            <LocationMap src={mapSrc} title={t('contact.mapTitle')} className="mt-8 border border-line" />
          </div>
        </section>
      ) : null}
    </>
  );
}
