'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, Search, X } from 'lucide-react';
import { MediaUploader, type UploadedAsset } from '@/components/admin/MediaUploader';
import { AdminButton } from '@/components/admin/ui';
import { cn } from '@/lib/utils';
import { useAdminT } from '@/components/admin/AdminLocaleProvider';

export type BrowserAsset = {
  id: string;
  url: string;
  name: string;
  alt: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
};

/**
 * Shared media browser used by both the single-image picker and the project
 * gallery. Uploading from inside the dialog immediately selects the result.
 */
export function MediaBrowserDialog({
  onClose,
  onConfirm,
  multiple = false,
  title = 'Select an image',
}: {
  onClose: () => void;
  onConfirm: (assets: BrowserAsset[]) => void;
  multiple?: boolean;
  title?: string;
}) {
  const t = useAdminT();
  const [items, setItems] = useState<BrowserAsset[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/media/list?q=${encodeURIComponent(search)}`);
      if (!response.ok) throw new Error('request failed');
      const payload: { items: BrowserAsset[] } = await response.json();
      setItems(payload.items);
    } catch {
      setError('Could not load the media library. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(query), query ? 300 : 0);
    return () => window.clearTimeout(timeout);
  }, [query, load]);

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

  const toggle = (asset: BrowserAsset) => {
    if (!multiple) {
      onConfirm([asset]);
      return;
    }
    setSelected((current) =>
      current.includes(asset.id)
        ? current.filter((id) => id !== asset.id)
        : [...current, asset.id],
    );
  };

  const handleUploaded = (uploaded: UploadedAsset[]) => {
    const assets: BrowserAsset[] = uploaded.map((asset) => ({
      ...asset,
      alt: '',
      width: null,
      height: null,
      blurDataUrl: null,
    }));

    if (!multiple) {
      onConfirm(assets.slice(0, 1));
      return;
    }

    // Show them in the grid straight away and pre-select them.
    setItems((current) => [...assets, ...current]);
    setSelected((current) => [...current, ...assets.map((asset) => asset.id)]);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
    >
      <button type="button" aria-label={t('Close')} onClick={onClose} className="absolute inset-0 bg-ink/50" />

      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col border border-[#d5d4ce] bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-[#e2e1dc] p-4">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('Close')}
            className="inline-flex size-8 items-center justify-center hover:bg-black/5"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-[#e2e1dc] p-4">
          <MediaUploader
            multiple={multiple}
            compact
            label={multiple ? 'Upload new images' : 'Upload a new image'}
            onUploaded={handleUploaded}
          />
        </div>

        <div className="border-b border-[#e2e1dc] p-3">
          <label className="relative block">
            <span className="sr-only">{t('Search media')}</span>
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('Search the library…')}
              className="h-9 w-full border border-[#d5d4ce] bg-white ps-9 pe-3 text-sm focus:border-ink focus:outline-none"
            />
          </label>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-3">
          {loading ? (
            <p className="p-6 text-center text-sm text-ink-muted">{t('Loading…')}</p>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-sm text-danger">{error}</p>
              <AdminButton variant="secondary" className="mt-3" onClick={() => void load(query)}>
                Try again
              </AdminButton>
            </div>
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-sm text-ink-muted">
              {query ? 'No matching images.' : 'The library is empty — upload an image above.'}
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {items.map((asset) => {
                const isSelected = selected.includes(asset.id);
                return (
                  <li key={asset.id}>
                    <button
                      type="button"
                      onClick={() => toggle(asset)}
                      aria-pressed={multiple ? isSelected : undefined}
                      className={cn(
                        'group relative block w-full border p-1 transition-colors',
                        isSelected ? 'border-ink bg-[#f2f1ee]' : 'border-transparent hover:border-ink/50',
                      )}
                    >
                      <span className="relative block aspect-square overflow-hidden bg-[#f2f1ee]">
                        {/* eslint-disable-next-line @next/next/no-img-element -- library grid */}
                        <img
                          src={asset.url}
                          alt={asset.alt || asset.name}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        {isSelected ? (
                          <span className="absolute end-1 top-1 inline-flex size-5 items-center justify-center bg-ink text-paper">
                            <Check className="size-3" aria-hidden="true" />
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block truncate text-[0.6875rem] text-ink-muted">
                        {asset.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {multiple ? (
          <div className="flex items-center justify-between gap-3 border-t border-[#e2e1dc] p-4">
            <p className="text-sm text-ink-muted">
              {selected.length} selected
            </p>
            <div className="flex gap-3">
              <AdminButton variant="secondary" onClick={onClose}>
                Cancel
              </AdminButton>
              <AdminButton
                disabled={selected.length === 0}
                onClick={() =>
                  onConfirm(items.filter((asset) => selected.includes(asset.id)))
                }
              >
                Add {selected.length > 0 ? `${selected.length} ` : ''}image
                {selected.length === 1 ? '' : 's'}
              </AdminButton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
