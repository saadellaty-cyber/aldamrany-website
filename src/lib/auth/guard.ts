import 'server-only';

import { redirect } from 'next/navigation';
import { getSessionUser, type SessionUser } from '@/lib/auth/session';

export type { SessionUser };

/** Thrown by action guards so server actions can return a clean error result. */
export class AuthorizationError extends Error {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSessionUser();
}

/**
 * For pages: redirects to the login screen when signed out.
 * `next` preserves the originally requested path.
 */
export async function requireUser(next?: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect(next ? `/admin/login?next=${encodeURIComponent(next)}` : '/admin/login');
  }
  return user;
}

export async function requireAdmin(next?: string): Promise<SessionUser> {
  const user = await requireUser(next);
  if (user.role !== 'ADMIN') {
    redirect('/admin?error=forbidden');
  }
  return user;
}

/**
 * For server actions: throws instead of redirecting, so the caller can surface
 * the message inside the form it came from.
 */
export async function requireUserAction(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthorizationError('Your session has expired. Please sign in again.');
  return user;
}

export async function requireAdminAction(): Promise<SessionUser> {
  const user = await requireUserAction();
  if (user.role !== 'ADMIN') {
    throw new AuthorizationError('This action is restricted to administrators.');
  }
  return user;
}

export function isAdmin(user: SessionUser | null): boolean {
  return user?.role === 'ADMIN';
}
