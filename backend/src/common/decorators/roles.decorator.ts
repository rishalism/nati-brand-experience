import { SetMetadata } from '@nestjs/common';
import type { Role } from '@nati/shared';

export const ROLES_KEY = 'roles';

/** Restricts a route to the given roles. Enforced by RolesGuard (Phase 2). */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
