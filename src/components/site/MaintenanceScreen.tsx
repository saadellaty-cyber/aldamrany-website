import { getTranslations } from 'next-intl/server';
import { getSiteSettings, contactChannels } from '@/lib/content/site';
import type { Locale } from '@/i18n/config';

/**
 * Shown to the public while Maintenance Mode is enabled in Site Settings.
 * Signed-in staff bypass it and continue to see the live site.
 */
export async function MaintenanceScreen({ locale }: { locale: Locale }) {
  const [t, settings] = await Promise.all([getTranslations(), getSiteSettings()]);
  const contact = contactChannels(settings, locale);

  const heading =
    locale === 'ar' ? 'الموقع قيد التحديث حاليًا' : 'The site is currently being updated';
  const body =
    locale === 'ar'
      ? 'نعمل على تحديث محتوى الموقع. يرجى المحاولة لاحقًا.'
      : 'We are updating the site content. Please check back shortly.';

  return (
    <div className="surface-dark flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="text-lg font-semibold tracking-[0.18em]">EL DAMARANY</span>
      <span className="mt-2 text-[0.5625rem] tracking-[0.3em] text-paper/50">SINCE 1978</span>

      <h1 className="heading-gold display-3 mt-10 max-w-2xl text-balance">{heading}</h1>
      <p className="lead mt-5 max-w-md text-paper/60">{body}</p>

      {contact.emailHref && contact.email ? (
        <a
          href={contact.emailHref}
          className="mt-10 border-b border-paper/40 pb-1 text-sm transition-colors hover:border-paper"
        >
          {t('common.emailUs')} — {contact.email}
        </a>
      ) : null}
    </div>
  );
}
