'use client';

import { useState } from 'react';
import { ImageIcon, Trash2 } from 'lucide-react';
import { MediaBrowserDialog } from '@/components/admin/MediaBrowserDialog';
import { AdminButton } from '@/components/admin/ui';
import { cn } from '@/lib/utils';
import { useTranslateNode } from '@/components/admin/AdminLocaleProvider';

export type PickedImage = { id: string; url: string; name: string };

/**
 * Selects a single image from the library, or uploads a new one.
 *
 * The chosen id is written to a hidden input, so the picker drops into any
 * ordinary form posted to a server action. Clearing it submits an empty value,
 * which the action stores as NULL.
 */
export function ImagePicker({
  name,
  label,
  description,
  initial,
  aspect = 'aspect-video',
}: {
  name: string;
  label: string;
  description?: string;
  initial?: PickedImage | null;
  aspect?: string;
}) {
  const [selected, setSelected] = useState<PickedImage | null>(initial ?? null);
  const [open, setOpen] = useState(false);
  const tr = useTranslateNode();

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{tr(label)}</p>
      {description ? (
        <p className="mb-2 text-xs leading-relaxed text-ink-muted">{tr(description)}</p>
      ) : null}

      <input type="hidden" name={name} value={selected?.id ?? ''} />

      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'relative w-40 shrink-0 overflow-hidden border border-[#d5d4ce] bg-[#f2f1ee] transition-colors hover:border-ink/50',
            aspect,
          )}
        >
          {selected ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary library URLs
            <img
              src={selected.url}
              alt={selected.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-ink-muted">
              <ImageIcon className="size-5" aria-hidden="true" />
              <span className="text-xs">{tr('Choose image')}</span>
            </span>
          )}
        </button>

        <div className="flex flex-col items-start gap-2">
          <AdminButton variant="secondary" onClick={() => setOpen(true)}>
            {selected ? 'Change image' : 'Select image'}
          </AdminButton>
          {selected ? (
            <>
              <p className="max-w-[16rem] truncate text-xs text-ink-muted" title={selected.name}>
                {selected.name}
              </p>
              <AdminButton variant="ghost" onClick={() => setSelected(null)}>
                <Trash2 className="size-3.5" aria-hidden="true" />
                Remove
              </AdminButton>
            </>
          ) : null}
        </div>
      </div>

      {open ? (
        <MediaBrowserDialog
          onClose={() => setOpen(false)}
          onConfirm={(assets) => {
            const asset = assets[0];
            if (asset) setSelected({ id: asset.id, url: asset.url, name: asset.name });
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
