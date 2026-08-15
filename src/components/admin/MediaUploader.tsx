'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { CloudUpload, TriangleAlert, X } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';

export type UploadedAsset = { id: string; url: string; name: string };

type QueueItem = {
  key: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
};

const ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/svg+xml';

/**
 * Drag-and-drop uploader with genuine progress.
 *
 * Files are sent one at a time over XMLHttpRequest — `fetch` gives no upload
 * progress events, and reporting a fake bar would be worse than none. The
 * server validates and re-encodes every file before it is stored.
 */
export function MediaUploader({
  onUploaded,
  replaceId,
  multiple = true,
  compact = false,
  label = 'Drag files here or click to browse',
}: {
  onUploaded?: (assets: UploadedAsset[]) => void;
  replaceId?: string;
  multiple?: boolean;
  compact?: boolean;
  label?: string;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [busy, setBusy] = useState(false);

  const uploadOne = useCallback(
    (file: File, key: string) =>
      new Promise<UploadedAsset[]>((resolve) => {
        const body = new FormData();
        body.append('files', file);
        if (replaceId) body.append('replaceId', replaceId);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/admin/media/upload');

        xhr.upload.addEventListener('progress', (event) => {
          if (!event.lengthComputable) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          setQueue((items) =>
            items.map((item) =>
              item.key === key ? { ...item, progress, status: 'uploading' } : item,
            ),
          );
        });

        xhr.addEventListener('load', () => {
          let payload: { created?: UploadedAsset[]; failed?: Array<{ error: string }>; error?: string } = {};
          try {
            payload = JSON.parse(xhr.responseText);
          } catch {
            /* fall through to the generic error below */
          }

          const created = payload.created ?? [];
          const failure = payload.failed?.[0]?.error ?? payload.error;

          if (xhr.status >= 200 && xhr.status < 300 && created.length > 0) {
            setQueue((items) =>
              items.map((item) =>
                item.key === key ? { ...item, progress: 100, status: 'done' } : item,
              ),
            );
            resolve(created);
          } else {
            setQueue((items) =>
              items.map((item) =>
                item.key === key
                  ? { ...item, status: 'error', error: failure ?? 'Upload failed.' }
                  : item,
              ),
            );
            resolve([]);
          }
        });

        xhr.addEventListener('error', () => {
          setQueue((items) =>
            items.map((item) =>
              item.key === key ? { ...item, status: 'error', error: 'Network error.' } : item,
            ),
          );
          resolve([]);
        });

        xhr.send(body);
      }),
    [replaceId],
  );

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const files = Array.from(fileList).slice(0, multiple ? 50 : 1);
      const items: QueueItem[] = files.map((file, index) => ({
        key: `${Date.now()}-${index}-${file.name}`,
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'pending',
      }));

      setQueue((existing) => [...existing, ...items]);
      setBusy(true);

      const uploaded: UploadedAsset[] = [];
      for (const [index, file] of files.entries()) {
        const result = await uploadOne(file, items[index].key);
        uploaded.push(...result);
      }

      setBusy(false);
      if (uploaded.length > 0) onUploaded?.(uploaded);

      // Clear finished rows shortly after, keeping any failures visible.
      window.setTimeout(() => {
        setQueue((items) => items.filter((item) => item.status === 'error'));
      }, 2500);
    },
    [multiple, onUploaded, uploadOne],
  );

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'relative border border-dashed text-center transition-colors',
          compact ? 'p-5' : 'p-8',
          dragging ? 'border-ink bg-[#f2f1ee]' : 'border-[#d5d4ce] bg-white hover:border-ink/40',
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPT}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            void handleFiles(event.target.files);
            event.target.value = '';
          }}
        />

        <label htmlFor={inputId} className="flex cursor-pointer flex-col items-center gap-3">
          <CloudUpload className={cn('text-ink-muted', compact ? 'size-6' : 'size-8')} aria-hidden="true" />
          <span className="text-sm font-medium">{label}</span>
          <span className="text-xs text-ink-muted">
            JPEG, PNG, WebP, AVIF or SVG{multiple ? ' — up to 50 files at a time' : ''}
          </span>
        </label>
      </div>

      {queue.length > 0 ? (
        <ul className="mt-3 space-y-2" aria-live="polite">
          {queue.map((item) => (
            <li key={item.key} className="border border-[#e2e1dc] bg-white px-3 py-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                <span className="shrink-0 text-ink-muted">{formatFileSize(item.size)}</span>
                {item.status === 'error' ? (
                  <TriangleAlert className="size-3.5 shrink-0 text-danger" aria-hidden="true" />
                ) : (
                  <span className="w-9 shrink-0 text-end tabular-nums text-ink-muted">
                    {item.progress}%
                  </span>
                )}
                <button
                  type="button"
                  aria-label={`Dismiss ${item.name}`}
                  onClick={() => setQueue((items) => items.filter((row) => row.key !== item.key))}
                  className="shrink-0 text-ink-muted hover:text-ink"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-2 h-1 w-full bg-[#eeedea]">
                <div
                  className={cn(
                    'h-full transition-[width] duration-200',
                    item.status === 'error' ? 'bg-danger' : 'bg-ink',
                  )}
                  style={{ width: `${item.status === 'error' ? 100 : item.progress}%` }}
                />
              </div>

              {item.error ? <p className="mt-1.5 text-xs text-danger">{item.error}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}

      {busy ? <p className="sr-only">Uploading files…</p> : null}
    </div>
  );
}
