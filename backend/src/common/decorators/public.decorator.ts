import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marks a route as accessible without authentication. The global JWT auth
 * guard (added in Phase 2) skips routes carrying this metadata. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
