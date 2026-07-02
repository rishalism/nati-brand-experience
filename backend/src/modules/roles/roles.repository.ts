import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const roleInclude = {
  permissions: { include: { permission: true } },
} satisfies Prisma.RoleInclude;

export type RoleWithPermissions = Prisma.RoleGetPayload<{ include: typeof roleInclude }>;

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  listRoles(): Promise<RoleWithPermissions[]> {
    return this.prisma.role.findMany({
      where: { deletedAt: null },
      include: roleInclude,
      orderBy: { name: 'asc' },
    });
  }

  findByName(name: string): Promise<RoleWithPermissions | null> {
    return this.prisma.role.findFirst({ where: { name, deletedAt: null }, include: roleInclude });
  }

  listPermissions() {
    return this.prisma.permission.findMany({ orderBy: { name: 'asc' } });
  }

  async setPermissions(roleId: string, permissionNames: string[]): Promise<RoleWithPermissions> {
    const permissions = await this.prisma.permission.findMany({
      where: { name: { in: permissionNames } },
      select: { id: true },
    });
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId, permissionId: p.id })),
        skipDuplicates: true,
      }),
    ]);
    return this.prisma.role.findUniqueOrThrow({ where: { id: roleId }, include: roleInclude });
  }
}
