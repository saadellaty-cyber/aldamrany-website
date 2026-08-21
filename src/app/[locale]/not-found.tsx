import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/Button';
import { getLocale } from 'next-intl/server';

/**
 * Localised 404. Requests without a locale prefix are redirected into one by
 * the proxy, so unknown paths land here rather than on a framework default.
 */
export default async function LocaleNotFound() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);

  return (
    <section className="surface-dark flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <p className="latin-nums text-[clamp(5rem,3rem+10vw,12rem)] font-medium leading-none tracking-tight text-paper/15">
        404
      </p>

      <h1 className="heading-gold display-3 mt-6 max-w-xl text-balance">{t('notFound.title')}</h1>
      <p className="lead mt-5 max-w-md text-paper/60">{t('notFound.description')}</p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href={`/${locale}`} variant="inverse" size="lg" withArrow>
          {t('notFound.cta')}
        </ButtonLink>
        <ButtonLink href={`/${locale}/projects`} variant="outlineLight" size="lg">
          {t('common.viewAllProjects')}
        </ButtonLink>
      </div>
    </section>
  );
}
