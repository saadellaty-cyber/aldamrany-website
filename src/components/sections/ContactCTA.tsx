import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { WhatsAppInlineIcon } from '@/components/site/WhatsAppButton';
import { contactChannels, getSiteSettings } from '@/lib/content/site';
import type { Locale } from '@/i18n/config';

/**
 * The recurring closing call to action. The WhatsApp button only appears once
 * a number has been saved in Site Settings.
 */
export async function ContactCTA({
  locale,
  headline,
  body,
}: {
  locale: Locale;
  headline?: string | null;
  body?: string | null;
}) {
  const [t, settings] = await Promise.all([getTranslations(), getSiteSettings()]);
  const contact = contactChannels(settings, locale);

  const title = headline?.trim() || t('cta.headline');

  return (
    <section className="surface-dark">
      <div className="container-page py-20 md:py-28 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="heading-yellow display-2 max-w-[16ch] text-balance">
              <RevealHeading>{title}</RevealHeading>
            </h2>
            {body?.trim() ? (
              <Reveal delay={0.1}>
                <p className="lead mt-7 max-w-lg text-paper/60">{body}</p>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="flex flex-wrap items-center gap-4 lg:justify-end">
              <ButtonLink href={`/${locale}/contact`} variant="inverse" size="lg" withArrow>
                {t('common.contactUs')}
              </ButtonLink>

              {contact.whatsappHref ? (
                <ButtonLink
                  href={contact.whatsappHref}
                  variant="outlineLight"
                  size="lg"
                  external
                >
                  <WhatsAppInlineIcon className="size-4" />
                  {t('common.whatsapp')}
                </ButtonLink>
              ) : null}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
