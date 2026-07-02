import { Injectable, NotFoundException } from '@nestjs/common';
import type { Permission } from '@nati/shared';
import { RolesRepository, type RoleWithPermissions } from './roles.repository';

export interface RoleView {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
}

@Injectable()
export class RolesService {
  constructor(private readonly repo: RolesRepository) {}

  private toView(role: RoleWithPermissions): RoleView {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions.map((rp) => rp.permission.name),
    };
  }

  async listRoles(): Promise<RoleView[]> {
    const roles = await this.repo.listRoles();
    return roles.map((r) => this.toView(r));
  }

  listPermissions() {
    return this.repo.listPermissions();
  }

  async setRolePermissions(roleId: string, permissions: Permission[]): Promise<RoleView> {
    const role = await this.repo.setPermissions(roleId, permissions);
    if (!role) throw new NotFoundException('Role not found');
    return this.toView(role);
  }
}
