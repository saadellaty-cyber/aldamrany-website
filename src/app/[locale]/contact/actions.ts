'use server';

import { headers } from 'next/headers';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { clientAddress, rateLimit } from '@/lib/rate-limit';
import { blankToNull } from '@/lib/utils';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(160).optional(),
  email: z.email().max(180),
  phone: z.string().trim().max(60).optional(),
  projectType: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(5000),
  consent: z.literal('on', { message: 'consent' }),
  locale: z.string().trim().max(5).optional(),
  // Hidden field that real users never fill in.
  website: z.string().max(0).optional(),
});

export type ContactFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<'name' | 'email' | 'message' | 'consent', boolean>>;
};

/**
 * Handles a public contact submission: validates, rate-limits by IP, drops
 * obvious bots via a honeypot, and stores the enquiry for the admin inbox.
 */
export async function submitContactForm(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const requestHeaders = await headers();
  const address = clientAddress(requestHeaders);

  const limit = rateLimit(`contact:${address}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return { status: 'error', message: 'rate-limited' };
  }

  const parsed = schema.safeParse({
    name: formData.get('name') ?? '',
    company: formData.get('company') ?? undefined,
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? undefined,
    projectType: formData.get('projectType') ?? undefined,
    message: formData.get('message') ?? '',
    consent: formData.get('consent') ?? '',
    locale: formData.get('locale') ?? undefined,
    website: formData.get('website') ?? '',
  });

  if (!parsed.success) {
    const fieldErrors: ContactFormState['fieldErrors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'name' || field === 'email' || field === 'message' || field === 'consent') {
        fieldErrors[field] = true;
      }
      // A filled honeypot means a bot: respond as success without storing.
      if (field === 'website') return { status: 'success' };
    }
    return { status: 'error', fieldErrors };
  }

  const data = parsed.data;

  await prisma.contactSubmission.create({
    data: {
      name: data.name,
      company: blankToNull(data.company),
      email: data.email.toLowerCase(),
      phone: blankToNull(data.phone),
      projectType: blankToNull(data.projectType),
      message: data.message,
      consent: true,
      locale: blankToNull(data.locale),
      ipAddress: address === 'unknown' ? null : address,
      userAgent: requestHeaders.get('user-agent')?.slice(0, 500) ?? null,
    },
  });

  return { status: 'success' };
}
