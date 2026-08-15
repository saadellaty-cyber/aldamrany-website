'use client';

import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { TriangleAlert } from 'lucide-react';
import { deleteMediaAsset } from '@/app/admin/(dashboard)/media/actions';
import { AdminButton, FormMessage } from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';
import type { UsageEntry } from '@/lib/admin/media';

const initialState: ActionResult = { ok: true };

/**
 * Deletion is a two-step action when the asset is in use: the first attempt
 * reports exactly where it appears, and only an explicit confirmation removes
 * it from those places.
 */
export function DeleteMediaForm({ id, usage }: { id: string; usage: UsageEntry[] }) {
  const [state, formAction] = useActionState(deleteMediaAsset, initialState);
  const [confirmed, setConfirmed] = useState(false);
  const inUse = usage.length > 0;

  useEffect(() => {
    if (state.ok && state.message) {
      // Full navigation so the library list cannot be served from the client
      // router cache with the deleted file still in it.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign('/admin/media?deleted=1');
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      {inUse ? (
        <div className="border border-warning/30 bg-warning/8 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-warning">
            <TriangleAlert className="size-4" aria-hidden="true" />
            This image is currently in use
          </p>
          <ul className="mt-2 space-y-1 text-sm text-ink-muted">
            {usage.map((entry) => (
              <li key={entry.type}>
                {entry.label}: {entry.count}
              </li>
            ))}
          </ul>
          <label className="mt-3 flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="force"
              value="on"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--color-ink)]"
            />
            <span>
              I understand this image will be removed from everywhere it is used, and the file will
              be deleted permanently.
            </span>
          </label>
        </div>
      ) : (
        <p className="text-sm text-ink-muted">
          This image is not used anywhere. Deleting it removes the file permanently.
        </p>
      )}

      {state.message && !state.ok ? <FormMessage tone="error">{state.message}</FormMessage> : null}

      <DeleteButton disabled={inUse && !confirmed} />
    </form>
  );
}

function DeleteButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" variant="danger" disabled={disabled || pending}>
      {pending ? 'Deleting…' : 'Delete image'}
    </AdminButton>
  );
}
