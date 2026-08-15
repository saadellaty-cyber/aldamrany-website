export type StoredObject = {
  /** Path inside the bucket / storage root. Also the MediaAsset primary key. */
  key: string;
  /** Absolute or root-relative URL the browser can fetch. */
  url: string;
};

export interface StorageDriver {
  readonly name: 'local' | 'r2';
  put(key: string, body: Buffer, contentType: string): Promise<StoredObject>;
  delete(key: string): Promise<void>;
  /** Reads an object back. Returns null when the key does not exist. */
  read(key: string): Promise<{ body: Buffer; contentType: string } | null>;
  url(key: string): string;
}
