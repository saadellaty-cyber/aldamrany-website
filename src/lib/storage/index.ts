import { env } from '@/lib/env';
import { localDriver } from '@/lib/storage/local';
import { r2Driver } from '@/lib/storage/r2';
import type { StorageDriver } from '@/lib/storage/types';

export type { StorageDriver, StoredObject } from '@/lib/storage/types';

/** Returns the driver selected by STORAGE_DRIVER. */
export function storage(): StorageDriver {
  return env.storageDriver === 'r2' ? r2Driver : localDriver;
}
