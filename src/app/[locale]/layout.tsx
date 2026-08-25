import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import { arabicFontClass } from '@/lib/fonts';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { WhatsAppButton } from '@/components/site/WhatsAppButton';
import { BackToTop } from '@/components/site/BackToTop';
import { MaintenanceScreen } from '@/components/site/MaintenanceScreen';
import {
  brandAssets,
  contactChannels,
  getNavigation,
  getSiteSettings,
} from '@/lib/content/site';
import { getSessionUser } from '@/lib/auth/session';
import { buildMetadata, jsonLdScript, organizationJsonLd } from '@/lib/seo';
import { direction, isLocale, locales, type Locale } from '@/i18n/config';
import '@/app/globals.css';

const latin = Inter({
  subsets: ['latin'],
  variable: '--font-latin',
  display: 'swap',
});



// Public pages read live CMS data — never serve a build-time snapshot, or
// edits made in the dashboard would not appear on the site.
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return buildMetadata({ locale, path: '' });
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();

  const locale: Locale = rawLocale;
  setRequestLocale(locale);

  const [messages, t, settings, nav, user] = await Promise.all([
    getMessages(),
    getTranslations(),
    getSiteSettings(),
    getNavigation('HEADER', locale),
    getSessionUser(),
  ]);

  const brand = brandAssets(settings, locale);
  const contact = contactChannels(settings, locale);
  const dir = direction(locale);

  // Signed-in staff keep browsing while the site is closed to the public.
  const maintenance = settings.maintenanceMode && !user;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${latin.variable} ${arabicFontClass(settings.arabicFont)}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the saved theme before anything paints. Without this the
            page renders dark and then snaps to day mode once React runs, which
            is worse than having no toggle at all. Deliberately tiny and
            synchronous — it has to finish before the first frame. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var s=localStorage.getItem('eldamarany-theme');" +
              "if(!s){s=window.matchMedia('(prefers-color-scheme: light)').matches?'day':'night';}" +
              "document.documentElement.dataset.theme=s;}catch(e){}})();",
          }}
        />

        {/* Without scripts, entrance animations must not leave content hidden. */}
        <noscript>
          <style>{'[data-reveal]{opacity:1 !important;transform:none !important;}'}</style>
        </noscript>
        {settings.googleVerification ? (
          <meta name="google-site-verification" content={settings.googleVerification} />
        ) : null}
      </head>
      <body className="min-h-dvh bg-night text-paper antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {maintenance ? (
            <MaintenanceScreen locale={locale} />
          ) : (
            <>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-100 focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:text-paper"
              >
                {t('common.skipToContent')}
              </a>

              <SiteHeader
                locale={locale}
                nav={nav}
                logo={brand.logoDark}
                companyName={brand.companyName}
                contactHref={`/${locale}/contact`}
              />

              <main id="main">{children}</main>

              <SiteFooter locale={locale} />

              {contact.whatsappFloating && contact.whatsappHref ? (
                <WhatsAppButton href={contact.whatsappHref} />
              ) : null}

              <BackToTop />
            </>
          )}
        </NextIntlClientProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(await organizationJsonLd(locale)) }}
        />

        {settings.analyticsId ? (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.analyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.analyticsId}');`,
              }}
            />
          </>
        ) : null}
      </body>
    </html>
  );
}
