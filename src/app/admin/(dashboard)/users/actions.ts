'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { AuthorizationError, requireAdminAction } from '@/lib/auth/guard';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { destroyAllSessionsForUser } from '@/lib/auth/session';
import {
  checkbox,
  fail,
  logActivity,
  ok,
  oneOf,
  text,
  type ActionResult,
} from '@/lib/admin/forms';

const ROLES = ['ADMIN', 'EDITOR'] as const;

/** Creates a dashboard user. Administrators only. */
export async function createUser(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdminAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const email = text(formData, 'email').toLowerCase();
  const name = text(formData, 'name');
  const password = text(formData, 'password');

  if (!z.email().safeParse(email).success) {
    return fail('Enter a valid email address.', { email: 'Invalid email.' });
  }
  if (name.length < 2) {
    return fail('Enter the person’s name.', { name: 'Required.' });
  }

  const weakness = validatePasswordStrength(password);
  if (weakness) return fail(weakness, { password: weakness });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail('An account with that email address already exists.', { email: 'Already in use.' });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: oneOf(formData, 'role', ROLES, 'EDITOR'),
      passwordHash: await hashPassword(password),
    },
  });

  await logActivity(actor, {
    action: 'CREATE',
    entityType: 'User',
    entityId: user.id,
    summary: `Created the ${user.role.toLowerCase()} account ${user.email}`,
  });

  revalidatePath('/admin/users');
  return ok('User created.');
}

/** Changes role and active state. Cannot be used on your own account. */
export async function updateUser(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdminAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const id = text(formData, 'id');
  if (!id) return fail('Missing user reference.');
  if (id === actor.id) {
    return fail('You cannot change your own role or deactivate your own account.');
  }

  const isActive = checkbox(formData, 'isActive');
  const role = oneOf(formData, 'role', ROLES, 'EDITOR');

  // Never leave the installation without an administrator who can sign in.
  if (role !== 'ADMIN' || !isActive) {
    const otherAdmins = await prisma.user.count({
      where: { role: 'ADMIN', isActive: true, NOT: { id } },
    });
    if (otherAdmins === 0) {
      return fail('There must always be at least one active administrator.');
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role, isActive },
  });

  // A deactivated account must lose its existing sessions immediately.
  if (!isActive) await destroyAllSessionsForUser(id);

  await logActivity(actor, {
    action: 'UPDATE',
    entityType: 'User',
    entityId: id,
    summary: `Updated the account ${user.email} (${user.role.toLowerCase()}, ${isActive ? 'active' : 'disabled'})`,
  });

  revalidatePath('/admin/users');
  return ok('User updated.');
}

/** Sets a new password and signs the account out everywhere. */
export async function resetUserPassword(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let actor;
  try {
    actor = await requireAdminAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const id = text(formData, 'id');
  const password = text(formData, 'password');
  if (!id) return fail('Missing user reference.');

  const weakness = validatePasswordStrength(password);
  if (weakness) return fail(weakness, { password: weakness });

  const user = await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(password) },
  });

  await destroyAllSessionsForUser(id);

  await logActivity(actor, {
    action: 'UPDATE',
    entityType: 'User',
    entityId: id,
    summary: `Reset the password for ${user.email}`,
  });

  revalidatePath('/admin/users');
  return ok('Password updated. That account has been signed out everywhere.');
}
