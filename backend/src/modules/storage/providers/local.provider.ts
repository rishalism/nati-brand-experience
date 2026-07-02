import { Logger } from '@nestjs/common';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { IStorageProvider, StoredObject, UploadFile } from '../storage-provider.interface';

const MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

/**
 * Filesystem storage for local dev when no cloud provider is configured. Files
 * are written under `uploadsDir` and served statically at `${publicBaseUrl}/uploads`.
 * Same interface as Cloudinary/S3, so nothing downstream changes.
 */
export class LocalStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor(
    private readonly uploadsDir: string,
    private readonly publicBaseUrl: string,
  ) {}

  async upload(file: UploadFile, folder = 'products'): Promise<StoredObject> {
    const ext = extname(file.originalName) || MIME_EXT[file.mimetype] || '';
    const filename = `${randomUUID()}${ext}`;
    const dir = join(this.uploadsDir, folder);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), file.buffer);

    const key = `${folder}/${filename}`;
    return { url: `${this.publicBaseUrl}/uploads/${key}`, key };
  }

  async delete(key: string): Promise<void> {
    try {
      await unlink(join(this.uploadsDir, key));
    } catch (error) {
      this.logger.warn(`Failed to delete local file ${key}: ${(error as Error).message}`);
    }
  }
}
