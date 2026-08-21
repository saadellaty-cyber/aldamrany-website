'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { X } from 'lucide-react';
import { updateProjectImage } from '@/app/admin/(dashboard)/projects/actions';
import { FocalPointEditor } from '@/components/admin/FocalPointEditor';
import { BilingualField } from '@/components/admin/fields';
import { AdminButton, FormMessage } from '@/components/admin/ui';
import type { ActionResult } from '@/lib/admin/forms';
import type { GalleryImage } from '@/components/admin/GalleryManager';
import { useAdminT } from '@/components/admin/AdminLocaleProvider';

const initialState: ActionResult = { ok: true };

/**
 * Per-image editor: crop for both breakpoints, plus alt text and caption that
 * override whatever the shared media asset carries.
 */
export function GalleryImageEditor({
  projectId,
  image,
  onClose,
}: {
  projectId: string;
  image: GalleryImage;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(updateProjectImage, initialState);
  const t = useAdminT();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Edit ${image.name}`}
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
    >
      <button type="button" aria-label={t('Close')} onClick={onClose} className="absolute inset-0 bg-ink/50" />

      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col border border-[#d5d4ce] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#e2e1dc] p-4">
          <h2 className="truncate text-sm font-semibold">{image.name}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="inline-flex size-8 shrink-0 items-center justify-center hover:bg-black/5"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form action={formAction} className="flex min-h-0 flex-1 flex-col">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="imageId" value={image.id} />

          <div className="scrollbar-thin min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
            {state.message ? (
              <FormMessage tone={state.ok ? 'success' : 'error'}>{state.message}</FormMessage>
            ) : null}

            <FocalPointEditor
              imageUrl={image.url}
              alt={image.altTextEn ?? image.name}
              initial={{
                focalX: image.focalX,
                focalY: image.focalY,
                mobileFocalX: image.mobileFocalX,
                mobileFocalY: image.mobileFocalY,
              }}
            />

            <BilingualField
              label="Alt text for this project"
              nameAr="altTextAr"
              nameEn="altTextEn"
              defaultAr={image.altTextAr}
              defaultEn={image.altTextEn}
              help="Overrides the description saved in the media library."
            />

            <BilingualField
              label="Caption"
              nameAr="captionAr"
              nameEn="captionEn"
              defaultAr={image.captionAr}
              defaultEn={image.captionEn}
              multiline
              rows={2}
              help="Shown beneath the image in the full-screen gallery."
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-[#e2e1dc] p-4">
            <AdminButton variant="secondary" onClick={onClose}>
              Close
            </AdminButton>
            <SaveButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <AdminButton type="submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save image'}
    </AdminButton>
  );
}
