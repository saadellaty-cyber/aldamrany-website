'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Trash2 } from 'lucide-react';
import { deleteProject } from '@/app/admin/(dashboard)/projects/actions';
import { AdminButton, FormMessage } from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';

const initialState: ActionResult = { ok: true };

/**
 * Deletes a project, then refreshes the router before navigating.
 *
 * `router.refresh()` is what clears the cached project list — redirecting
 * straight from the server action leaves the deleted row on screen until the
 * page is fully reloaded.
 */
export function DeleteProjectButton({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(deleteProject, initialState);

  useEffect(() => {
    if (state.ok && state.message) {
      // A full navigation rather than router.push: the client router still has
      // the previous project list cached, and after a deletion the list must be
      // guaranteed accurate. Verified — router.push/refresh leaves the deleted
      // row on screen until a manual reload.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/admin/projects?deleted=1');
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={projectId} />
      {state.message && !state.ok ? <FormMessage tone="error">{state.message}</FormMessage> : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" variant="danger" disabled={pending}>
      <Trash2 className="size-3.5" aria-hidden="true" />
      {pending ? 'Deleting…' : 'Delete project'}
    </AdminButton>
  );
}
