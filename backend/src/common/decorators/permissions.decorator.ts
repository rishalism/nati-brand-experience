import { SetMetadata } from '@nestjs/common';
import type { Permission } from '@nati/shared';

export const PERMISSIONS_KEY = 'permissions';

/** Requires the caller to hold ALL listed permissions. Enforced by
 * PermissionsGuard. Complements @Roles for fine-grained access. */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
