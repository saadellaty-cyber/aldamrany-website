'use server';

import { revalidatePath } from 'next/cache';
import { AuthorizationError, requireAdminAction, requireUserAction } from '@/lib/auth/guard';
import { getResourceRepo } from '@/lib/admin/resource-repos';
import { getResourceSchema } from '@/lib/admin/resource-schemas';
import { fail, logActivity, ok, text, textList, type ActionResult } from '@/lib/admin/forms';

/**
 * One set of actions serves every simple CMS list. The resource key arrives as
 * a form field and is resolved against the registry, so an unknown value can
 * never reach the database.
 */
function resolve(formData: FormData) {
  const key = text(formData, 'resource');
  const schema = getResourceSchema(key);
  const repo = getResourceRepo(key);
  return schema && repo ? { key, schema, repo } : null;
}

function refresh(key: string) {
  revalidatePath(`/admin/content/${key}`);
  // Public pages read this content directly.
  revalidatePath('/', 'layout');
}

export async function saveResourceItem(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  let user;
  try {
    user = await requireUserAction();
  } catch (error) {
    return fail(error instanceof AuthorizationError ? error.message : 'Not authorised.');
  }

  const resolved = resolve(formData);
  if (!resolved) return fail('Unknown content type.');

  const { key, schema, repo } = resolved;
  const id = text(formData, 'id');
  const label = repo.label(formData) || schema.singular;

  try {
    if (id) {
      await repo.update(id, formData);
      await logActivity(user, {
        action: 'UPDATE',
        entityType: schema.singular,
        entityId: id,
        summary: `Updated ${schema.singular.toLowerCase()} "${label}"`,
      });
      refresh(key);
      return ok('Saved.');
    }

    const createdId = await repo.create(formData);
    await logActivity(user, {
      action: 'CREATE',
      entityType: schema.singular,
      entityId: createdId,
      summary: `Added ${schema.singular.toLowerCase()} "${label}"`,
    });
    refresh(key);
    return ok(`${schema.singular} added.`, createdId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return fail(`Could not save: ${message}`);
  }
}

/** Deleting reference content is restricted to administrators. */
export async function deleteResourceItem(formData: FormData): Promise<void> {
  const user = await requireAdminAction();

  const resolved = resolve(formData);
  if (!resolved) return;

  const { key, schema, repo } = resolved;
  const id = text(formData, 'id');
  if (!id) return;

  await repo.remove(id);
  await logActivity(user, {
    action: 'DELETE',
    entityType: schema.singular,
    entityId: id,
    summary: `Deleted a ${schema.singular.toLowerCase()}`,
  });

  refresh(key);
}

export async function reorderResourceItems(formData: FormData): Promise<void> {
  await requireUserAction();

  const resolved = resolve(formData);
  if (!resolved) return;

  const ids = textList(formData, 'ids');
  if (ids.length === 0) return;

  await resolved.repo.reorder(ids);
  refresh(resolved.key);
}
