'use client';

import { useRouter } from 'next/navigation';
import { MediaUploader, type UploadedAsset } from '@/components/admin/MediaUploader';

/**
 * Uploader wired to the router so the surrounding server-rendered list
 * reflects newly uploaded files immediately.
 */
export function MediaUploadPanel({
  replaceId,
  multiple = true,
  compact = false,
  label,
  onDone,
}: {
  replaceId?: string;
  multiple?: boolean;
  compact?: boolean;
  label?: string;
  onDone?: (assets: UploadedAsset[]) => void;
}) {
  const router = useRouter();

  return (
    <MediaUploader
      replaceId={replaceId}
      multiple={multiple}
      compact={compact}
      label={label}
      onUploaded={(assets) => {
        onDone?.(assets);
        router.refresh();
      }}
    />
  );
}
