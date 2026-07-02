import { Logger } from '@nestjs/common';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import type { IStorageProvider, StoredObject, UploadFile } from '../storage-provider.interface';

/** Cloudinary-backed storage. Selected when Cloudinary credentials are set. */
export class CloudinaryStorageProvider implements IStorageProvider {
  private readonly logger = new Logger(CloudinaryStorageProvider.name);

  constructor(config: { cloudName: string; apiKey: string; apiSecret: string }) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
  }

  upload(file: UploadFile, folder = 'nati'): Promise<StoredObject> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result?: UploadApiResponse) => {
          if (error || !result) {
            this.logger.error(`Cloudinary upload failed: ${error?.message ?? 'unknown'}`);
            reject(new Error('Image upload failed'));
            return;
          }
          resolve({ url: result.secure_url, key: result.public_id });
        },
      );
      stream.end(file.buffer);
    });
  }

  async delete(key: string): Promise<void> {
    await cloudinary.uploader.destroy(key);
  }
}
