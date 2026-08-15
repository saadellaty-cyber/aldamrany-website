'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createSession, destroySession } from '@/lib/auth/session';
import { clientAddress, rateLimit } from '@/lib/rate-limit';

const schema = z.object({
  email: z.email().max(180),
  password: z.string().min(1).max(200),
  next: z.string().max(300).optional(),
});

export type LoginState = { error?: string };

/** A throwaway hash so a wrong email costs the same time as a wrong password. */
const DUMMY_HASH_PROMISE = hashPassword('invalid-placeholder-password');

/**
 * Signs an administrator in.
 *
 * Failures are deliberately indistinguishable — the same message and a
 * comparable amount of work whether the address exists or not — and repeated
 * attempts from one address are throttled.
 */
export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const requestHeaders = await headers();
  const address = clientAddress(requestHeaders);

  const limit = rateLimit(`login:${address}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return {
      error: `Too many sign-in attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
    };
  }

  const parsed = schema.safeParse({
    email: formData.get('email') ?? '',
    password: formData.get('password') ?? '',
    next: formData.get('next') ?? undefined,
  });

  if (!parsed.success) {
    return { error: 'Enter a valid email address and password.' };
  }

  const { email, password, next } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user || !user.isActive) {
    await verifyPassword(password, await DUMMY_HASH_PROMISE);
    return { error: 'Incorrect email or password.' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: 'Incorrect email or password.' };
  }

  await createSession(user.id, {
    userAgent: requestHeaders.get('user-agent'),
    ipAddress: address === 'unknown' ? null : address,
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await prisma.activityLog.create({
    data: {
      userId: user.id,
      action: 'SIGN_IN',
      entityType: 'User',
      entityId: user.id,
      summary: `${user.name} signed in`,
    },
  });

  // Only same-origin paths are accepted, so `next` cannot bounce elsewhere.
  const destination = next && next.startsWith('/admin') ? next : '/admin';
  redirect(destination);
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}
