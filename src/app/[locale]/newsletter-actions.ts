'use server';

import { prisma } from '@/lib/db';
import { isLocale } from '@/i18n/config';

export type SubscribeResult = { ok: boolean; message: string };

/** Deliberately permissive — the point is to catch typos, not police formats. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Records a newsletter subscription.
 *
 * An address that is already on the list is treated as a success rather than
 * an error: telling a stranger which addresses are already subscribed leaks
 * them, and re-subscribing is what someone who unsubscribed by mistake wants.
 */
export async function subscribeToNewsletter(
  _previous: SubscribeResult | null,
  formData: FormData,
): Promise<SubscribeResult> {
  const raw = formData.get('email');
  const email = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  const localeRaw = formData.get('locale');
  const locale = typeof localeRaw === 'string' && isLocale(localeRaw) ? localeRaw : null;

  // Honeypot: a field no person sees and every naive bot fills in.
  if (typeof formData.get('company') === 'string' && formData.get('company') !== '') {
    return { ok: true, message: 'done' };
  }

  if (!email || !EMAIL.test(email) || email.length > 254) {
    return { ok: false, message: 'invalid' };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { unsubscribedAt: null, ...(locale ? { locale } : {}) },
      create: { email, locale },
    });
  } catch {
    return { ok: false, message: 'error' };
  }

  return { ok: true, message: 'done' };
}
