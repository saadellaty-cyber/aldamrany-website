/**
 * Central, lazily-validated access to environment configuration.
 *
 * Values are read through getters rather than validated at import time: a
 * production build must not fail merely because an optional integration (R2,
 * analytics) is unconfigured. Anything genuinely required throws with an
 * actionable message at the moment it is first used.
 */

function read(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

function require_(key: string, hint: string): string {
  const value = read(key);
  if (!value) {
    throw new Error(`Missing required environment variable ${key}. ${hint}`);
  }
  return value;
}

export type StorageDriverName = 'local' | 'r2';

export const env = {
  get databaseUrl(): string {
    return require_('DATABASE_URL', 'Point it at your PostgreSQL instance, or run "npm run db:start".');
  },

  get siteUrl(): string {
    return (read('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000').replace(/\/+$/, '');
  },

  get authSecret(): string {
    return require_(
      'AUTH_SECRET',
      'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    );
  },

  get storageDriver(): StorageDriverName {
    const value = read('STORAGE_DRIVER') ?? 'local';
    if (value !== 'local' && value !== 'r2') {
      throw new Error(`Invalid STORAGE_DRIVER "${value}". Expected "local" or "r2".`);
    }
    return value;
  },

  get localStorageDir(): string {
    return read('LOCAL_STORAGE_DIR') ?? './var/uploads';
  },

  get maxUploadBytes(): number {
    const megabytes = Number(read('MAX_UPLOAD_MB') ?? '15');
    return (Number.isFinite(megabytes) && megabytes > 0 ? megabytes : 15) * 1024 * 1024;
  },

  get r2(): {
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl: string;
    region: string;
  } {
    return {
      endpoint: require_('R2_ENDPOINT', 'Required when STORAGE_DRIVER="r2".'),
      accessKeyId: require_('R2_ACCESS_KEY_ID', 'Required when STORAGE_DRIVER="r2".'),
      secretAccessKey: require_('R2_SECRET_ACCESS_KEY', 'Required when STORAGE_DRIVER="r2".'),
      bucket: require_('R2_BUCKET', 'Required when STORAGE_DRIVER="r2".'),
      publicUrl: require_('R2_PUBLIC_URL', 'Required when STORAGE_DRIVER="r2".').replace(/\/+$/, ''),
      region: read('R2_REGION') ?? 'auto',
    };
  },

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
} as const;
