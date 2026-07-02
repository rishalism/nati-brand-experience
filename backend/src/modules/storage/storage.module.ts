import { Global, Logger, Module } from '@nestjs/common';
import { join } from 'node:path';
import { AppConfigService } from '../../config/app-config.service';
import { STORAGE_PROVIDER, type IStorageProvider } from './storage-provider.interface';
import { CloudinaryStorageProvider } from './providers/cloudinary.provider';
import { LocalStorageProvider } from './providers/local.provider';

/** Absolute path for local uploads; also used by main.ts to serve them. */
export const UPLOADS_DIR = join(process.cwd(), 'uploads');

/**
 * Global storage module. Cloudinary when fully configured, otherwise local disk
 * for dev. Downstream code only sees the IStorageProvider interface.
 */
@Global()
@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService): IStorageProvider => {
        const { cloudName, apiKey, apiSecret } = config.cloudinary;
        if (cloudName && apiKey && apiSecret) {
          return new CloudinaryStorageProvider({ cloudName, apiKey, apiSecret });
        }
        new Logger('StorageModule').warn(
          'Cloudinary not configured — using local disk storage (dev only)',
        );
        return new LocalStorageProvider(UPLOADS_DIR, config.publicApiUrl);
      },
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
