'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Check, TriangleAlert } from 'lucide-react';
import { submitContactForm, type ContactFormState } from '@/app/[locale]/contact/actions';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/i18n/config';
import { cn } from '@/lib/utils';

const PROJECT_TYPES = ['roads', 'asphalt', 'infrastructure', 'concrete', 'contracting', 'other'] as const;

const initialState: ContactFormState = { status: 'idle' };

const fieldClass =
  'h-12 w-full border border-line bg-transparent px-3.5 text-sm transition-colors placeholder:text-ink-muted/60 focus:border-ink focus:outline-none';

export function ContactForm({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const [state, formAction] = useActionState(submitContactForm, initialState);

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="flex items-start gap-4 border border-ink/15 bg-paper-soft p-8"
      >
        <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden="true" />
        <div>
          <p className="text-base font-medium">{t('contact.success')}</p>
        </div>
      </div>
    );
  }

  const invalid = (field: 'name' | 'email' | 'message' | 'consent') =>
    Boolean(state.fieldErrors?.[field]);

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.status === 'error' && !state.fieldErrors ? (
        <p
          role="alert"
          className="flex items-center gap-3 border border-danger/30 bg-danger/5 p-4 text-sm text-danger"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          {t('contact.error')}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t('contact.name')}
          name="name"
          required
          invalid={invalid('name')}
          error={t('contact.validation.name')}
          autoComplete="name"
        />
        <Field
          label={t('contact.company')}
          name="company"
          hint={t('contact.optional')}
          autoComplete="organization"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t('contact.emailField')}
          name="email"
          type="email"
          required
          invalid={invalid('email')}
          error={t('contact.validation.email')}
          autoComplete="email"
          dir="ltr"
        />
        <Field
          label={t('contact.phoneField')}
          name="phone"
          type="tel"
          hint={t('contact.optional')}
          autoComplete="tel"
          dir="ltr"
        />
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">{t('contact.projectType')}</span>
        <select name="projectType" defaultValue="" className={cn(fieldClass, 'cursor-pointer')}>
          <option value="">{t('contact.selectProjectType')}</option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={t(`contact.projectTypes.${type}`)}>
              {t(`contact.projectTypes.${type}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">
          {t('contact.message')} <span aria-hidden="true">*</span>
        </span>
        <textarea
          name="message"
          rows={6}
          required
          aria-invalid={invalid('message') || undefined}
          className={cn(
            'w-full border bg-transparent p-3.5 text-sm leading-relaxed transition-colors focus:outline-none',
            invalid('message') ? 'border-danger focus:border-danger' : 'border-line focus:border-ink',
          )}
        />
        {invalid('message') ? (
          <span className="mt-1.5 block text-xs text-danger">{t('contact.validation.message')}</span>
        ) : null}
      </label>

      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={invalid('consent') || undefined}
          className="mt-1 size-4 shrink-0 accent-[var(--color-ink)]"
        />
        <span className={cn(invalid('consent') && 'text-danger')}>
          {t('contact.consent')}
          {invalid('consent') ? (
            <span className="mt-1 block text-xs">{t('contact.validation.consent')}</span>
          ) : null}
        </span>
      </label>

      <div className="pt-2">
        <SubmitButton idle={t('contact.submit')} busy={t('contact.sending')} />
      </div>
    </form>
  );
}

function SubmitButton({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending} withArrow={!pending}>
      {pending ? busy : idle}
    </Button>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  invalid = false,
  error,
  hint,
  autoComplete,
  dir,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  invalid?: boolean;
  error?: string;
  hint?: string;
  autoComplete?: string;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline gap-2 text-sm font-medium">
        {label}
        {required ? <span aria-hidden="true">*</span> : null}
        {hint ? <span className="text-xs font-normal text-ink-muted">({hint})</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        dir={dir}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        className={cn(fieldClass, invalid && 'border-danger focus:border-danger')}
      />
      {invalid && error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}
