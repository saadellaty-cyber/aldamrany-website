'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { subscribeToNewsletter, type SubscribeResult } from '@/app/[locale]/newsletter-actions';
import type { Locale } from '@/i18n/config';

/**
 * Newsletter sign-up.
 *
 * Addresses are stored in the site's own database rather than pushed to a
 * mailing service, so the form works without any third-party account; the list
 * is in the dashboard when one is chosen later.
 */
export function NewsletterForm({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const [state, formAction] = useActionState<SubscribeResult | null, FormData>(
    subscribeToNewsletter,
    null,
  );

  if (state?.ok) {
    return (
      <p role="status" className="text-sm text-gold">
        {t('newsletter.thanks')}
      </p>
    );
  }

  return (
    <form action={formAction} className="w-full">
      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot — hidden from people, filled in by naive bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="newsletter-company">Company</label>
        <input id="newsletter-company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          {t('newsletter.emailLabel')}
        </label>
        <div className="relative flex-1">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-gold/70"
          />
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            dir="ltr"
            autoComplete="email"
            placeholder={t('newsletter.placeholder')}
            className="h-11 w-full rounded-[var(--radius-control)] border border-night-line bg-night ps-9 pe-3 text-sm text-paper transition-colors placeholder:text-paper/35 focus:border-gold focus:outline-none"
          />
        </div>

        <SubmitButton label={t('newsletter.submit')} />
      </div>

      {state && !state.ok ? (
        <p role="alert" className="mt-3 text-xs text-danger">
          {state.message === 'invalid' ? t('newsletter.invalid') : t('newsletter.error')}
        </p>
      ) : null}
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-11 shrink-0 rounded-[var(--radius-control)] bg-gold px-6 text-sm font-medium text-night transition-colors duration-300 hover:bg-gold-soft disabled:opacity-60"
    >
      {label}
    </button>
  );
}
