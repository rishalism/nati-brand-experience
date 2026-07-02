import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Permission } from '@nati/shared';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { AuthUser } from '../interfaces/auth-user.interface';

/** Allows a request only if the user holds ALL permissions required by
 * @RequirePermissions(). Routes without it are unrestricted (permission-wise). */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const granted = new Set(user?.permissions ?? []);
    if (required.every((permission) => granted.has(permission))) return true;

    throw new ForbiddenException('Insufficient permissions');
  }
}
