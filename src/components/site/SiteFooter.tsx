import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Mail, MapPin, Phone } from 'lucide-react';
import { prisma } from '@/lib/db';
import {
  brandAssets,
  contactChannels,
  getNavigation,
  getSiteSettings,
  getSocialLinks,
} from '@/lib/content/site';
import { getServices } from '@/lib/content/collections';
import { SocialLinks } from '@/components/site/SocialLinks';
import { WhatsAppInlineIcon } from '@/components/site/WhatsAppButton';
import { LanguageSwitcher } from '@/components/site/LanguageSwitcher';
import type { Locale } from '@/i18n/config';

/** Legal pages appear in the footer only once they have been published. */
async function legalLinks(locale: Locale) {
  const pages = await prisma.page.findMany({
    where: { key: { in: ['privacy', 'terms'] }, status: 'PUBLISHED' },
    select: { key: true, titleAr: true, titleEn: true },
  });

  return pages.map((page) => ({
    key: page.key,
    href: `/${locale}/${page.key}`,
    label: (locale === 'ar' ? page.titleAr : page.titleEn) ?? page.key,
  }));
}

export async function SiteFooter({ locale }: { locale: Locale }) {
  const [t, settings, nav, services, socials, legal] = await Promise.all([
    getTranslations(),
    getSiteSettings(),
    getNavigation('FOOTER', locale),
    getServices(locale),
    getSocialLinks(),
    legalLinks(locale),
  ]);

  const contact = contactChannels(settings, locale);
  const brand = brandAssets(settings, locale);
  const year = new Date().getFullYear();

  return (
    <footer className="surface-dark">
      <div className="container-page py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href={`/${locale}`} className="inline-flex flex-col leading-none">
              <span className="text-xl font-semibold tracking-[0.16em]">EL DAMARANY</span>
              <span className="mt-2 text-[0.5625rem] tracking-[0.3em] text-paper/50">
                SINCE 1978
              </span>
            </Link>

            {brand.companyName ? (
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/60">
                {brand.companyName}
              </p>
            ) : null}

            {brand.tagline ? (
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/45">{brand.tagline}</p>
            ) : null}

            <SocialLinks links={socials} size="sm" className="mt-8 text-paper/70" />
          </div>

          {/* Navigation */}
          {nav.length > 0 ? (
            <nav className="lg:col-span-2" aria-label={t('footer.navigation')}>
              <h2 className="eyebrow text-paper/40">{t('footer.navigation')}</h2>
              <ul className="mt-6 space-y-3">
                {nav.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="text-sm text-paper/75 transition-colors duration-200 hover:text-paper"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          {/* Services */}
          {services.length > 0 ? (
            <div className="lg:col-span-3">
              <h2 className="eyebrow text-paper/40">{t('footer.services')}</h2>
              <ul className="mt-6 space-y-3">
                {services.map((service) => (
                  <li key={service.id}>
                    <Link
                      href={`/${locale}/services#${service.slug}`}
                      className="text-sm text-paper/75 transition-colors duration-200 hover:text-paper"
                    >
                      {service.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Contact */}
          <div className="lg:col-span-3">
            <h2 className="eyebrow text-paper/40">{t('footer.contact')}</h2>
            <ul className="mt-6 space-y-4 text-sm text-paper/75">
              {contact.headOffice ? (
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-paper/40" aria-hidden="true" />
                  <span className="leading-relaxed">
                    <span className="block text-paper/40">{t('footer.headOffice')}</span>
                    {contact.headOffice}
                  </span>
                </li>
              ) : null}

              {contact.phoneHref && contact.phone ? (
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 shrink-0 text-paper/40" aria-hidden="true" />
                  <a
                    href={contact.phoneHref}
                    dir="ltr"
                    className="transition-colors duration-200 hover:text-paper"
                  >
                    {contact.phone}
                  </a>
                </li>
              ) : null}

              {contact.emailHref && contact.email ? (
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-paper/40" aria-hidden="true" />
                  <a
                    href={contact.emailHref}
                    className="break-all transition-colors duration-200 hover:text-paper"
                  >
                    {contact.email}
                  </a>
                </li>
              ) : null}

              {contact.whatsappHref ? (
                <li className="flex gap-3">
                  <WhatsAppInlineIcon className="mt-0.5 size-4 shrink-0 text-paper/40" />
                  <a
                    href={contact.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-paper"
                  >
                    {t('common.whatsapp')}
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-5 border-t border-white/10 pt-8 text-xs text-paper/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} EL DAMARANY. {t('footer.rights')}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legal.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="transition-colors duration-200 hover:text-paper"
              >
                {item.label}
              </Link>
            ))}
            <LanguageSwitcher locale={locale} tone="dark" className="text-paper/60" />
          </div>
        </div>
      </div>
    </footer>
  );
}
