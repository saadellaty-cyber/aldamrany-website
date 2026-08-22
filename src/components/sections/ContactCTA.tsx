import { Mail, Phone } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal, RevealHeading } from '@/components/motion/Reveal';
import { WhatsAppInlineIcon } from '@/components/site/WhatsAppButton';
import { SmartImage } from '@/components/ui/SmartImage';
import { contactChannels, getSiteSettings } from '@/lib/content/site';
import type { ImageRef } from '@/lib/content/media';
import type { Locale } from '@/i18n/config';

/**
 * The recurring closing panel.
 *
 * The three round buttons are the quick channels — whichever of them the
 * company has actually saved. Each is only rendered once its number or address
 * exists in Site Settings, so the row never shows a dead icon.
 */
export async function ContactCTA({
  locale,
  headline,
  body,
  image,
}: {
  locale: Locale;
  headline?: string | null;
  body?: string | null;
  image?: ImageRef | null;
}) {
  const [t, settings] = await Promise.all([getTranslations(), getSiteSettings()]);
  const contact = contactChannels(settings, locale);

  const title = headline?.trim() || t('cta.headline');

  const channels = [
    contact.whatsappHref
      ? {
          key: 'whatsapp',
          href: contact.whatsappHref,
          label: t('common.whatsapp'),
          icon: <WhatsAppInlineIcon className="size-4" />,
          external: true,
        }
      : null,
    contact.phoneHref
      ? {
          key: 'phone',
          href: contact.phoneHref,
          label: t('common.callUs'),
          icon: <Phone className="size-4" aria-hidden="true" />,
          external: false,
        }
      : null,
    contact.emailHref
      ? {
          key: 'email',
          href: contact.emailHref,
          label: t('common.emailUs'),
          icon: <Mail className="size-4" aria-hidden="true" />,
          external: false,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    href: string;
    label: string;
    icon: React.ReactNode;
    external: boolean;
  }>;

  return (
    <section className="bg-night px-5 py-4 md:px-10 xl:px-16">
      <div className="panel-dark mx-auto max-w-[96rem] overflow-hidden">
        <div className="grid lg:grid-cols-12">
          {image ? (
            <div className="relative hidden lg:col-span-4 lg:block">
              <SmartImage
                image={image}
                sizes="33vw"
                className="h-full w-full"
                placeholderTone="dark"
                placeholderBare
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-l from-night-soft via-night-soft/40 to-transparent rtl:bg-gradient-to-r"
              />
            </div>
          ) : null}

          <div className={image ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <div className="flex flex-col gap-8 p-7 md:p-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="min-w-0">
                <h2 className="text-balance text-xl font-semibold leading-snug text-paper md:text-2xl">
                  <RevealHeading>{title}</RevealHeading>
                </h2>
                {body?.trim() ? (
                  <Reveal delay={0.1}>
                    <p className="mt-3 max-w-md text-sm leading-[2] text-paper/60">{body}</p>
                  </Reveal>
                ) : null}
              </div>

              <Reveal delay={0.15} className="shrink-0">
                <div className="flex flex-wrap items-center gap-3">
                  {channels.map((channel) => (
                    <a
                      key={channel.key}
                      href={channel.href}
                      aria-label={channel.label}
                      title={channel.label}
                      {...(channel.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="inline-flex size-11 items-center justify-center rounded-full border border-gold/40 text-gold transition-colors duration-300 hover:border-gold hover:bg-gold hover:text-night"
                    >
                      {channel.icon}
                    </a>
                  ))}

                  <ButtonLink href={`/${locale}/contact`} variant="gold" withArrow>
                    {t('common.contactUs')}
                  </ButtonLink>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
