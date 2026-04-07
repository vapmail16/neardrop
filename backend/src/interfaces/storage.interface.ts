/**
 * Object storage for proof-of-drop images (S3 in Phase 2; local FS in MVP).
 */
export type StorageKey = string;

export interface IObjectStorage {
  putObject(key: StorageKey, body: Buffer, contentType: string): Promise<string>;
  getSignedUrl(key: StorageKey, expiresSeconds: number): Promise<string>;
}
