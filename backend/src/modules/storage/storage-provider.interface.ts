export interface UploadFile {
  buffer: Buffer;
  mimetype: string;
  originalName: string;
}

export interface StoredObject {
  url: string;
  /** Provider-specific handle used for deletion (Cloudinary public_id, disk
   * filename, S3 key, …). */
  key: string;
}

/**
 * File storage abstraction. Business code depends on this, never on Cloudinary
 * or the filesystem directly — migrating to S3 later means adding one provider
 * class and changing the factory, nothing else.
 */
export interface IStorageProvider {
  upload(file: UploadFile, folder?: string): Promise<StoredObject>;
  delete(key: string): Promise<void>;
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
