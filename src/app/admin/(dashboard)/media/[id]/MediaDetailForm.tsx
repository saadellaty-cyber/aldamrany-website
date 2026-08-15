'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateMediaAsset } from '@/app/admin/(dashboard)/media/actions';
import { FocalPointEditor } from '@/components/admin/FocalPointEditor';
import { BilingualField } from '@/components/admin/fields';
import { AdminButton, FormMessage, Panel, PanelHeader } from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';
import type { MediaListItem } from '@/lib/admin/media';

const initialState: ActionResult = { ok: true };

export function MediaDetailForm({ asset }: { asset: MediaListItem }) {
  const [state, formAction] = useActionState(updateMediaAsset, initialState);
  const isVector = asset.mimeType === 'image/svg+xml';

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="id" value={asset.id} />

      {state.message ? (
        <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
      ) : null}

      <Panel className="space-y-5">
        <PanelHeader
          title="Description"
          description="Alt text is read aloud by screen readers and used by search engines. Captions appear under gallery images."
        />

        <BilingualField
          label="Alt text"
          nameAr="altAr"
          nameEn="altEn"
          defaultAr={asset.altAr}
          defaultEn={asset.altEn}
          help="Describe what the photograph shows, in a few words."
        />

        <BilingualField
          label="Caption"
          nameAr="captionAr"
          nameEn="captionEn"
          defaultAr={asset.captionAr}
          defaultEn={asset.captionEn}
          multiline
          rows={2}
        />
      </Panel>

      <Panel className="space-y-5">
        <PanelHeader
          title="Image position"
          description="Choose the part of the image that must stay visible when it is cropped. Desktop and mobile are set separately because mobile crops are much tighter."
        />

        {isVector ? (
          <FormMessage tone="info">
            Vector images are not cropped, so a focal point is not needed here.
          </FormMessage>
        ) : (
          <FocalPointEditor
            imageUrl={asset.url}
            alt={asset.altEn ?? asset.originalName}
            initial={{
              focalX: asset.focalX,
              focalY: asset.focalY,
              mobileFocalX: asset.mobileFocalX,
              mobileFocalY: asset.mobileFocalY,
            }}
          />
        )}
      </Panel>

      <SaveBar />
    </form>
  );
}

function SaveBar() {
  const { pending } = useFormStatus();

  return (
    <div className="sticky bottom-0 z-20 border-t border-[#e2e1dc] bg-white/95 px-4 py-3 backdrop-blur">
      <div className="flex justify-end">
        <AdminButton type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </AdminButton>
      </div>
    </div>
  );
}
