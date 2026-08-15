'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireAdminAction, requireUserAction } from '@/lib/auth/guard';
import { logActivity, oneOf, optionalText, text } from '@/lib/admin/forms';

const STATUSES = ['NEW', 'CONTACTED', 'CLOSED'] as const;

export async function setMessageStatus(formData: FormData): Promise<void> {
  const user = await requireUserAction();

  const id = text(formData, 'id');
  if (!id) return;

  const status = oneOf(formData, 'status', STATUSES, 'NEW');
  const submission = await prisma.contactSubmission.update({
    where: { id },
    data: { status },
  });

  await logActivity(user, {
    action: 'UPDATE',
    entityType: 'ContactSubmission',
    entityId: id,
    summary: `Marked the enquiry from ${submission.name} as ${status.toLowerCase()}`,
  });

  revalidatePath('/admin/messages');
  revalidatePath('/admin');
}

export async function saveMessageNotes(formData: FormData): Promise<void> {
  await requireUserAction();

  const id = text(formData, 'id');
  if (!id) return;

  await prisma.contactSubmission.update({
    where: { id },
    data: { notes: optionalText(formData, 'notes') },
  });

  revalidatePath('/admin/messages');
}

/** Removing an enquiry permanently is an administrator action. */
export async function deleteMessage(formData: FormData): Promise<void> {
  const user = await requireAdminAction();

  const id = text(formData, 'id');
  if (!id) return;

  const submission = await prisma.contactSubmission.delete({ where: { id } });

  await logActivity(user, {
    action: 'DELETE',
    entityType: 'ContactSubmission',
    entityId: id,
    summary: `Deleted the enquiry from ${submission.name}`,
  });

  revalidatePath('/admin/messages');
  revalidatePath('/admin');
}
